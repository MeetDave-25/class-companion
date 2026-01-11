import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/layout/Sidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import QRGenerator from "@/components/attendance/QRGenerator";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import SessionList from "@/components/attendance/SessionList";
import SessionDetails from "@/components/attendance/SessionDetails";
import SubjectManager from "@/components/subjects/SubjectManager";
import StudentManager from "@/components/students/StudentManager";
import MarksManager from "@/components/marks/MarksManager";
import TimetableGenerator from "@/components/timetable/TimetableGenerator";
import DataExport from "@/components/export/DataExport";
import { Subject, Student, TestMark, AttendanceSession } from "@/types";
import { studentsAPI, subjectsAPI, marksAPI, attendanceAPI } from "@/lib/api";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceData, setAttendanceData] = useState<Record<string, Record<string, boolean>>>({});
  const [marks, setMarks] = useState<TestMark[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStudents(),
        fetchSubjects(),
        fetchMarks(),
        fetchSessions(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll();
      const studentsData = response.data.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        rollNumber: s.roll_number,
        year: s.year,
        email: s.email,
      }));
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectsAPI.getAll();
      const subjectsData = response.data.map((s: any) => ({
        id: s.id.toString(),
        name: s.name,
        code: s.code,
        year: s.year,
        semester: s.semester,
      }));
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchMarks = async () => {
    try {
      const response = await marksAPI.getAll();
      const marksData = response.data.map((m: any) => ({
        id: m.id.toString(),
        studentId: m.student_id.toString(),
        subjectId: m.subject_id.toString(),
        testName: m.test_name,
        maxMarks: m.max_marks,
        obtainedMarks: m.obtained_marks,
        date: new Date(m.test_date),
      }));
      setMarks(marksData);
    } catch (error) {
      console.error("Error fetching marks:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await attendanceAPI.getSessions();
      const sessionsData = response.data.map((s: any) => ({
        id: s.id.toString(),
        subjectId: s.subject_id.toString(),
        subjectName: s.subject_name,
        subjectCode: s.subject_code,
        date: new Date(s.start_time),
        startTime: new Date(s.start_time),
        endTime: new Date(s.end_time),
        qrCode: s.qr_code,
        expiresAt: new Date(s.end_time),
        isActive: s.is_active,
        location: s.location_lat && s.location_lng ? {
          latitude: parseFloat(s.location_lat),
          longitude: parseFloat(s.location_lng),
          radius: s.allowed_radius,
        } : undefined,
        presentStudents: [],
        studentsPresent: [],
      }));
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  // Subject handlers
  const handleAddSubject = async (subject: Omit<Subject, "id">) => {
    try {
      await subjectsAPI.create(subject);
      toast.success("Subject created successfully");
      await fetchSubjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to create subject");
    }
  };

  const handleUpdateSubject = async (id: string, updates: Partial<Subject>) => {
    try {
      await subjectsAPI.update(id, updates);
      toast.success("Subject updated successfully");
      await fetchSubjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to update subject");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await subjectsAPI.delete(id);
      toast.success("Subject deleted successfully");
      await fetchSubjects();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete subject");
    }
  };

  // Student handlers
  const handleAddStudent = async (student: Omit<Student, "id">) => {
    try {
      await studentsAPI.create(student);
      toast.success("Student created successfully");
      await fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to create student");
    }
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      await studentsAPI.update(id, updates);
      toast.success("Student updated successfully");
      await fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await studentsAPI.delete(id);
      toast.success("Student deleted successfully");
      await fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete student");
    }
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
  const handleAddMark = async (mark: Omit<TestMark, "id">) => {
    try {
      await marksAPI.create({
        studentId: mark.studentId,
        subjectId: mark.subjectId,
        testName: mark.testName,
        maxMarks: mark.maxMarks,
        obtainedMarks: mark.obtainedMarks,
        testDate: mark.date.toISOString().split('T')[0],
      });
      toast.success("Marks added successfully");
      await fetchMarks();
    } catch (error: any) {
      toast.error(error.message || "Failed to add marks");
    }
  };

  const handleUpdateMark = async (id: string, updates: Partial<TestMark>) => {
    try {
      await marksAPI.update(id, {
        obtainedMarks: updates.obtainedMarks,
        maxMarks: updates.maxMarks,
        testName: updates.testName,
      });
      toast.success("Marks updated successfully");
      await fetchMarks();
    } catch (error: any) {
      toast.error(error.message || "Failed to update marks");
    }
  };

  const handleDeleteMark = async (id: string) => {
    try {
      await marksAPI.delete(id);
      toast.success("Marks deleted successfully");
      await fetchMarks();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete marks");
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading data from database...</p>
          </div>
        </div>
      );
    }

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
      case "sessions":
        if (selectedSession) {
          return (
            <SessionDetails
              session={selectedSession}
              onBack={() => setSelectedSession(null)}
            />
          );
        }
        return (
          <SessionList
            sessions={sessions}
            onSessionClick={setSelectedSession}
          />
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
