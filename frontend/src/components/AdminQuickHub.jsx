import React from 'react';
import { ShieldCheck, PlusCircle, Bell, MapPin, Key, Sparkles, Folder, Calendar, ArrowRight, FileText, Megaphone, Compass, BookOpen, Upload, UserPlus, Home, Lock } from 'lucide-react';

const AdminQuickHub = ({
  user,
  unreadCount = 0,
  onOpenAddNotice,
  onOpenNotices,
  onOpenDocuments,
  onOpenEvents,
  onOpenMaps,
  onOpenRules,
  onOpenProfile
}) => {
  const role = (user?.role || 'hod').toLowerCase();
  const isHostelSuperAdmin = role === 'super_admin' && (user?.super_admin_type === 'hostel' || user?.category === 'hostel' || (user?.username && user?.username.toLowerCase().includes('hostel')));
  const isCollegeSuperAdmin = role === 'super_admin' && !isHostelSuperAdmin;
  const isHostelAdmin = role === 'hostel_admin' || isHostelSuperAdmin;

  const getRoleTitle = () => {
    if (isHostelSuperAdmin) return 'Hostel Super Admin Control Center';
    if (isCollegeSuperAdmin) return 'College Super Admin Control Center';
    if (role === 'hostel_admin') return `${user?.designation || 'Hostel Admin'} Dashboard`;
    if (role === 'faculty') return 'Faculty Administration Portal';
    return 'HOD Department Portal';
  };

  const getRoleBadge = () => {
    if (isHostelSuperAdmin) return 'HOSTEL SUPER ADMIN SCOPE';
    if (isCollegeSuperAdmin) return 'ALL CAMPUS SCOPE';
    if (role === 'hostel_admin') return 'HOSTEL RESIDENTS SCOPE';
    if (role === 'faculty') return `FACULTY - ${user?.department || 'CSE'}`;
    return `HOD CODE: ${user?.hod_code || 'HOD-MAIN'}`;
  };

  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Top Profile & Scope Header Card */}
      <div className={`p-6 rounded-3xl text-white shadow-xl space-y-4 border relative overflow-hidden ${
        isHostelSuperAdmin
          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-red-700 border-amber-400/40'
          : 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 border-orange-400/30'
      }`}>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-orange-100 border border-white/30 backdrop-blur-md">
            {getRoleBadge()}
          </span>
          <ShieldCheck className="w-6 h-6 text-amber-300" />
        </div>

        <div className="relative z-10">
          <h3 className="text-2xl font-black tracking-tight text-white">{getRoleTitle()}</h3>
          <p className="text-xs text-orange-100 font-medium">Logged in as: <span className="font-extrabold text-white">{user?.username}</span> ({user?.designation || user?.role})</p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={onOpenProfile}
            className="px-3.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition-all cursor-pointer border border-white/30"
          >
            <Lock className="w-3.5 h-3.5" /> Edit Profile / Password
          </button>

          {isHostelAdmin && (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Hostel Roster
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={onOpenProfile}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Hero Admin Tools Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            Official Administration & Dispatch Controls
          </h3>
          <span className="text-xs font-bold text-slate-500">Admin Action Center</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {/* 1. 📢 NOTICE BROADCAST & INBOX */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-lg hover:shadow-2xl hover:shadow-emerald-600/30 transition-all duration-300 flex flex-col justify-between min-h-[190px] border border-emerald-500 relative overflow-hidden">
            <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
              <Megaphone className="w-24 h-24" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner">
                  <Megaphone className="w-6 h-6" />
                </div>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white text-emerald-800 text-xs font-black shadow-md">
                    {unreadCount} Circulars
                  </span>
                )}
              </div>
              <h4 className="text-xl font-black tracking-tight text-white">Campus Notices & Circulars</h4>
              <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                Create, broadcast & embed targeted notices directly into the campus knowledge base.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2.5 relative z-10 border-t border-white/20 mt-3">
              <button
                onClick={onOpenAddNotice}
                className="flex-1 py-2 px-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                <span>+ Publish Notice</span>
              </button>
              <button
                onClick={onOpenNotices}
                className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-amber-200" />
                <span>View Inbox</span>
              </button>
            </div>
          </div>

          {/* 2. 🩶 AI DOCUMENT FORMATTER & DISPATCH */}
          <div
            onClick={onOpenDocuments}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-slate-700 via-slate-800 to-zinc-900 text-white shadow-lg hover:shadow-2xl hover:shadow-slate-800/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-slate-600 overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Folder className="w-24 h-24" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black tracking-tight text-white">AI Document Tools</h4>
              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Convert raw text into clean documents & send directly to your students based on code.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-white/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300">Convert & Send to Students</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. 🟪 CAMPUS EVENTS & REGISTRATION POSTING */}
          <div
            onClick={onOpenEvents}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-rose-700 via-purple-700 to-indigo-800 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-700/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-rose-500 overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Calendar className="w-24 h-24" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black tracking-tight text-white">Events & Registrations</h4>
              <p className="text-xs text-rose-100 font-medium leading-relaxed">
                Post event registration links that appear specifically in your respective students' event lists.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-white/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-200">Post & Manage Events</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-rose-700 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 4. 🟧 CAMPUS MAPS & LOCATIONS */}
          <div
            onClick={onOpenMaps}
            className="group relative p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white shadow-lg hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-amber-400 overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <MapPin className="w-24 h-24" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-black tracking-tight text-white">Campus Navigator</h4>
              <p className="text-xs text-amber-100 font-medium leading-relaxed">
                Campus maps for departments, admin buildings, research centers & student hostels.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-white/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">Open Campus Map</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-amber-600 transition-all">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickHub;
