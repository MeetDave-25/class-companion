import { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import QRGenerator from "@/components/attendance/QRGenerator";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import SubjectManager from "@/components/subjects/SubjectManager";
import StudentManager from "@/components/students/StudentManager";
import MarksManager from "@/components/marks/MarksManager";
import TimetableGenerator from "@/components/timetable/TimetableGenerator";
import DataExport from "@/components/export/DataExport";
import { Subject, Student, TestMark } from "@/types";

// Sample data
const initialSubjects: Subject[] = [
  { id: "cs101", name: "Programming Fundamentals", code: "CS101", year: 1, semester: 1 },
  { id: "cs102", name: "Data Structures", code: "CS201", year: 1, semester: 2 },
  { id: "cs201", name: "Algorithms", code: "CS301", year: 2, semester: 1 },
  { id: "cs202", name: "Database Systems", code: "CS302", year: 2, semester: 1 },
  { id: "cs301", name: "Operating Systems", code: "CS401", year: 3, semester: 1 },
  { id: "cs302", name: "Computer Networks", code: "CS402", year: 3, semester: 2 },
  { id: "cs401", name: "Machine Learning", code: "CS501", year: 4, semester: 1 },
  { id: "cs402", name: "Cloud Computing", code: "CS502", year: 4, semester: 2 },
];

const initialStudents: Student[] = [
  { id: "s1", name: "Alice Johnson", rollNumber: "2024CS001", year: 1, email: "alice@college.edu" },
  { id: "s2", name: "Bob Smith", rollNumber: "2024CS002", year: 1, email: "bob@college.edu" },
  { id: "s3", name: "Charlie Brown", rollNumber: "2024CS003", year: 1, email: "charlie@college.edu" },
  { id: "s4", name: "Diana Ross", rollNumber: "2023CS001", year: 2, email: "diana@college.edu" },
  { id: "s5", name: "Edward Wilson", rollNumber: "2023CS002", year: 2, email: "edward@college.edu" },
  { id: "s6", name: "Fiona Apple", rollNumber: "2022CS001", year: 3, email: "fiona@college.edu" },
  { id: "s7", name: "George Martin", rollNumber: "2022CS002", year: 3, email: "george@college.edu" },
  { id: "s8", name: "Hannah Lee", rollNumber: "2021CS001", year: 4, email: "hannah@college.edu" },
];

const initialAttendance: Record<string, Record<string, boolean>> = {
  s1: { cs101: true, cs102: true },
  s2: { cs101: true, cs102: false },
  s3: { cs101: false, cs102: true },
  s4: { cs201: true, cs202: true },
  s5: { cs201: true, cs202: true },
  s6: { cs301: true, cs302: false },
  s7: { cs301: true, cs302: true },
  s8: { cs401: true, cs402: true },
};

const initialMarks: TestMark[] = [
  { id: "m1", studentId: "s1", subjectId: "cs101", testName: "Mid-term", maxMarks: 100, obtainedMarks: 85, date: new Date() },
  { id: "m2", studentId: "s2", subjectId: "cs101", testName: "Mid-term", maxMarks: 100, obtainedMarks: 72, date: new Date() },
  { id: "m3", studentId: "s3", subjectId: "cs101", testName: "Mid-term", maxMarks: 100, obtainedMarks: 90, date: new Date() },
  { id: "m4", studentId: "s4", subjectId: "cs201", testName: "Quiz 1", maxMarks: 50, obtainedMarks: 42, date: new Date() },
  { id: "m5", studentId: "s5", subjectId: "cs201", testName: "Quiz 1", maxMarks: 50, obtainedMarks: 38, date: new Date() },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, boolean>>>(initialAttendance);
  const [marks, setMarks] = useState<TestMark[]>(initialMarks);

  // Subject handlers
  const handleAddSubject = (subject: Omit<Subject, "id">) => {
    const newSubject = { ...subject, id: `subject-${Date.now()}` };
    setSubjects([...subjects, newSubject]);
  };

  const handleUpdateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // Student handlers
  const handleAddStudent = (student: Omit<Student, "id">) => {
    const newStudent = { ...student, id: `student-${Date.now()}` };
    setStudents([...students, newStudent]);
  };

  const handleUpdateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(students.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  // Attendance handlers
  const handleToggleAttendance = (studentId: string, subjectId: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: !prev[studentId]?.[subjectId],
      },
    }));
  };

  const handleAttendanceMarked = useCallback((studentId: string, subjectId: string) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: true,
      },
    }));
  }, []);

  // Marks handlers
  const handleAddMark = (mark: Omit<TestMark, "id">) => {
    const newMark = { ...mark, id: `mark-${Date.now()}` };
    setMarks([...marks, newMark]);
  };

  const handleUpdateMark = (id: string, updates: Partial<TestMark>) => {
    setMarks(marks.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDeleteMark = (id: string) => {
    setMarks(marks.filter((m) => m.id !== id));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            students={students}
            subjects={subjects}
            marks={marks}
            attendanceData={attendanceData}
          />
        );
      case "attendance":
        return (
          <div className="space-y-6">
            <QRGenerator
              subjects={subjects}
              onAttendanceMarked={handleAttendanceMarked}
            />
            <AttendanceTable
              students={students}
              subjects={subjects}
              attendanceData={attendanceData}
              onToggleAttendance={handleToggleAttendance}
            />
          </div>
        );
      case "students":
        return (
          <StudentManager
            students={students}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        );
      case "subjects":
        return (
          <SubjectManager
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        );
      case "marks":
        return (
          <MarksManager
            students={students}
            subjects={subjects}
            marks={marks}
            onAddMark={handleAddMark}
            onUpdateMark={handleUpdateMark}
            onDeleteMark={handleDeleteMark}
          />
        );
      case "timetable":
        return <TimetableGenerator subjects={subjects} />;
      case "export":
        return (
          <DataExport
            subjects={subjects}
            students={students}
            marks={marks}
            attendanceData={attendanceData}
          />
        );
      default:
        return <DashboardOverview students={students} subjects={subjects} marks={marks} attendanceData={attendanceData} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="md:ml-64 min-h-screen">
        <div className="p-6 md:p-8 pt-16 md:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
