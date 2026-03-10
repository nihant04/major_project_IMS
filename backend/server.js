import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';

// Import Models
import User from './models/User.js';
import Student from './models/Student.js';
import Teacher from './models/Teacher.js';
import Notice from './models/Notice.js';
import Setting from './models/Setting.js';
import Attendance from './models/Attendance.js';
import Subject from './models/Subject.js';
import Exam from './models/Exam.js';
import Mark from './models/Mark.js';
import FeeStructure from './models/FeeStructure.js';
import FeePayment from './models/FeePayment.js';
import Discount from './models/Discount.js';
import Request from './models/Request.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noticeRoutes from './routes/noticeRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import examinationRoutes from './routes/examinationRoutes.js';
import feeRoutes from './routes/feeRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examinationRoutes);
app.use('/api/fees', feeRoutes);

// Associations
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

// Exam & Marks Associations
Exam.hasMany(Mark, { foreignKey: 'examId', as: 'marks' });
Mark.belongsTo(Exam, { foreignKey: 'examId', as: 'exam' });

User.hasMany(Mark, { foreignKey: 'studentId', as: 'results' });
Mark.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Subject.hasMany(Mark, { foreignKey: 'subjectId', as: 'marks' });
Mark.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });

// Fee Associations
User.hasMany(FeePayment, { foreignKey: 'studentId', as: 'paymentsReceived' });
FeePayment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

FeeStructure.hasMany(FeePayment, { foreignKey: 'feeStructureId', as: 'payments' });
FeePayment.belongsTo(FeeStructure, { foreignKey: 'feeStructureId', as: 'feeStructure' });

// Audit Associations
User.hasMany(FeeStructure, { foreignKey: 'createdBy', as: 'createdFees' });
FeeStructure.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

User.hasMany(FeePayment, { foreignKey: 'verifiedBy', as: 'verifiedPayments' });
FeePayment.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Remote Database Seeding Endpoint
import bcrypt from 'bcryptjs';
app.post('/api/seed-db', async (req, res) => {
    try {
        const { secret } = req.body;
        if (secret !== process.env.JWT_SECRET) {
            return res.status(403).json({ message: "Unauthorized: Invalid secret key." });
        }

        await sequelize.sync();
        const existingAdmin = await User.findOne({ where: { email: 'admin@nit.edu.in' } });

        if (existingAdmin) {
            return res.status(200).json({ message: "Database already seeded. Admin exists." });
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        await User.findOrCreate({
            where: { email: 'admin@nit.edu.in' },
            defaults: { name: 'Admin User', email: 'admin@nit.edu.in', password: passwordHash, role: 'admin', avatar: '' }
        });

        await User.findOrCreate({
            where: { email: 'teacher@nit.edu.in' },
            defaults: { name: 'Teacher User', email: 'teacher@nit.edu.in', password: passwordHash, role: 'teacher', avatar: '' }
        });

        await User.findOrCreate({
            where: { email: 'student@nit.edu.in' },
            defaults: { name: 'Student User', email: 'student@nit.edu.in', password: passwordHash, role: 'student', avatar: '' }
        });

        res.status(200).json({ message: "Database seeded successfully with admin account! Password: password123" });
    } catch (error) {
        console.error('Seeding error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Database Connection and Server Start
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected successfully.');

        // Sync models (alter: true updates tables if model changes)
        await sequelize.sync({ alter: true });
        console.log('✅ Database synchronized (models loaded).');

        // Seed settings
        const { seedSettings } = await import('./controllers/settingController.js');
        await seedSettings();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
};

startServer();
