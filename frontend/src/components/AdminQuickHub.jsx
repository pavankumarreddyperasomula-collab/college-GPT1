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
  onOpenProfile,
  onOpenAddStaff
}) => {
  const role = (user?.role || 'hod').toLowerCase();
  const isHostelSuperAdmin = role === 'super_admin' && (user?.super_admin_type === 'hostel' || user?.category === 'hostel' || (user?.username && user?.username.toLowerCase().includes('hostel')));
  const isCollegeSuperAdmin = role === 'super_admin' && !isHostelSuperAdmin;
  const isSuperAdmin = role === 'super_admin';
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
          <h3 className="text-2xl font-extrabold tracking-tight text-white">{getRoleTitle()}</h3>
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
              onClick={onOpenAddStaff || onOpenProfile}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <UserPlus className="w-3.5 h-3.5" /> Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* Hero Admin Tools Grid - PURE REDDISH ORANGE GLASSMORPHISM LAYOUT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            Official Administration & Dispatch Controls
          </h3>
          <span className="text-xs font-bold text-slate-600">Admin Action Center</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {/* 1. 📢 NOTICE BROADCAST & INBOX */}
          <div className="glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[190px] relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity">
              <Megaphone className="w-24 h-24 text-orange-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                    {unreadCount} Circulars
                  </span>
                )}
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Campus Notices & Circulars</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Create, broadcast & embed targeted notices directly into the campus knowledge base.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-2.5 relative z-10 border-t border-orange-500/20 mt-3">
              <button
                onClick={onOpenAddNotice}
                className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-white" />
                <span>+ Publish Notice</span>
              </button>
              <button
                onClick={onOpenNotices}
                className="py-2 px-3 rounded-xl bg-orange-100/80 hover:bg-orange-200/90 text-orange-900 border border-orange-300 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-orange-700" />
                <span>View Inbox</span>
              </button>
            </div>
          </div>

          {/* 2. 📁 AI DOCUMENT FORMATTER & DISPATCH */}
          <div
            onClick={onOpenDocuments}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Folder className="w-24 h-24 text-rose-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">AI Document Tools</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Convert raw text into clean documents & send directly to your students based on code.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Convert & Send to Students</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. 🎟️ CAMPUS EVENTS & REGISTRATION POSTING */}
          <div
            onClick={onOpenEvents}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Calendar className="w-24 h-24 text-rose-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Events & Registrations</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Post event registration links that appear specifically in your respective students' event lists.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Post & Manage Events</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 4. 📍 CAMPUS MAPS & LOCATIONS */}
          <div
            onClick={onOpenMaps}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[190px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <MapPin className="w-24 h-24 text-orange-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Campus Navigator</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Campus maps for departments, admin buildings, research centers & student hostels.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Open Campus Map</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
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

