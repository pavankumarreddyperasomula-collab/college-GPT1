import React from 'react';
import { X, User, ShieldCheck, Key, Home, Building, Phone, Briefcase, GitBranch, GraduationCap } from 'lucide-react';

const ProfileModal = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const role = (user.role || 'student').toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            {/* SRKR Logo */}
            <img src="/srkr_logo.png" alt="SRKR Logo" className="h-9 object-contain" />
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">User Profile Details</h3>
              <p className="text-xs text-slate-500 font-medium">SRKR COLLEGE GPT account profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6 space-y-4">
          {/* User Name & Role Pill */}
          <div className="p-4 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-violet-600 uppercase tracking-wider">Account Holder</span>
              <h4 className="text-lg font-extrabold text-slate-900">{user.username || user.name || 'User'}</h4>
            </div>
            <span className="px-3 py-1 rounded-full bg-violet-600 text-white text-xs font-bold uppercase tracking-wider shadow-xs">
              {user.designation || user.role}
            </span>
          </div>

          {/* Role-Specific Fields */}
          <div className="space-y-3">
            {/* Student Profile */}
            {role === 'student' && (
              <>
                {user.department && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-violet-600" /> Department
                    </span>
                    <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {user.department}
                    </span>
                  </div>
                )}

                {user.branch && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-600 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-indigo-600" /> Branch / Specialization
                    </span>
                    <span className="font-bold text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                      {user.branch}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Home className="w-4 h-4 text-orange-600" /> Hostel Resident Status
                  </span>
                  <span className={`font-bold px-2.5 py-1 rounded-lg ${
                    user.is_hostel_resident
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {user.is_hostel_resident ? 'Yes (Hostel Resident)' : 'No (Day Scholar)'}
                  </span>
                </div>

                {user.hod_code && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-800 flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-600" /> Linked HOD Key
                    </span>
                    <span className="font-mono font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                      {user.hod_code}
                    </span>
                  </div>
                )}

                {user.super_admin_key && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 border border-slate-300 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-700" /> Super Admin Key
                    </span>
                    <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                      {user.super_admin_key}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* Faculty Profile */}
            {role === 'faculty' && (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" /> Employee ID
                  </span>
                  <span className="font-mono font-bold text-slate-900">{user.employee_id || user.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600" /> College & Dept
                  </span>
                  <span className="font-bold text-slate-900">{user.college_name || 'SRKR Engineering College'} ({user.department || 'CSE'})</span>
                </div>
              </>
            )}

            {/* HOD Profile */}
            {role === 'hod' && (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-violet-600" /> Employee ID
                  </span>
                  <span className="font-mono font-bold text-slate-900">{user.employee_id || user.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Building className="w-4 h-4 text-violet-600" /> Department
                  </span>
                  <span className="font-bold text-slate-900">{user.department || 'CSE'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs">
                  <span className="font-bold text-violet-700 flex items-center gap-2">
                    <Key className="w-4 h-4 text-violet-600" /> Auto-Generated HOD Code
                  </span>
                  <span className="font-mono font-extrabold text-violet-900 bg-white px-2.5 py-1 rounded-lg border border-violet-300">
                    {user.hod_code}
                  </span>
                </div>
              </>
            )}

            {/* Hostel Admin Profile */}
            {role === 'hostel_admin' && (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-amber-600" /> Mobile Number
                  </span>
                  <span className="font-mono font-bold text-slate-900">{user.mobile || '9876543210'}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Designation
                  </span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">{user.designation || 'Warden'}</span>
                </div>
              </>
            )}

            {/* Super Admin Profile */}
            {role === 'super_admin' && (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-800" /> Employee ID
                  </span>
                  <span className="font-mono font-bold text-slate-900">{user.employee_id || user.username}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-bold text-slate-600 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-800" /> College Scope
                  </span>
                  <span className="font-bold text-slate-900">{user.college_name || 'SRKR Engineering College'}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
