export interface Subject {
  id: string;
  name: string;
  code: string;
  year: number;
  semester: number;
}

export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  year: number;
  email: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectName?: string;
  subjectCode?: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  qrCode: string;
  expiresAt: Date;
  isActive: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  presentStudents: string[];
  studentsPresent?: SessionAttendance[];
}

export interface SessionAttendance {
  studentId: string;
  studentName: string;
  rollNumber: string;
  year: number;
  markedAt: Date;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  subjectId: string;
  date: Date;
  status: 'present' | 'absent';
  sessionId: string;
}

export interface TestMark {
  id: string;
  studentId: string;
  subjectId: string;
  testName: string;
  maxMarks: number;
  obtainedMarks: number;
  date: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

export interface TimetableEntry {
  id: string;
  day: string;
  timeSlotId: string;
  subjectId: string;
  year: number;
  room?: string;
}

export interface TimetableConfig {
  startTime: string;
  endTime: string;
  lectureCount: number;
  lectureDuration: number;
  breakDuration: number;
  subjects: Subject[];
  years: number[];
}
