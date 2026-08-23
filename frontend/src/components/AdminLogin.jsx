import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Building2, CheckCircle2, Building } from 'lucide-react';
import SpecularButton from './SpecularButton';

const AdminLogin = ({ onBack, onLoginSuccess, initialTab = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'admin' or 'super_admin'
  const [adminType, setAdminType] = useState('HOD'); // 'HOD', 'Faculty', 'Hostel Admin'

  // Form fields for HOD / Faculty
  const [empId, setEmpId] = useState('');
  const [collegeName, setCollegeName] = useState('SRKR Engineering College');
  const [department, setDepartment] = useState('CSE'); // Default CSE
  const [password, setPassword] = useState('admin123');

  // Form fields for Hostel Admin
  const [hostelAdminName, setHostelAdminName] = useState('');
  const [hostelAdminMobile, setHostelAdminMobile] = useState('');
  const [hostelDesignation, setHostelDesignation] = useState('Warden');
  const [mockOtpOnScreen, setMockOtpOnScreen] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [hostelOtpStep, setHostelOtpStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('Please enter your Employee ID / Username.');
      return;
    }
    setError('');
    setLoading(true);

    const roleToSubmit = activeTab === 'super_admin'
      ? 'super_admin'
      : (adminType === 'HOD' ? 'hod' : 'faculty');

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleToSubmit,
          username: empId.trim(),
          password: password.trim(),
          employee_id: empId.trim(),
          college_name: collegeName.trim(),
          department: department.trim(),
          designation: activeTab === 'super_admin' ? 'Super Admin' : adminType
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onLoginSuccess(data);
      } else {
        setError(data.detail || data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('Cannot connect to backend server on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostelAdminRequestOtp = async (e) => {
    e.preventDefault();
    if (!hostelAdminName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!hostelAdminMobile.trim()) {
      setError('Please enter your mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'hostel_admin',
          name: hostelAdminName.trim(),
          mobile: hostelAdminMobile.trim(),
          designation: hostelDesignation,
          college_name: collegeName
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'otp_sent') {
        setMockOtpOnScreen(data.generated_mock_otp);
        setHostelOtpStep(2);
      } else {
        setError(data.message || 'Failed to generate mock OTP.');
      }
    } catch (err) {
      setError('Backend connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleHostelAdminVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp.trim()) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'hostel_admin',
          name: hostelAdminName.trim(),
          mobile: hostelAdminMobile.trim(),
          designation: hostelDesignation,
          otp: enteredOtp.trim(),
          college_name: collegeName
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onLoginSuccess(data);
      } else {
        setError(data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      setError('Backend connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] flex flex-col items-center justify-center p-4 bg-gradient-to-br from-orange-50/80 via-rose-50/50 to-amber-50/40 overflow-hidden">
      <div className="relative z-10 max-w-md w-full bg-white/95 backdrop-blur-xl border border-orange-100/80 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-orange-900/5 animate-fade-in flex flex-col items-center max-h-[95vh] overflow-y-auto">
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to role selection
          </button>
        </div>

        {/* SRKR Engineering College Logo at Top Middle */}
        <div className="mb-4 flex justify-center">
          <img
            src="/srkr_logo.png"
            alt="SRKR Engineering College Logo"
            className="h-14 sm:h-16 object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-5 w-full border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white text-orange-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Academic / Hostel Admin
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('super_admin')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'super_admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Super Admin
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4 w-full">
          <div className={`w-10 h-10 rounded-2xl text-white flex items-center justify-center shrink-0 shadow-lg ${
            activeTab === 'super_admin' ? 'bg-slate-900 shadow-slate-900/30' : 'bg-orange-600 shadow-orange-600/30'
          }`}>
            {activeTab === 'super_admin' ? <Building2 className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {activeTab === 'super_admin' ? 'Super Admin Portal' : `${adminType} Access`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'super_admin' ? 'Campus broadcast & overall scope' : 'Official administration onboarding'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium w-full">
            {error}
          </div>
        )}

        {/* Admin Designation Switcher (HOD / Faculty / Hostel Admin) */}
        {activeTab === 'admin' && (
          <div className="mb-4 w-full">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              DESIGNATION CHOICE
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => { setAdminType('HOD'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'HOD' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                HOD
              </button>
              <button
                type="button"
                onClick={() => { setAdminType('Faculty'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'Faculty' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => { setAdminType('Hostel Admin'); setError(''); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'Hostel Admin' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                Hostel Admin
              </button>
            </div>
          </div>
        )}

        {/* 1. Hostel Admin Form */}
        {activeTab === 'admin' && adminType === 'Hostel Admin' ? (
          hostelOtpStep === 1 ? (
            <form onSubmit={handleHostelAdminRequestOtp} className="space-y-3.5 w-full">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={hostelAdminName}
                  onChange={(e) => setHostelAdminName(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-600 text-slate-900 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  MOBILE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={hostelAdminMobile}
                  onChange={(e) => setHostelAdminMobile(e.target.value)}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-600 text-slate-900 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  HOSTEL DESIGNATION
                </label>
                <select
                  value={hostelDesignation}
                  onChange={(e) => setHostelDesignation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-semibold outline-none transition-all cursor-pointer"
                >
                  <option value="Warden">Hostel Warden</option>
                  <option value="Coordinator">Hostel Coordinator</option>
                  <option value="In-charge">Hostel In-charge</option>
                </select>
              </div>

              <div className="pt-1">
                <SpecularButton
                  type="submit"
                  disabled={loading}
                  baseColor="#d97706"
                  className="w-full"
                >
                  {loading ? 'Generating Mock OTP...' : 'Generate On-Screen Mock OTP'}
                </SpecularButton>
              </div>
            </form>
          ) : (
            <form onSubmit={handleHostelAdminVerifyOtp} className="space-y-3.5 w-full">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <span className="text-xs font-bold flex items-center gap-1.5 text-amber-700">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" /> UI Mock OTP Code:
                </span>
                <div className="text-2xl font-mono font-extrabold tracking-widest text-amber-800 text-center py-1 bg-amber-100/70 rounded-xl">
                  {mockOtpOnScreen}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ENTER MOCK OTP CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Enter 6-digit code"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-center font-mono text-xl tracking-widest outline-none transition-all"
                />
              </div>

              <div className="pt-1">
                <SpecularButton
                  type="submit"
                  disabled={loading}
                  baseColor="#d97706"
                  className="w-full"
                >
                  {loading ? 'Verifying...' : `Enter ${hostelDesignation} Dashboard`}
                </SpecularButton>
              </div>
            </form>
          )
        ) : (
          /* 2. HOD / Faculty / Super Admin Form */
          <form onSubmit={handleStandardSubmit} className="space-y-3.5 w-full">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                EMPLOYEE ID / USERNAME
              </label>
              <input
                type="text"
                required
                placeholder={activeTab === 'super_admin' ? 'SUPER_001' : 'hosteladmin_arjun'}
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                COLLEGE NAME
              </label>
              <input
                type="text"
                required
                placeholder="SRKR Engineering College"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            {activeTab === 'admin' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-indigo-600" /> DEPARTMENT
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-xs font-bold outline-none transition-all cursor-pointer"
                >
                  <option value="CSE">CSE (Computer Science & Engineering)</option>
                  <option value="ECE">ECE (Electronics & Communication)</option>
                  <option value="EEE">EEE (Electrical & Electronics)</option>
                  <option value="MECHANICAL">MECHANICAL Engineering</option>
                  <option value="IT">IT (Information Technology)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                PERSONAL PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            <div className="pt-1">
              <SpecularButton
                type="submit"
                disabled={loading}
                baseColor={activeTab === 'super_admin' ? '#0f172a' : '#4f46e5'}
                className="w-full"
              >
                {loading ? 'Authenticating...' : `Enter ${activeTab === 'super_admin' ? 'Super Admin' : adminType} Dashboard`}
              </SpecularButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
