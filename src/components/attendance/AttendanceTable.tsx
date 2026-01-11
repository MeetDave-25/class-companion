import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === "all" || student.year.toString() === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

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
            {paginatedStudents.map((student, index) => {
              const percentage = calculateAttendancePercentage(student.id);
              const globalIndex = startIndex + index;

              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {globalIndex + 1}
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

      {/* Pagination Controls */}
      {filteredStudents.length > 0 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Select value={itemsPerPage.toString()} onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
                <SelectItem value="100">100 per page</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-sm font-medium">{currentPage}</span>
                <span className="text-sm text-muted-foreground">of {totalPages}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {filteredStudents.length === 0 && (
        <div className="p-12 text-center">
          <p className="text-muted-foreground">No students found matching your criteria</p>
        </div>
      )}
    </motion.div>
  );
};

export default AttendanceTable;
