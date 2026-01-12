# AttendEasy Backend Server

Backend API for the AttendEasy attendance management system.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file has been created with your Neon PostgreSQL connection. If you need to update it:

```env
DATABASE_URL=postgresql://neondb_owner:npg_M0K7oNkcICQx@ep-aged-dust-afdeod9a-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
PORT=3000
NODE_ENV=development
JWT_SECRET=attendeasy-super-secret-key-change-in-production-2024
JWT_EXPIRY=24h
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:5173
```

**Note**: Remove `&channel_binding=require` from the DATABASE_URL if you encounter connection issues.

### 3. Initialize Database

```bash
npm run db:setup
```

This will:
- Create all necessary tables
- Set up indexes
- Insert sample data (8 students, 8 subjects, 5 test marks)

### 4. Start the Server

**Development mode (with auto-reload)**:
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create new subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject

### Attendance
- `POST /api/attendance/sessions` - Create QR session
- `GET /api/attendance/sessions` - Get all sessions
- `GET /api/attendance/sessions/:id` - Get session details
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `PATCH /api/attendance/sessions/:id/stop` - Stop session

### Marks
- `GET /api/marks` - Get all marks
- `POST /api/marks` - Create marks
- `PUT /api/marks/:id` - Update marks
- `DELETE /api/marks/:id` - Delete marks
- `GET /api/marks/student/:studentId/summary` - Get student summary

## Testing the API

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get all students
curl http://localhost:3000/api/students

# Get all subjects
curl http://localhost:3000/api/subjects

# Create a student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","rollNumber":"2024CS009","year":1,"email":"john@college.edu"}'
```

## Database Schema

The database includes the following tables:
- `users` - User authentication
- `students` - Student profiles
- `subjects` - Course subjects
- `attendance_sessions` - QR code sessions
- `attendance_records` - Attendance marks
- `test_marks` - Test scores
- `timetable_entries` - Class schedules

## Troubleshooting

### Connection Issues

If you get connection errors, try:

1. **Remove channel_binding parameter**:
   Update `.env` to remove `&channel_binding=require` from DATABASE_URL

2. **Check Neon database status**:
   Visit your Neon dashboard to ensure the database is active

3. **Verify credentials**:
   Make sure the connection string is correct

### Port Already in Use

If port 3000 is in use, change it in `.env`:
```env
PORT=3001
```

## Next Steps

1. ✅ Backend server created
2. ✅ Database schema defined
3. ⏳ Initialize database (run `npm run db:setup`)
4. ⏳ Start server (run `npm run dev`)
5. ⏳ Integrate with frontend
