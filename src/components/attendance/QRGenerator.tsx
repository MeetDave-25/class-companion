import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, QrCode, Power, PowerOff, Users, Timer } from "lucide-react";
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

  const generateQRCode = useCallback(() => {
    const sessionId = `${selectedSubject}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrData = JSON.stringify({
      sessionId,
      subjectId: selectedSubject,
      timestamp: Date.now(),
      expiresAt: Date.now() + duration * 60 * 1000,
      locationRequired: true,
    });
    return btoa(qrData);
  }, [selectedSubject, duration]);

  const startSession = () => {
    if (!selectedSubject) return;
    
    const newQrCode = generateQRCode();
    setQrCode(newQrCode);
    setTimeLeft(duration * 60);
    setIsActive(true);
    setPresentCount(0);
  };

  const stopSession = () => {
    setIsActive(false);
    setQrCode("");
    setTimeLeft(0);
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

  // Simulate students marking attendance
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setPresentCount((prev) => prev + 1);
        onAttendanceMarked(`student-${Date.now()}`, selectedSubject);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, selectedSubject, onAttendanceMarked]);

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

        <div className="grid gap-4 md:grid-cols-3">
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
                disabled={!selectedSubject}
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
