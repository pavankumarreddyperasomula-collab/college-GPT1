import React, { useState } from 'react';
import { ArrowLeft, User, Lock, Home, GraduationCap, GitBranch, Key, ShieldCheck, Info } from 'lucide-react';
import SpecularButton from './SpecularButton';
import { API_URL } from '../config';

const StudentOtpLogin = ({ onBack, onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [branch, setBranch] = useState('CSE');
  const [hodKey, setHodKey] = useState('');
  const [superAdminKey, setSuperAdminKey] = useState('');
  const [isHostelResident, setIsHostelResident] = useState(false);
  const [mobile, setMobile] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDepartmentChange = (dept) => {
    setDepartment(dept);
    if (dept === 'CSE') {
      setBranch('CSE');
    } else if (dept === 'IT') {
      setBranch('IT');
    } else {
      setBranch(dept);
    }
  };

  const getBranchOptions = () => {
    if (department === 'CSE') {
      return [
        { value: 'CSE', label: 'CSE (Computer Science & Engineering)' },
        { value: 'AIML', label: 'AIML (AI & Machine Learning)' },
        { value: 'CIC', label: 'CIC (IoT & Cybersecurity)' },
        { value: 'CSD', label: 'CSD (Data Science)' }
      ];
    } else if (department === 'IT') {
      return [
        { value: 'IT', label: 'IT (Information Technology)' },
        { value: 'AIDS', label: 'AIDS (AI & Data Science)' },
        { value: 'CSBS', label: 'CSBS (Computer Science & Business Systems)' },
        { value: 'CSIT', label: 'CSIT (Computer Science & IT)' }
      ];
    } else {
      return [
        { value: department, label: `${department} Engineering` }
      ];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      setError('Please enter your student username / roll number.');
      return;
    }

    // Strict validation: must start with "25b91a" and be exactly 10 characters
    if (!cleanUsername.startsWith('25b91a') || cleanUsername.length !== 10) {
      setError("Username must start with '25b91a' and be exactly 10 characters long (e.g. 25b91a54j0).");
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'student',
          username: cleanUsername,
          password: password.trim(),
          is_new_user: isRegister,
          is_hostel_resident: isHostelResident,
          department: department,
          branch: branch
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onLoginSuccess({
          ...data,
          department: data.department || department,
          branch: data.branch || branch,
          hod_code: data.department || department
        });
      } else {
        setError(data.detail || data.message || 'Student authentication failed.');
      }
    } catch (err) {
      setError('Cannot connect to backend server on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50/80 via-rose-50/50 to-amber-50/40 overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-xl border border-orange-100/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-900/5 animate-fade-in flex flex-col items-center max-h-[95vh] overflow-y-auto">
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between mb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to role selection
          </button>
        </div>

        {/* SRKR Engineering College Logo */}
        <div className="mb-3 flex justify-center">
          <img
            src="/srkr_logo.png"
            alt="SRKR Engineering College Logo"
            className="h-12 sm:h-14 object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4 w-full border border-slate-200">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3 w-full">
          <div className="w-9 h-9 rounded-2xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/25">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isRegister ? 'New Student Registration' : 'Student Portal Access'}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {isRegister ? 'Enter 10-char roll number & HOD/Admin keys' : 'Enter 10-digit roll number to continue'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium w-full">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          {/* USERNAME Field (10-characters starting with 25b91a) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                STUDENT USERNAME / ROLL NO
              </label>
              <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.5 rounded">
                Starts with "25b91a" (10 chars)
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={10}
                placeholder="e.g. 25b91a54j0"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 text-slate-900 text-sm font-mono outline-none transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Must be exactly 10 characters (e.g. <span className="font-mono text-slate-600 font-bold">25b91a54j0</span>).
            </p>
          </div>

          {/* PASSWORD Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {isRegister ? 'CREATE PASSWORD' : 'PASSWORD'}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                spellCheck={false}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 text-slate-900 text-sm outline-none transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* REGISTRATION ONLY FIELDS: DEPARTMENT & BRANCH */}
          {isRegister && (
            <>
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-orange-600" /> DEPARTMENT
                </label>
                <select
                  value={department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 text-slate-900 text-xs font-bold outline-none transition-all cursor-pointer"
                >
                  <option value="CSE">CSE (Computer Science & Engineering)</option>
                  <option value="IT">IT (Information Technology)</option>
                  <option value="ECE">ECE (Electronics & Communication)</option>
                  <option value="EEE">EEE (Electrical & Electronics)</option>
                  <option value="MECHANICAL">MECHANICAL Engineering</option>
                </select>
              </div>

              {/* Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-rose-600" /> BRANCH / SPECIALIZATION
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-600 text-slate-900 text-xs font-bold outline-none transition-all cursor-pointer"
                >
                  {getBranchOptions().map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Hostel Resident Checkbox */}
          <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isHostelResident}
                onChange={(e) => setIsHostelResident(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-orange-600" /> I am a hostel resident
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Check if staying in SRKR college hostel for curfew & mess notices.
                </p>
              </div>
            </label>
          </div>

          {/* Submit Action Button */}
          <div className="pt-1">
            <SpecularButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Authenticating...' : (isRegister ? 'Create Account & Login' : 'Login to Student Dashboard')}
            </SpecularButton>
          </div>

          <div className="text-center pt-1">
            <p className="text-[11px] text-slate-400">
              Demo Student: <span className="font-mono text-slate-700 font-bold">25b91a54j0</span> / <span className="font-mono text-slate-700 font-bold">student123</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentOtpLogin;
