import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, QrCode, Power, PowerOff, Users, Timer, MapPin, Navigation, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Subject } from "@/types";
import { attendanceAPI } from "@/lib/api";
import { toast } from "sonner";

interface QRGeneratorProps {
  subjects: Subject[];
  onAttendanceMarked: (studentId: string, subjectId: string) => void;
}

const QRGenerator = ({ subjects, onAttendanceMarked }: QRGeneratorProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [duration, setDuration] = useState<number>(5);
  const [isActive, setIsActive] = useState(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [presentCount, setPresentCount] = useState(0);
  const [allowedRadius, setAllowedRadius] = useState<number>(50);
  const [teacherLocation, setTeacherLocation] = useState<GeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const requestTeacherLocation = () => {
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTeacherLocation(position.coords);
        setLocationError(null);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("Unknown error occurred");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const generateQRCode = useCallback(() => {
    const sessionId = `${selectedSubject}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrData = JSON.stringify({
      sessionId,
      subjectId: selectedSubject,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration * 60 * 1000,
      locationRequired: true,
      allowedLocation: teacherLocation ? {
        latitude: teacherLocation.latitude,
        longitude: teacherLocation.longitude,
        radius: allowedRadius,
      } : undefined,
    });
    return { sessionId, qrCode: btoa(qrData) };
  }, [selectedSubject, duration, teacherLocation, allowedRadius]);

  const startSession = async () => {
    if (!selectedSubject || !teacherLocation) return;

    try {
      const { sessionId, qrCode: newQrCode } = generateQRCode();
      const now = new Date();
      const endTime = new Date(now.getTime() + duration * 60 * 1000);

      // Save session to database
      const response = await attendanceAPI.createSession({
        subjectId: selectedSubject,
        qrCode: newQrCode,
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        locationLat: teacherLocation.latitude,
        locationLng: teacherLocation.longitude,
        allowedRadius: allowedRadius,
      });

      setCurrentSessionId(response.data.id);
      setQrCode(newQrCode);
      setTimeLeft(duration * 60);
      setIsActive(true);
      setPresentCount(0);
      toast.success("Attendance session started");
    } catch (error: any) {
      toast.error(error.message || "Failed to start session");
      console.error("Error starting session:", error);
    }
  };

  const stopSession = async () => {
    if (currentSessionId) {
      try {
        await attendanceAPI.stopSession(currentSessionId);
        toast.success("Session stopped");
      } catch (error) {
        console.error("Error stopping session:", error);
      }
    }
    setIsActive(false);
    setQrCode("");
    setTimeLeft(0);
    setCurrentSessionId(null);
  };

  // Countdown timer
  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setQrCode("");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = timeLeft / (duration * 60);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-2xl shadow-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl gradient-primary">
            <QrCode className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">QR Attendance</h2>
            <p className="text-sm text-muted-foreground">Generate time-limited QR codes</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={isActive}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                disabled={isActive}
              />
            </div>
          </div>

          {/* Location Configuration */}
          <div className="p-4 rounded-xl bg-secondary/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="mb-0">Location-Based Attendance</Label>
              </div>
              {!isActive && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestTeacherLocation}
                  disabled={isActive}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Location
                </Button>
              )}
            </div>

            {teacherLocation ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-success">
                  <MapPin className="w-4 h-4" />
                  <span>Location captured (Accuracy: {Math.round(teacherLocation.accuracy)}m)</span>
                </div>
                <div className="space-y-2">
                  <Label>Allowed Radius (meters)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={1000}
                    step={10}
                    value={allowedRadius}
                    onChange={(e) => setAllowedRadius(Number(e.target.value))}
                    disabled={isActive}
                    placeholder="50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Students must be within {allowedRadius}m to mark attendance
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>{locationError || "Click 'Get Location' to enable geofencing"}</span>
              </div>
            )}
          </div>

          <div className="flex items-end">
            {isActive ? (
              <Button
                onClick={stopSession}
                variant="destructive"
                className="w-full"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Stop Session
              </Button>
            ) : (
              <Button
                onClick={startSession}
                disabled={!selectedSubject || !teacherLocation}
                className="w-full gradient-primary border-0"
              >
                <Power className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* QR Code Display */}
      <AnimatePresence>
        {isActive && qrCode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-card p-8 rounded-2xl shadow-card"
          >
            <div className="flex flex-col md:flex-row gap-8 items-center">
              {/* QR Code */}
              <div className="relative">
                <div className="p-6 bg-card rounded-2xl border-4 border-primary/20">
                  <QRCodeSVG
                    value={qrCode}
                    size={220}
                    level="H"
                    includeMargin
                    className="rounded-lg"
                  />
                </div>
                {/* Progress ring */}
                <svg
                  className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)]"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${progress * 302} 302`}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000"
                  />
                </svg>
              </div>

              {/* Stats */}
              <div className="flex-1 space-y-6">
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground mb-1">Subject</p>
                  <p className="text-2xl font-bold">
                    {subjects.find((s) => s.id === selectedSubject)?.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-secondary">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Timer className="w-4 h-4" />
                      <span className="text-sm">Time Left</span>
                    </div>
                    <p className="text-3xl font-bold font-mono">
                      {formatTime(timeLeft)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/10">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Geofencing</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {allowedRadius}m
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-success/10">
                    <div className="flex items-center gap-2 text-success mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Present</span>
                    </div>
                    <p className="text-3xl font-bold text-success">
                      {presentCount}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-warning/10 border border-warning/20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-warning" />
                    <div>
                      <p className="font-medium text-warning">Auto-expires</p>
                      <p className="text-sm text-muted-foreground">
                        QR code will deactivate when timer ends
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRGenerator;
