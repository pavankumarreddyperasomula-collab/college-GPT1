import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Building2, CheckCircle2, Building, Home } from 'lucide-react';
import SpecularButton from './SpecularButton';
import { API_URL } from '../config';

const AdminLogin = ({ onBack, onLoginSuccess, initialTab = 'admin' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'admin' or 'super_admin'
  const [adminType, setAdminType] = useState('HOD'); // 'HOD', 'Faculty', 'Hostel Admin'

  // Super Admin category choice
  const [superAdminCategory, setSuperAdminCategory] = useState('college'); // 'college' or 'hostel'

  // Form fields for HOD / Faculty / Super Admin / Hostel Admin
  const [empId, setEmpId] = useState('');
  const [collegeName, setCollegeName] = useState('SRKR Engineering College');
  const [department, setDepartment] = useState('CSE');
  const [password, setPassword] = useState('');

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
          college_name: collegeName.trim(),
          department: department.trim(),
          super_admin_type: superAdminCategory,
          designation: activeTab === 'super_admin'
            ? (superAdminCategory === 'hostel' ? 'Hostel Super Admin' : 'College Super Admin')
            : adminType
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

  const handlePresetSuperAdmin = (type, uname, pwd) => {
    setSuperAdminCategory(type);
    setEmpId(uname);
    setPassword(pwd);
    setError('');
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

        {/* SRKR Engineering College Logo */}
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
            onClick={() => { setActiveTab('admin'); setError(''); setEmpId(''); setPassword(''); }}
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
            onClick={() => { setActiveTab('super_admin'); setError(''); setEmpId('superadmin_main'); setPassword('admin123'); }}
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
              {activeTab === 'super_admin'
                ? (superAdminCategory === 'hostel' ? 'Hostel Super Admin Portal' : 'College Super Admin Portal')
                : `${adminType} Access`}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'super_admin' ? 'Full administrative authority & dispatch scope' : 'Official administration portal'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium w-full">
            {error}
          </div>
        )}

        {/* Super Admin Sub-Category Selector */}
        {activeTab === 'super_admin' && (
          <div className="mb-4 w-full space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              SUPER ADMIN CATEGORY
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 border border-slate-200 rounded-xl">
              <button
                type="button"
                onClick={() => handlePresetSuperAdmin('college', 'superadmin_main', 'admin123')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  superAdminCategory === 'college'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Building className="w-3.5 h-3.5" /> College Super Admin
              </button>
              <button
                type="button"
                onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 1', '123456')}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  superAdminCategory === 'hostel'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Hostel Super Admin
              </button>
            </div>

            {/* Quick pre-set options for Hostel Super Admin */}
            {superAdminCategory === 'hostel' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs text-amber-900">
                <span className="font-bold text-[11px] uppercase tracking-wider text-amber-800 block">
                  Select Hostel Super Admin Member:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 1', '123456')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                      empId === 'hostel admin 1' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    1) hostel admin 1
                    <span className="block text-[10px] opacity-80">Pwd: 123456</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePresetSuperAdmin('hostel', 'hostel admin 2', '12345')}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold text-left cursor-pointer transition-all ${
                      empId === 'hostel admin 2' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white text-slate-800 border-amber-300 hover:bg-amber-100'
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
                onClick={() => { setAdminType('Hostel Admin'); setError(''); setEmpId('warden_rajesh'); setPassword('123456'); }}
                className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  adminType === 'Hostel Admin' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              USERNAME / ID
            </label>
            <input
              type="text"
              required
              placeholder={
                activeTab === 'super_admin'
                  ? (superAdminCategory === 'hostel' ? 'hostel admin 1' : 'superadmin_main')
                  : (adminType === 'Hostel Admin' ? 'warden_rajesh' : 'HOD_CSE_001')
              }
              value={empId}
              onChange={(e) => setEmpId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-sm outline-none transition-all font-medium"
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
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 text-slate-900 text-sm outline-none transition-all font-medium"
            />
          </div>

          {activeTab === 'admin' && adminType !== 'Hostel Admin' && (
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
              PASSWORD
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
              baseColor={activeTab === 'super_admin' ? (superAdminCategory === 'hostel' ? '#d97706' : '#0f172a') : '#4f46e5'}
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
