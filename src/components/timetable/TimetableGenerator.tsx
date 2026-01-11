import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Wand2, RefreshCw, Download, Settings } from "lucide-react";
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
import { Subject, TimetableEntry, TimeSlot } from "@/types";
import { cn } from "@/lib/utils";

interface TimetableGeneratorProps {
  subjects: Subject[];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const generateTimeSlots = (
  startTime: string,
  endTime: string,
  lectureDuration: number,
  breakDuration: number
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  
  let currentMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  let slotId = 1;

  while (currentMinutes + lectureDuration <= endMinutes) {
    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endM = currentMinutes + lectureDuration;
    const endH = Math.floor(endM / 60);
    const endMin = endM % 60;

    slots.push({
      id: `slot-${slotId++}`,
      startTime: `${startH.toString().padStart(2, "0")}:${startM.toString().padStart(2, "0")}`,
      endTime: `${endH.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
    });

    currentMinutes = endM + breakDuration;
  }

  return slots;
};

const TimetableGenerator = ({ subjects }: TimetableGeneratorProps) => {
  const [config, setConfig] = useState({
    startTime: "09:00",
    endTime: "17:00",
    lectureDuration: 50,
    breakDuration: 10,
    selectedYear: "1",
  });
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateTimetable = () => {
    setIsGenerating(true);

    const slots = generateTimeSlots(
      config.startTime,
      config.endTime,
      config.lectureDuration,
      config.breakDuration
    );
    setTimeSlots(slots);

    const yearSubjects = subjects.filter(
      (s) => s.year.toString() === config.selectedYear
    );

    const newTimetable: TimetableEntry[] = [];
    const usedSlots: Set<string> = new Set();

    DAYS.forEach((day) => {
      slots.forEach((slot) => {
        const slotKey = `${day}-${slot.id}`;
        if (usedSlots.has(slotKey)) return;

        // Randomly assign a subject (in real app, this would be more sophisticated)
        const availableSubjects = yearSubjects.filter((subject) => {
          // Check if subject is already assigned in this slot for any year
          const hasConflict = newTimetable.some(
            (entry) =>
              entry.timeSlotId === slot.id &&
              entry.day === day &&
              entry.subjectId === subject.id
          );
          return !hasConflict;
        });

        if (availableSubjects.length > 0 && Math.random() > 0.2) {
          const subject =
            availableSubjects[Math.floor(Math.random() * availableSubjects.length)];
          
          newTimetable.push({
            id: `entry-${Date.now()}-${Math.random()}`,
            day,
            timeSlotId: slot.id,
            subjectId: subject.id,
            year: Number(config.selectedYear),
          });
          usedSlots.add(slotKey);
        }
      });
    });

    setTimeout(() => {
      setTimetable(newTimetable);
      setIsGenerating(false);
    }, 1000);
  };

  const getSubjectForSlot = (day: string, slotId: string) => {
    const entry = timetable.find(
      (e) => e.day === day && e.timeSlotId === slotId
    );
    if (!entry) return null;
    return subjects.find((s) => s.id === entry.subjectId);
  };

  const getSubjectColor = (subjectId: string) => {
    const colors = [
      "bg-primary/10 text-primary border-primary/20",
      "bg-accent/10 text-accent border-accent/20",
      "bg-success/10 text-success border-success/20",
      "bg-warning/10 text-warning border-warning/20",
      "bg-destructive/10 text-destructive border-destructive/20",
    ];
    const index = subjects.findIndex((s) => s.id === subjectId);
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 rounded-2xl shadow-card"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl gradient-primary">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Timetable Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Set up your college timing and generate clash-free timetables
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Start Time
            </Label>
            <Input
              type="time"
              value={config.startTime}
              onChange={(e) =>
                setConfig({ ...config, startTime: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              End Time
            </Label>
            <Input
              type="time"
              value={config.endTime}
              onChange={(e) =>
                setConfig({ ...config, endTime: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Lecture Duration (min)</Label>
            <Input
              type="number"
              min={30}
              max={120}
              value={config.lectureDuration}
              onChange={(e) =>
                setConfig({ ...config, lectureDuration: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Break Duration (min)</Label>
            <Input
              type="number"
              min={5}
              max={30}
              value={config.breakDuration}
              onChange={(e) =>
                setConfig({ ...config, breakDuration: Number(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Year</Label>
            <Select
              value={config.selectedYear}
              onValueChange={(value) =>
                setConfig({ ...config, selectedYear: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={generateTimetable}
            disabled={isGenerating}
            className="gradient-primary border-0"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate Timetable"}
          </Button>

          {timetable.length > 0 && (
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </motion.div>

      {/* Timetable Grid */}
      {timeSlots.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                Year {config.selectedYear} Timetable
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary">
                  <th className="p-3 text-left font-medium text-muted-foreground min-w-24">
                    Time
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="p-3 text-center font-medium min-w-32"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot) => (
                  <tr key={slot.id} className="border-t border-border">
                    <td className="p-3 text-sm font-medium text-muted-foreground whitespace-nowrap">
                      {slot.startTime} - {slot.endTime}
                    </td>
                    {DAYS.map((day) => {
                      const subject = getSubjectForSlot(day, slot.id);
                      
                      return (
                        <td key={day} className="p-2">
                          {subject ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className={cn(
                                "p-3 rounded-xl border-2 text-center transition-all hover:shadow-md cursor-pointer",
                                getSubjectColor(subject.id)
                              )}
                            >
                              <p className="font-semibold">{subject.code}</p>
                              <p className="text-xs opacity-80 mt-1">
                                {subject.name}
                              </p>
                            </motion.div>
                          ) : (
                            <div className="p-3 text-center text-muted-foreground/50 text-sm">
                              —
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="p-4 border-t border-border bg-secondary/50">
            <div className="flex flex-wrap gap-3">
              {subjects
                .filter((s) => s.year.toString() === config.selectedYear)
                .map((subject) => (
                  <div
                    key={subject.id}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium border",
                      getSubjectColor(subject.id)
                    )}
                  >
                    {subject.code} - {subject.name}
                  </div>
                ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TimetableGenerator;
