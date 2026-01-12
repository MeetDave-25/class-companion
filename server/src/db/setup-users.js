import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

async function setupUsers() {
    console.log('🔧 Setting up users...\n');

    try {
        // Clear all existing data
        console.log('🗑️  Clearing existing data...');
        await pool.query('TRUNCATE TABLE attendance_records CASCADE');
        await pool.query('TRUNCATE TABLE attendance_sessions CASCADE');
        await pool.query('TRUNCATE TABLE test_marks CASCADE');
        await pool.query('TRUNCATE TABLE timetable_entries CASCADE');
        await pool.query('TRUNCATE TABLE students CASCADE');
        await pool.query('TRUNCATE TABLE subjects CASCADE');
        await pool.query('TRUNCATE TABLE users CASCADE');
        console.log('✅ All data cleared\n');

        // Hash passwords
        console.log('🔐 Hashing passwords...');
        const teacherPassword = await bcrypt.hash('password123', 10);
        const studentPassword = await bcrypt.hash('password123', 10);
        console.log('✅ Passwords hashed\n');

        // Insert users
        console.log('👥 Creating users...');
        await pool.query(
            `INSERT INTO users (email, password_hash, role) VALUES 
       ($1, $2, 'teacher'),
       ($3, $4, 'student')`,
            ['teacher@attend.com', teacherPassword, 'stu@gmail.com', studentPassword]
        );
        console.log('✅ Users created\n');

        // Verify
        const result = await pool.query('SELECT id, email, role FROM users ORDER BY role');
        console.log('📋 Created users:');
        result.rows.forEach(user => {
            console.log(`   ${user.role}: ${user.email} (ID: ${user.id})`);
        });

        console.log('\n✅ Setup complete!');
        console.log('\n🔑 Login credentials:');
        console.log('   Teacher: teacher@attend.com / password123');
        console.log('   Student: stu@gmail.com / password123');

    } catch (error) {
        console.error('\n❌ Error setting up users:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

setupUsers();
