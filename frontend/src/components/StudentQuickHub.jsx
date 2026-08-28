import React from 'react';
import { BookOpen, Folder, Megaphone, Calendar, MapPin, Bell, User, ArrowRight, Sparkles, Compass } from 'lucide-react';

const StudentQuickHub = ({
  user,
  unreadCount = 0,
  documentsCount = 0,
  onOpenRules,
  onOpenDocuments,
  onOpenNotices,
  onOpenEvents,
  onOpenMaps,
  onOpenProfile
}) => {
  return (
    <div className="space-y-6 w-full animate-fade-in">
      {/* Top Profile & Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-orange-400/30 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-orange-100">
            <Sparkles className="w-3.5 h-3.5" /> SRKR Student Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, <span className="font-extrabold text-amber-200">{user?.username || 'Student'}</span>!
          </h2>
          <p className="text-xs text-orange-100 font-medium">
            Explore SRKR Engineering College services, official notices, rules, and AI document tools.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onOpenNotices}
            className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-extrabold flex items-center gap-2 border border-white/30 transition-all cursor-pointer shadow-sm"
          >
            <Bell className="w-4 h-4 text-amber-300" />
            <span>Notices</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenProfile}
            className="p-2.5 rounded-2xl bg-white text-orange-700 hover:bg-orange-50 font-extrabold text-xs flex items-center justify-center transition-all cursor-pointer shadow-md"
            title="My Profile"
          >
            <User className="w-5 h-5 text-orange-600" />
          </button>
        </div>
      </div>

      {/* Hero 5 Feature Action Blocks - PURE REDDISH ORANGE GLASSMORPHISM LAYOUT */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 animate-pulse" />
            Campus Quick Action Hub
          </h3>
          <span className="text-xs font-bold text-slate-600">5 Essential Student Tools</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. 📙 COLLEGE RULES BLOCK */}
          <div
            onClick={onOpenRules}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <BookOpen className="w-24 h-24 text-orange-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">College Rules</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Attendance, ID Cards, Anti-Ragging regulations & official student conduct.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">View SRKR Rules</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 2. 📁 DEPARTMENT DOCUMENTS BLOCK */}
          <div
            onClick={onOpenDocuments}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Folder className="w-24 h-24 text-rose-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Folder className="w-6 h-6 text-rose-600" />
                </div>
                {documentsCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black shadow-md">
                    {documentsCount} Docs
                  </span>
                )}
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Department Documents</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Official documents sent by your HOD & Faculty with sender identity, plus AI tools.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Format & Download</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 3. 📢 NOTICE INBOX BLOCK */}
          <div
            onClick={onOpenNotices}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Megaphone className="w-24 h-24 text-amber-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Megaphone className="w-6 h-6 text-orange-600" />
                </div>
                {unreadCount > 0 && (
                  <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black shadow-md">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Notice Inbox</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Official circulars published by HODs, Wardens, and Super Admins.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Read Circulars</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 4. 🎟️ CAMPUS EVENTS BLOCK */}
          <div
            onClick={onOpenEvents}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px]"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar className="w-24 h-24 text-rose-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-rose-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Campus Events</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Active registration links, Hack 'N' Clash, movie pre-releases & tech fests.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Register For Events</span>
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center group-hover:bg-orange-700 transition-all shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* 5. 📍 CAMPUS NAVIGATOR BLOCK */}
          <div
            onClick={onOpenMaps}
            className="group relative glass-box-orange-pure p-6 text-slate-900 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[180px] sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <MapPin className="w-24 h-24 text-orange-600" />
            </div>

            <div className="space-y-2 relative z-10">
              <div className="w-12 h-12 rounded-2xl glass-icon-orange-pure flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-extrabold tracking-tight text-slate-900">Campus Navigator</h4>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                GPS route navigator for CSE Block, Mechanical, Library & Hostels.
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between relative z-10 border-t border-orange-500/20 mt-3">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800">Open Interactive Map</span>
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

export default StudentQuickHub;


