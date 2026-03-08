import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Filter, Plus, MoreVertical, Trash2, X,
    User, GraduationCap, Shield, Mail, Phone, MapPin, ChevronRight, Edit
} from 'lucide-react';

import { useUsers } from '../../../context/UserContext';

const UsersPage = () => {
    const navigate = useNavigate();
    const { users, deleteUser, loading } = useUsers();
    const [selectedUser, setSelectedUser] = useState(null); // Drawer State
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [roleFilter, setRoleFilter] = useState('all');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Close menu when clicking outside
    const handleActionClick = (id) => {
        if (activeMenuId === id) {
            setActiveMenuId(null);
        } else {
            setActiveMenuId(id);
        }
    };

    const handleDelete = (id) => {
        deleteUser(id);
        setActiveMenuId(null);
        if (selectedUser?.id === id) setSelectedUser(null);
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading users...</div>;
    }

    console.log('UsersPage received users:', users);

    const filteredUsers = (users || []).filter(user => {
        const matchesRole = roleFilter === 'all' || user.role?.toLowerCase() === roleFilter.toLowerCase();
        const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
        const matchesSearch = (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesDepartment && matchesSearch;
    }).map(user => ({ ...user, status: user.status || 'Active' })); // Mock status if missing

    const getRoleIcon = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return <Shield size={16} className="text-purple-600" />;
            case 'teacher': return <User size={16} className="text-blue-600" />;
            case 'student': return <GraduationCap size={16} className="text-green-600" />;
            default: return <User size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        return status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
    };

    // --- Components ---
    const UserDetailDrawer = ({ user, onClose }) => (
        <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-100"
        >
            <div className="p-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
                        {user.name.charAt(0)}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        {getRoleIcon(user.role)}
                        <span className="text-gray-600 font-medium">{user.role}</span>
                        <span className="text-gray-300">•</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                        </span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Contact Information</label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail size={18} className="text-gray-400" />
                                {user.email}
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone size={18} className="text-gray-400" />
                                +91 98765 43210
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Academic Details</label>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-700">
                                <GraduationCap size={18} className="text-gray-400" />
                                {user.department} Department
                            </div>
                            {user.role === 'Student' && (
                                <div className="flex items-center gap-3 text-gray-700">
                                    <MapPin size={18} className="text-gray-400" />
                                    Year {user.year} • Semester {user.semester}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <button className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        <Edit size={18} />
                        Edit Profile
                    </button>
                    <button
                        onClick={() => handleDelete(user.id)}
                        className="flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={18} />
                        Delete User
                    </button>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {selectedUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedUser(null)}
                            className="fixed inset-0 bg-black z-40"
                        />
                        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
                    </>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage students, staff, and administrators.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/users/add_user')}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-gray-200"
                >
                    <Plus size={20} />
                    Add New User
                </button>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96 p-2">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500/20 text-gray-900 placeholder-gray-400 font-medium transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 p-2 w-full md:w-auto overflow-x-auto">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-500 font-medium text-sm">
                        <Filter size={16} />
                        Filters
                    </div>
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="admin">Admins</option>
                    </select>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-indigo-500 hover:border-gray-300 transition-colors cursor-pointer"
                    >
                        <option value="all">All Departments</option>
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                <th className="px-6 py-4 rounded-tl-2xl">User</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {filteredUsers.map((user, i) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold shadow-sm group-hover:scale-110 transition-transform">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-md ${user.role?.toLowerCase() === 'admin' ? 'bg-purple-100 text-purple-600' :
                                                    user.role?.toLowerCase() === 'teacher' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-green-100 text-green-600'
                                                    }`}>
                                                    {getRoleIcon(user.role)}
                                                </div>
                                                <span className="text-sm font-medium text-gray-700">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                                {user.department}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all opacity-0 group-hover:opacity-100">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No users found matching your filters.
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 px-2">
                <p>Showing {filteredUsers.length} results</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors" disabled>Previous</button>
                    <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-white transition-colors bg-white shadow-sm">Next</button>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
