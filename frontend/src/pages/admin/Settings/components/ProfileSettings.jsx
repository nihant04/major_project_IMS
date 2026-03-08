import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Save, User, Mail, Phone, Briefcase, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../../../../context/SettingsContext';

const ProfileSettings = () => {
    const { profile, updateProfile } = useSettings();
    const [formData, setFormData] = useState(profile);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        setFormData(profile);
        if (profile.avatar) {
            // Ensure avatar URL is correct (handles both full URLs and relative paths)
            const avatarUrl = profile.avatar.startsWith('http')
                ? profile.avatar
                : `${import.meta.env.VITE_API_URL}${profile.avatar}`;
            setPreviewUrl(avatarUrl);
        }
    }, [profile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('department', formData.department);
        if (selectedFile) {
            data.append('avatar', selectedFile);
        }

        const result = await updateProfile(data);
        setLoading(false);
        if (result.success) {
            setStatus('success');
            setTimeout(() => setStatus(null), 3000);
        }
    };

    return (
        <div className="p-10 max-w-4xl mx-auto space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Personal Profile</h2>
                    <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Public identity across the campus</p>
                </div>
                <div className="flex -space-x-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 shadow-sm">
                            {i}
                        </div>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Avatar Section */}
                <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current.click()}
                            className="w-32 h-32 rounded-[2.5rem] bg-white shadow-2xl shadow-blue-900/10 border-4 border-white flex items-center justify-center text-4xl font-black text-blue-600 overflow-hidden cursor-pointer"
                        >
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                formData.name?.charAt(0) || '?'
                            )}
                            <div className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="text-white" size={32} />
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200"
                        >
                            <Camera size={18} />
                        </motion.button>
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-lg font-black text-gray-900">Main Identity Image</h3>
                        <p className="text-xs font-bold text-gray-400 mt-1 tracking-wide">Recommended size: 800x800px. JPG or PNG.</p>
                        <div className="mt-4 flex gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all font-bold"
                            >
                                Upload New
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedFile(null);
                                    setPreviewUrl(null);
                                }}
                                className="px-4 py-2 bg-transparent text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all font-bold"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Full Name */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                            <User size={12} className="text-blue-500" />
                            Display Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-100 transition-all text-gray-900 font-bold"
                            placeholder="Your full name"
                        />
                    </div>

                    {/* Department */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                            <Briefcase size={12} className="text-purple-500" />
                            Professional Dept
                        </label>
                        <input
                            type="text"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-100 transition-all text-gray-900 font-bold"
                            placeholder="e.g. Computer Science"
                        />
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                            <Mail size={12} className="text-rose-500" />
                            Campus Email
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-100 transition-all text-gray-900 font-bold"
                            placeholder="email@nit.edu"
                        />
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">
                            <Phone size={12} className="text-amber-500" />
                            Direct Contact
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-3xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-100 transition-all text-gray-900 font-bold"
                            placeholder="+91 00000 00000"
                        />
                    </div>
                </div>

                <div className="pt-8 flex items-center justify-between border-t border-gray-50">
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-widest"
                            >
                                <CheckCircle2 size={16} />
                                Profile Synchronized
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex gap-4">
                        <button type="button" onClick={() => setFormData(profile)} className="px-8 py-4 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">Discard</button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={loading}
                            className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-3"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                            Update Profile
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;
