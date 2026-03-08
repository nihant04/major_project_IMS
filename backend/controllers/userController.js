import bcrypt from 'bcryptjs';
import sequelize from '../config/database.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';

// Get All Users
export const getAllUsers = async (req, res) => {
    try {
        console.log('[UserController] getAllUsers called by:', req.user?.email);
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                { model: Student, as: 'studentProfile' },
                { model: Teacher, as: 'teacherProfile' }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`[UserController] Successfully retrieved ${users.length} users`);

        // Flatten the response for frontend convenience
        const formattedUsers = users.map(u => {
            const user = u.toJSON();
            let profileData = {};
            const role = user.role?.toLowerCase();

            if (role === 'student') {
                profileData = user.studentProfile || {};
            } else if (role === 'teacher') {
                profileData = user.teacherProfile || {};
            }

            return {
                ...user,
                ...profileData,
                id: user.id, // Ensure ID is always the User ID
                profileId: profileData.id,
                department: profileData.department || user.department || 'N/A',
                role: user.role // Keep original case or normalization
            };
        });

        res.json(formattedUsers);
    } catch (error) {
        console.error('[UserController] getAllUsers Error:', error);
        res.status(500).json({ message: 'Server error fetching users', error: error.message });
    }
};

// Create User (Admin only)
export const createUser = async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            name, email, role, department, phone, dob, gender, address,
            // Student Specific
            rollNo, year, semester, guardianName, guardianPhone, joiningYear,
            // Teacher Specific
            designation, qualification, experience
        } = req.body;

        // Check user existence
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            await t.rollback();
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password || 'password123', salt);

        // Normalize role to lowercase for DB Enum
        const dbRole = role.toLowerCase();

        // 1. Create User Record
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: dbRole,
            phone,
            dob,
            gender,
            address,
            avatar: '' // Placeholder
        }, { transaction: t });

        // 2. Create Profile Record based on Role
        if (dbRole === 'student') {
            await Student.create({
                userId: newUser.id,
                enrollmentNo: rollNo, // Mapping rollNo to enrollmentNo
                department,
                semester,
                section: 'A', // Default or add to form
                year,
                guardianName,
                guardianPhone,
                joiningYear
            }, { transaction: t });
        } else if (dbRole === 'teacher') {
            await Teacher.create({
                userId: newUser.id,
                employeeId: `EMP${newUser.id}`, // Generate or add input
                department,
                designation,
                qualification,
                experience
            }, { transaction: t });
        }

        await t.commit();

        res.status(201).json({ message: 'User created successfully', user: newUser });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ message: 'Server error creating user', error: error.message });
    }
};

// Delete User
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            console.log(`Delete failed: User ${id} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log(`Deleting user ${id} with role ${user.role}`);

        // Manually delete profile
        if (user.role === 'student' || user.role === 'Student') {
            await Student.destroy({ where: { userId: id } });
            console.log('Student profile deleted');
        } else if (user.role === 'teacher' || user.role === 'Teacher') {
            await Teacher.destroy({ where: { userId: id } });
            console.log('Teacher profile deleted');
        }

        await user.destroy();
        console.log('User record deleted');
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error deleting user', error: error.message });
    }
};

// Get Single User by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const userRec = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Student, as: 'studentProfile' },
                { model: Teacher, as: 'teacherProfile' }
            ]
        });

        if (!userRec) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userRec.toJSON();
        let profileData = {};
        if (user.role === 'student' || user.role === 'Student') {
            profileData = user.studentProfile || {};
        } else if (user.role === 'teacher' || user.role === 'Teacher') {
            profileData = user.teacherProfile || {};
        }

        const formattedUser = {
            ...user,
            ...profileData,
            id: user.id,
            profileId: profileData.id,
            department: profileData.department || user.department,
        };

        res.json(formattedUser);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Server error fetching user details' });
    }
};

// Get Students with Filters (Department, Year)
export const getStudents = async (req, res) => {
    try {
        const { department, year, section, semester } = req.query;
        let whereClause = {};

        // Filter by Department (Case insensitive or direct match)
        if (department) {
            whereClause.department = department;
        }

        if (year) {
            whereClause.year = year;
        }

        if (section) {
            whereClause.section = section;
        }

        if (semester) {
            whereClause.semester = semester;
        }

        const students = await Student.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'avatar', 'phone']
                }
            ],
            order: [['enrollmentNo', 'ASC']]
        });

        // Format for frontend
        const formattedStudents = students.map(s => ({
            id: s.User.id,           // User ID
            studentId: s.id,         // Student Profile ID
            name: s.User.name,
            email: s.User.email,
            avatar: s.User.avatar,
            enrollmentNo: s.enrollmentNo,
            department: s.department,
            year: s.year,
            semester: s.semester,
            section: s.section
        }));

        res.json(formattedStudents);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'Server error fetching students' });
    }
};

// Get Teachers with Filters (Department)
export const getTeachers = async (req, res) => {
    try {
        const { department } = req.query;
        let whereClause = {};

        if (department) {
            whereClause.department = department;
        }

        const teachers = await Teacher.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email', 'avatar', 'phone']
                }
            ],
            order: [['employeeId', 'ASC']]
        });

        // Format for frontend
        const formattedTeachers = teachers.map(t => ({
            id: t.User.id,
            teacherId: t.id,
            name: t.User.name,
            email: t.User.email,
            avatar: t.User.avatar,
            employeeId: t.employeeId,
            department: t.department,
            designation: t.designation,
            qualification: t.qualification,
            experience: t.experience
        }));

        res.json(formattedTeachers);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error fetching teachers' });
    }
};
// Update User Profile (Self)
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, email, phone, address, dob, gender } = req.body;

        user.name = name || user.name;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.dob = dob || user.dob;
        user.gender = gender || user.gender;

        // Handle Avatar Upload
        if (req.file) {
            // Store the relative path to the image
            user.avatar = `/${req.file.path.replace(/\\/g, '/')}`;
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// Update User Password (Self)
export const updateUserPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ message: 'Server error updating password' });
    }
};
