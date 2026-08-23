import React from 'react';
import { GraduationCap, UserCheck, Sparkles, Building2 } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50/80 via-rose-50/50 to-amber-50/40 overflow-hidden">
      {/* Warm Background Glow Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-400/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 max-w-2xl w-full bg-white/95 backdrop-blur-xl border border-orange-100/80 rounded-3xl p-8 sm:p-10 shadow-2xl shadow-orange-900/5 animate-fade-in text-center flex flex-col items-center">
        {/* SRKR Engineering College Logo at Top Middle */}
        <div className="mb-6 flex justify-center">
          <img
            src="/srkr_logo.png"
            alt="SRKR Engineering College Logo"
            className="h-16 sm:h-20 object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
        </div>

        {/* Top Badge: SRKR COLLEGE GPT */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-700 text-xs font-extrabold uppercase tracking-wider mb-4 shadow-2xs">
          <Sparkles className="w-4 h-4 text-orange-600" />
          SRKR COLLEGE GPT
        </div>

        {/* Title: Welcome to COLLEGE GPT */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-8">
          Welcome to <span className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 bg-clip-text text-transparent">COLLEGE GPT</span>
        </h1>

        {/* 3 Entry Point Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          {/* Student Entry */}
          <button
            onClick={() => onSelectRole('student')}
            className="group relative flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-gradient-to-br hover:from-orange-600 hover:to-rose-600 border border-slate-200 hover:border-orange-600 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-orange-600/25 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4 transition-colors shadow-inner">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-white mb-1">I'm a Student</h3>
            <p className="text-xs text-slate-500 group-hover:text-orange-100 text-center">Username & Password Login / Register</p>
          </button>

          {/* Admin Entry (HOD / Faculty / Hostel Admin) */}
          <button
            onClick={() => onSelectRole('admin')}
            className="group relative flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-gradient-to-br hover:from-rose-600 hover:to-red-700 border border-slate-200 hover:border-rose-600 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-rose-600/25 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4 transition-colors shadow-inner">
              <UserCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-white mb-1">I'm an Admin</h3>
            <p className="text-xs text-slate-500 group-hover:text-rose-100 text-center">HOD / Faculty / Hostel Admin portal</p>
          </button>

          {/* Super Admin Entry */}
          <button
            onClick={() => onSelectRole('super_admin')}
            className="group relative flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-900 border border-slate-200 hover:border-slate-900 rounded-2xl transition-all duration-300 transform hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-slate-900/25 cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-800 group-hover:bg-white/20 group-hover:text-white flex items-center justify-center mb-4 transition-colors shadow-inner">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-white mb-1">Super Admin</h3>
            <p className="text-xs text-slate-500 group-hover:text-slate-200 text-center">Campus broadcast & overall scope</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
