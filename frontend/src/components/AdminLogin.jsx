import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Building2, CheckCircle2, Building, Home, Lock, Info } from 'lucide-react';
import SpecularButton from './SpecularButton';
import { API_URL } from '../config';

const AdminLogin = ({ onBack, onLoginSuccess, initialTab = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'admin' or 'super_admin'
  const [adminType, setAdminType] = useState('HOD'); // 'HOD', 'Faculty', 'Hostel Admin'

  // Super Admin category choice
  const [superAdminCategory, setSuperAdminCategory] = useState('college'); // 'college' or 'hostel'

  // Form fields for HOD / Faculty / Super Admin / Hostel Admin
  const [empId, setEmpId] = useState('hod_cse');
  const [password, setPassword] = useState('admin123');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardSubmit = async (e) => {
    e.preventDefault();
    if (!empId.trim()) {
      setError('Please enter your Employee ID / Username.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    setError('');
    setLoading(true);

    let roleToSubmit = 'hod';
    if (activeTab === 'super_admin') {
      roleToSubmit = 'super_admin';
    } else if (adminType === 'Hostel Admin') {
      roleToSubmit = 'hostel_admin';
    } else if (adminType === 'Faculty') {
      roleToSubmit = 'faculty';
    }

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: roleToSubmit,
          username: empId.trim(),
          password: password.trim(),
          employee_id: empId.trim(),
          super_admin_type: superAdminCategory
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        onLoginSuccess(data);
      } else {
        setError(data.detail || data.message || 'Authentication failed.');
      }
    } catch (err) {
      setError('Cannot connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSuperAdmin = (type, uname, pwd) => {
    setSuperAdminCategory(type);
    setEmpId(uname);
    setPassword(pwd);
    setError('');
  };

  const handlePresetStaff = (type, uname, pwd) => {
    setAdminType(type);
    setEmpId(uname);
    setPassword(pwd);
    setError('');
  };

  return (
    <div className="login-bg-container relative w-full h-[100dvh] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="glass-panel-pure max-w-md w-full p-7 sm:p-8 animate-fade-in flex flex-col items-center max-h-[95vh] overflow-y-auto">
        {/* Top Navigation */}
        <div className="w-full flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to role selection
          </button>
        </div>

        {/* SRKR Engineering College Logo */}
        <div className="mb-4 flex justify-center">
          <img
            src="/srkr_logo.png"
            alt="SRKR Engineering College Logo"
            className="h-14 sm:h-16 object-contain filter drop-shadow-md hover:scale-105 transition-transform"
          />
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl mb-4 w-full border border-white/20">
          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); handlePresetStaff('HOD', 'hod_cse', 'admin123'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white/25 text-white shadow-xs border border-white/30 backdrop-blur-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Academic / Hostel Admin
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('super_admin'); setError(''); handlePresetSuperAdmin('college', 'superadmin_main', 'admin123'); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'super_admin'
                ? 'bg-white/25 text-white shadow-xs border border-white/30 backdrop-blur-md'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Super Admin
          </button>
        </div>

        <div className="flex items-center gap-3 mb-3 w-full">
          <div className="w-10 h-10 rounded-2xl glass-icon-badge flex items-center justify-center shrink-0 shadow-inner">
            {activeTab === 'super_admin' ? <Building2 className="w-5 h-5 text-white" /> : <ShieldCheck className="w-5 h-5 text-white" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {activeTab === 'super_admin'
                ? (superAdminCategory === 'hostel' ? 'Hostel Super Admin Portal' : 'College Super Admin Portal')
                : `${adminType} Access`}
            </h2>
            <p className="text-xs text-white/80 font-medium">
              {activeTab === 'super_admin' ? 'Full administrative authority & provisioning scope' : 'Invite-only staff administration portal'}
            </p>
          </div>
        </div>

        {/* Invite-Only Banner Notice */}
        <div className="p-3 mb-4 rounded-2xl bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-white text-xs font-medium w-full flex items-start gap-2">
          <Info className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p className="leading-tight text-white/90">
            <strong className="text-white">Invite-Only Access:</strong> Staff accounts are provisioned exclusively by Campus Super Admin. Enter your assigned credentials below.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/25 backdrop-blur-md border border-red-400/40 text-red-100 text-xs font-medium w-full">
            {error}
          </div>
        )}

        {/* Super Admin Sub-Category Selector */}
        {activeTab === 'super_admin' && (
          <div className="mb-4 w-full space-y-2">
            <label className="block text-xs font-bold text-white/90 uppercase tracking-wider">
              SUPER ADMIN CATEGORY
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <button
                type="button"
                onClick={() => handlePresetSuperAdmin('college', 'superadmin_main', 'admin123')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  superAdminCategory === 'college'
                    ? 'bg-white/30 text-white border border-white/40 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" /> College Super Admin
              </button>
              <button
                type="button"
                onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 1', '123456')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  superAdminCategory === 'hostel'
                    ? 'bg-white/30 text-white border border-white/40 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Hostel Super Admin
              </button>
            </div>

            {/* Quick pre-set options for Hostel Super Admin */}
            {superAdminCategory === 'hostel' && (
              <div className="p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl space-y-1.5 text-xs text-white">
                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-200 block">
                  Select Hostel Super Admin Member:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 1', '123456')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                      empId === 'hostel admin 1' ? 'bg-white/30 text-white border-white/50' : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    1) hostel admin 1
                    <span className="block text-[10px] opacity-80">Pwd: 123456</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 2', '12345')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                      empId === 'hostel admin 2' ? 'bg-white/30 text-white border-white/50' : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    2) hostel admin 2
                    <span className="block text-[10px] opacity-80">Pwd: 12345</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Academic / Hostel Admin Designation Switcher */}
        {activeTab === 'admin' && (
          <div className="mb-4 w-full space-y-2">
            <label className="block text-xs font-bold text-white/90 uppercase tracking-wider">
              SELECT STAFF ROLE PRESET
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
              <button
                type="button"
                onClick={() => handlePresetStaff('HOD', 'hod_cse', 'admin123')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'HOD' ? 'bg-white/30 text-white border border-white/40 shadow-xs' : 'text-white/70 hover:text-white'
                }`}
              >
                HOD
              </button>
              <button
                type="button"
                onClick={() => handlePresetStaff('Faculty', 'fac_cse', 'admin123')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'Faculty' ? 'bg-white/30 text-white border border-white/40 shadow-xs' : 'text-white/70 hover:text-white'
                }`}
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handlePresetStaff('Hostel Admin', 'warden_rajesh', '123456')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'Hostel Admin' ? 'bg-white/30 text-white border border-white/40 shadow-xs' : 'text-white/70 hover:text-white'
                }`}
              >
                Hostel Admin
              </button>
            </div>
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-3.5 w-full">
          <div>
            <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-1">
              PROVISIONED USERNAME / ID
            </label>
            <input
              type="text"
              required
              placeholder="Enter provisioned username"
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="glass-input-pure w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 uppercase tracking-wider mb-1">
              PASSWORD
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass-input-pure w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition-all"
            />
          </div>

          <div className="pt-1">
            <SpecularButton
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Authenticating...' : `Enter ${activeTab === 'super_admin' ? (superAdminCategory === 'hostel' ? 'Hostel Super Admin' : 'College Super Admin') : adminType} Dashboard`}
            </SpecularButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

