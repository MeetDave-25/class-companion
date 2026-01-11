import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Student, Subject } from "@/types";
import { cn } from "@/lib/utils";

interface AttendanceTableProps {
  students: Student[];
  subjects: Subject[];
  attendanceData: Record<string, Record<string, boolean>>;
  onToggleAttendance: (studentId: string, subjectId: string) => void;
}

const AttendanceTable = ({
  students,
  subjects,
  attendanceData,
  onToggleAttendance,
}: AttendanceTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === "all" || student.year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  const displaySubjects = selectedSubject === "all" 
    ? subjects 
    : subjects.filter(s => s.id === selectedSubject);

  const calculateAttendancePercentage = (studentId: string) => {
    const studentAttendance = attendanceData[studentId] || {};
    const totalClasses = subjects.length;
    const presentClasses = Object.values(studentAttendance).filter(Boolean).length;
    return totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="1">Year 1</SelectItem>
                <SelectItem value="2">Year 2</SelectItem>
                <SelectItem value="3">Year 3</SelectItem>
                <SelectItem value="4">Year 4</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">#</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Roll No.</TableHead>
              <TableHead className="text-center">Year</TableHead>
              {displaySubjects.map((subject) => (
                <TableHead key={subject.id} className="text-center min-w-20">
                  {subject.code}
                </TableHead>
              ))}
              <TableHead className="text-center">Overall %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.map((student, index) => {
              const percentage = calculateAttendancePercentage(student.id);
              
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {student.rollNumber}
                  </TableCell>
                  <TableCell className="text-center">{student.year}</TableCell>
                  {displaySubjects.map((subject) => {
                    const isPresent = attendanceData[student.id]?.[subject.id];
                    
                    return (
                      <TableCell key={subject.id} className="text-center">
                        <button
                          onClick={() => onToggleAttendance(student.id, subject.id)}
                          className={cn(
                            "w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors",
                            isPresent
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          )}
                        >
                          {isPresent ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <span
                      className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        percentage >= 75
                          ? "bg-success/10 text-success"
                          : percentage >= 50
                          ? "bg-warning/10 text-warning"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {percentage}%
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No students found matching your criteria</p>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceTable;
