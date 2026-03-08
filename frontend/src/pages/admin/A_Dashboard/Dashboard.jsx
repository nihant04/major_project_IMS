import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, UserCheck, Activity, Calendar, ArrowUpRight, TrendingUp } from 'lucide-react';
import DashboardStats from './components/DashboardStats';
import ActivityChart from './components/ActivityChart';
import RecentRequests from './components/RecentRequests';
import QuickActions from './components/QuickActions';

const Dashboard = () => {
    const [stats, setStats] = React.useState({
        studentCount: 0,
        teacherCount: 0,
        departmentCount: 0,
        activeRequests: 0,
        avgAttendance: 0
    });

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                });
                if (!response.ok) throw new Error('Failed to fetch stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Animation Layout Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, Admin. System performance is optimal.</p>
                </div>
                <div className="flex gap-3">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        System Online
                    </span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        Spring Semester 2024
                    </span>
                </div>
            </motion.div>

            {/* KPI Stats Row */}
            <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Stat Cards with Gradients */}
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Users size={24} className="text-white" />
                            </div>
                            <span className="flex items-center gap-1 text-indigo-100 text-sm bg-white/10 px-2 py-0.5 rounded">
                                <TrendingUp size={14} /> +12%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mt-4">{stats.studentCount}</h3>
                        <p className="text-indigo-100 text-sm mt-1">Total Students</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <GraduationCap size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-green-600 text-sm bg-green-50 px-2 py-0.5 rounded">
                                <ArrowUpRight size={14} /> +5%
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mt-4 text-gray-900">{stats.teacherCount}</h3>
                        <p className="text-gray-500 text-sm mt-1">Faculty Members</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <UserCheck size={24} />
                            </div>
                            <span className="text-gray-400 text-sm">Today</span>
                        </div>
                        <h3 className="text-3xl font-bold mt-4 text-gray-900">{stats.avgAttendance}%</h3>
                        <p className="text-gray-500 text-sm mt-1">Avg. Attendance</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                <Activity size={24} />
                            </div>
                            <span className="flex items-center gap-1 text-orange-600 text-sm bg-orange-50 px-2 py-0.5 rounded">
                                Pending
                            </span>
                        </div>
                        <h3 className="text-3xl font-bold mt-4 text-gray-900">{stats.activeRequests}</h3>
                        <p className="text-gray-500 text-sm mt-1">Active Requests</p>
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Section (2/3) */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                    <ActivityChart />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RecentRequests />
                        <QuickActions />
                    </div>
                </motion.div>

                {/* Right Sidebar (1/3) */}
                <motion.div variants={itemVariants} className="space-y-6">
                    {/* Event Card Re-styled */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Upcoming Event</h3>
                                <Calendar size={20} className="text-gray-400" />
                            </div>

                            <div className="flex items-start gap-4 mb-6">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center min-w-[70px] border border-white/10">
                                    <span className="block text-2xl font-bold">15</span>
                                    <span className="text-xs uppercase text-gray-400">Apr</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight">Annual Sports Meet 2024</h4>
                                    <p className="text-gray-400 text-sm mt-1">Main Stadium, NIT Campus</p>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors">
                                View Event Details
                            </button>
                        </div>

                        {/* Abstract Decor */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
                    </div>

                    {/* Quick Stats List */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Department Performance</h3>
                        <div className="space-y-4">
                            {[
                                { name: 'Comp. Sci', val: 92, color: 'bg-blue-500' },
                                { name: 'Electronics', val: 88, color: 'bg-indigo-500' },
                                { name: 'Mechanical', val: 85, color: 'bg-orange-500' },
                                { name: 'Civil', val: 79, color: 'bg-green-500' }
                            ].map((dept, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 font-medium">{dept.name}</span>
                                        <span className="text-gray-900 font-bold">{dept.val}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${dept.color}`}
                                            style={{ width: `${dept.val}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
