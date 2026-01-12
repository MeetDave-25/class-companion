import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/database.js';

// Import routes
import authRouter from './routes/auth.js';
import studentsRouter from './routes/students.js';
import subjectsRouter from './routes/subjects.js';
import attendanceRouter from './routes/attendance.js';
import marksRouter from './routes/marks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            database: 'disconnected',
            error: error.message
        });
    }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/students', studentsRouter);
app.use('/api/subjects', subjectsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/marks', marksRouter);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'AttendEasy API Server',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            students: '/api/students',
            subjects: '/api/subjects',
            attendance: '/api/attendance',
            marks: '/api/marks'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected error occurred',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎓 AttendEasy API Server                           ║
║                                                       ║
║   🚀 Server running on: http://localhost:${PORT}       ║
║   📊 Environment: ${process.env.NODE_ENV || 'development'}                      ║
║   🗄️  Database: Connected to Neon PostgreSQL         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

export default app;
