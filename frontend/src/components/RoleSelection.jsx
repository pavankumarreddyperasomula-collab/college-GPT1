import React from 'react';
import { GraduationCap, UserCheck, Sparkles, Building2 } from 'lucide-react';

const RoleSelection = ({ onSelectRole }) => {
  return (
    <div className="login-bg-container relative w-full h-[100dvh] flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* Subtle Ambient Glass Glow Behind Card */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Panel Card */}
      <div className="relative z-10 max-w-2xl w-full glass-panel-pure p-8 sm:p-10 animate-fade-in text-center flex flex-col items-center">
        {/* SRKR Engineering College Logo at Top */}
        <div className="mb-6 flex justify-center">
          <img
            src="/srkr_logo.png"
            alt="SRKR Engineering College Logo"
            className="h-16 sm:h-20 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>

        {/* Top Badge: SRKR COLLEGE GPT */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-xs font-extrabold uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-300" />
          SRKR COLLEGE GPT
        </div>

        {/* Title: Welcome to COLLEGE GPT */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Welcome to <span className="bg-gradient-to-r from-amber-200 via-white to-orange-200 bg-clip-text text-transparent">COLLEGE GPT</span>
        </h1>
        <p className="text-sm font-medium text-white/80 mb-8">
          Select your portal to access AI-powered campus information & services
        </p>

        {/* 3 Pure Glass Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full">
          {/* Student Entry */}
          <button
            onClick={() => onSelectRole('student')}
            className="group glass-card-pure relative flex flex-col items-center justify-center p-6 text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl glass-icon-badge flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">I'm a Student</h3>
            <p className="text-xs font-medium text-white/80 text-center leading-relaxed">Username & Password Login / Register</p>
          </button>

          {/* Admin Entry (HOD / Faculty / Hostel Admin) */}
          <button
            onClick={() => onSelectRole('admin')}
            className="group glass-card-pure relative flex flex-col items-center justify-center p-6 text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl glass-icon-badge flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">I'm an Admin</h3>
            <p className="text-xs font-medium text-white/80 text-center leading-relaxed">HOD / Faculty / Hostel Admin portal</p>
          </button>

          {/* Super Admin Entry */}
          <button
            onClick={() => onSelectRole('super_admin')}
            className="group glass-card-pure relative flex flex-col items-center justify-center p-6 text-left cursor-pointer"
          >
            <div className="w-14 h-14 rounded-2xl glass-icon-badge flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">Super Admin</h3>
            <p className="text-xs font-medium text-white/80 text-center leading-relaxed">Campus broadcast & overall scope</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

