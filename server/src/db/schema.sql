-- AttendEasy Database Schema
-- PostgreSQL Database for Attendance Management System

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance_sessions CASCADE;
DROP TABLE IF EXISTS test_marks CASCADE;
DROP TABLE IF EXISTS timetable_entries CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table (for authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  roll_number VARCHAR(50) UNIQUE NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 2),
  teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance sessions table (QR code sessions)
CREATE TABLE attendance_sessions (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  qr_code TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  allowed_radius INTEGER DEFAULT 50,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance records table (individual attendance marks)
CREATE TABLE attendance_records (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  location_accuracy DECIMAL(10, 2),
  UNIQUE(session_id, student_id)
);

-- Test marks table
CREATE TABLE test_marks (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  test_name VARCHAR(255) NOT NULL,
  max_marks INTEGER NOT NULL CHECK (max_marks > 0),
  obtained_marks INTEGER NOT NULL CHECK (obtained_marks >= 0),
  test_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable entries table
CREATE TABLE timetable_entries (
  id SERIAL PRIMARY KEY,
  subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100),
  year INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_students_roll_number ON students(roll_number);
CREATE INDEX idx_students_year ON students(year);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_year ON subjects(year);
CREATE INDEX idx_attendance_session ON attendance_records(session_id);
CREATE INDEX idx_attendance_student ON attendance_records(student_id);
CREATE INDEX idx_marks_student ON test_marks(student_id);
CREATE INDEX idx_marks_subject ON test_marks(subject_id);
CREATE INDEX idx_sessions_subject ON attendance_sessions(subject_id);
CREATE INDEX idx_sessions_active ON attendance_sessions(is_active);
CREATE INDEX idx_timetable_year ON timetable_entries(year);

-- Insert sample data for testing
-- Sample teacher user
INSERT INTO users (email, password_hash, role) VALUES
('teacher@college.edu', '$2a$10$YourHashedPasswordHere', 'teacher');

-- Sample subjects
INSERT INTO subjects (name, code, year, semester, teacher_id) VALUES
('Programming Fundamentals', 'CS101', 1, 1, 1),
('Data Structures', 'CS201', 1, 2, 1),
('Algorithms', 'CS301', 2, 1, 1),
('Database Systems', 'CS302', 2, 1, 1),
('Operating Systems', 'CS401', 3, 1, 1),
('Computer Networks', 'CS402', 3, 2, 1),
('Machine Learning', 'CS501', 4, 1, 1),
('Cloud Computing', 'CS502', 4, 2, 1);

-- Sample students
INSERT INTO students (name, roll_number, year, email) VALUES
('Alice Johnson', '2024CS001', 1, 'alice@college.edu'),
('Bob Smith', '2024CS002', 1, 'bob@college.edu'),
('Charlie Brown', '2024CS003', 1, 'charlie@college.edu'),
('Diana Ross', '2023CS001', 2, 'diana@college.edu'),
('Edward Wilson', '2023CS002', 2, 'edward@college.edu'),
('Fiona Apple', '2022CS001', 3, 'fiona@college.edu'),
('George Martin', '2022CS002', 3, 'george@college.edu'),
('Hannah Lee', '2021CS001', 4, 'hannah@college.edu');

-- Sample test marks
INSERT INTO test_marks (student_id, subject_id, test_name, max_marks, obtained_marks, test_date) VALUES
(1, 1, 'Mid-term', 100, 85, '2026-01-05'),
(2, 1, 'Mid-term', 100, 72, '2026-01-05'),
(3, 1, 'Mid-term', 100, 90, '2026-01-05'),
(4, 3, 'Quiz 1', 50, 42, '2026-01-06'),
(5, 3, 'Quiz 1', 50, 38, '2026-01-06');

COMMENT ON TABLE users IS 'User accounts for authentication';
COMMENT ON TABLE students IS 'Student profiles and information';
COMMENT ON TABLE subjects IS 'Course subjects';
COMMENT ON TABLE attendance_sessions IS 'QR code attendance sessions';
COMMENT ON TABLE attendance_records IS 'Individual attendance marks';
COMMENT ON TABLE test_marks IS 'Student test scores';
COMMENT ON TABLE timetable_entries IS 'Class schedule entries';
