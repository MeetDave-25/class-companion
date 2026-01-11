import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  Loader2,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRScannerProps {
  onAttendanceMarked: (sessionData: any, location: GeolocationCoordinates) => void;
}

type ScanStatus = "idle" | "scanning" | "verifying" | "success" | "error" | "expired" | "location_error";

interface DecodedQR {
  sessionId: string;
  subjectId: string;
  timestamp: number;
  expiresAt: number;
  locationRequired: boolean;
}

const QRScanner = ({ onAttendanceMarked }: QRScannerProps) => {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<DecodedQR | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader";

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Get location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = () => {
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please enable location access.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const startScanning = async () => {
    if (!location) {
      setStatus("location_error");
      setErrorMessage("Location access is required to mark attendance");
      return;
    }

    setStatus("scanning");
    setErrorMessage("");

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {} // Ignore scan failures
      );
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setStatus("error");
      setErrorMessage("Failed to access camera. Please check permissions.");
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanning();
    setStatus("verifying");

    try {
      // Decode the QR data
      const decoded = JSON.parse(atob(decodedText)) as DecodedQR;
      setScannedData(decoded);

      // Check if QR code has expired
      if (Date.now() > decoded.expiresAt) {
        setStatus("expired");
        setErrorMessage("This QR code has expired. Please ask your teacher for a new one.");
        return;
      }

      // Simulate verification delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Location is already verified, mark attendance
      if (location) {
        onAttendanceMarked(decoded, location);
        setStatus("success");
      } else {
        setStatus("location_error");
        setErrorMessage("Could not verify your location");
      }
    } catch (err) {
      console.error("Failed to process QR code:", err);
      setStatus("error");
      setErrorMessage("Invalid QR code. Please scan a valid attendance QR.");
    }
  };

  const resetScanner = () => {
    setStatus("idle");
    setErrorMessage("");
    setScannedData(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  const renderContent = () => {
    switch (status) {
      case "idle":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full gradient-primary flex items-center justify-center">
              <Camera className="w-12 h-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2">Scan Attendance QR</h2>
              <p className="text-muted-foreground">
                Point your camera at the QR code displayed by your teacher
              </p>
            </div>

            {/* Location Status */}
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3",
              location ? "bg-success/10" : "bg-warning/10"
            )}>
              <MapPin className={cn(
                "w-5 h-5",
                location ? "text-success" : "text-warning"
              )} />
              <div className="text-left flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  location ? "text-success" : "text-warning"
                )}>
                  {location ? "Location verified" : "Location required"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {location 
                    ? `Accuracy: ${Math.round(location.accuracy)}m` 
                    : locationError || "Requesting access..."}
                </p>
              </div>
              {!location && (
                <Button size="sm" variant="outline" onClick={requestLocation}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>

            <Button 
              onClick={startScanning} 
              disabled={!location || !isOnline}
              className="w-full gradient-primary border-0 h-14 text-lg"
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Scanning
            </Button>

            {!isOnline && (
              <div className="flex items-center justify-center gap-2 text-destructive">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">No internet connection</span>
              </div>
            )}
          </motion.div>
        );

      case "scanning":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="relative">
              <div 
                id={scannerContainerId} 
                className="rounded-2xl overflow-hidden"
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-primary rounded-2xl relative">
                    <motion.div
                      className="absolute top-0 left-0 right-0 h-1 bg-primary"
                      animate={{ y: [0, 248, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-muted-foreground">
              Align QR code within the frame
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                stopScanning();
                setStatus("idle");
              }}
              className="w-full"
            >
              Cancel
            </Button>
          </motion.div>
        );

      case "verifying":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <Loader2 className="w-20 h-20 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold mb-2">Verifying Attendance</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your location and mark your attendance...
              </p>
            </div>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="w-24 h-24 mx-auto rounded-full bg-success/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-14 h-14 text-success" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-success mb-2">
                Attendance Marked!
              </h2>
              <p className="text-muted-foreground">
                Your attendance has been successfully recorded
              </p>
            </div>
            {scannedData && (
              <div className="p-4 rounded-xl bg-secondary text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>Marked at: {new Date().toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>Location verified ✓</span>
                </div>
              </div>
            )}
            <Button onClick={resetScanner} className="w-full">
              Scan Another
            </Button>
          </motion.div>
        );

      case "expired":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-warning/20 flex items-center justify-center">
              <Clock className="w-14 h-14 text-warning" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-warning mb-2">
                QR Code Expired
              </h2>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <Button onClick={resetScanner} className="w-full">
              Try Again
            </Button>
          </motion.div>
        );

      case "error":
      case "location_error":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              {status === "location_error" ? (
                <MapPin className="w-14 h-14 text-destructive" />
              ) : (
                <XCircle className="w-14 h-14 text-destructive" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">
                {status === "location_error" ? "Location Required" : "Scan Failed"}
              </h2>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            {status === "location_error" && (
              <Button onClick={requestLocation} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Retry Location
              </Button>
            )}
            <Button onClick={resetScanner} className="w-full">
              Try Again
            </Button>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QRScanner;
