import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Key, Home, Building, Phone, Briefcase, GitBranch, GraduationCap, Lock, Upload, UserPlus, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';

const ProfileModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  if (!isOpen || !user) return null;

  const role = (user.role || 'student').toLowerCase();
  const isHostelSuperAdmin = role === 'super_admin' && (user.super_admin_type === 'hostel' || user.category === 'hostel' || (user.username && user.username.toLowerCase().includes('hostel')));
  const isCollegeSuperAdmin = role === 'super_admin' && !isHostelSuperAdmin;
  const isSuperAdmin = role === 'super_admin';
  const isHostelAdmin = role === 'hostel_admin' || isHostelSuperAdmin;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'credentials', 'create_staff', 'upload_students'

  // Change Credentials Form state
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [credMsg, setCredMsg] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // Staff Account Provisioning State (Super Admin Only)
  const [staffRole, setStaffRole] = useState('hod'); // 'hod', 'faculty', 'hostel_admin'
  const [staffUname, setStaffUname] = useState('');
  const [staffPwd, setStaffPwd] = useState('');
  const [staffDept, setStaffDept] = useState('CSE');
  const [staffDesig, setStaffDesig] = useState('');
  const [staffMobile, setStaffMobile] = useState('9876543210');
  const [staffMsg, setStaffMsg] = useState('');
  const [staffError, setStaffError] = useState('');
  const [staffLoading, setStaffLoading] = useState(false);

  // Hostel Roster Upload State
  const [rawStudentData, setRawStudentData] = useState('');
  const [fileName, setFileName] = useState('');
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [hostelStudentsList, setHostelStudentsList] = useState([]);

  const fetchHostelStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/hostel-students`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setHostelStudentsList(data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen && isHostelAdmin) {
      fetchHostelStudents();
    }
  }, [isOpen, isHostelAdmin]);

  const handleChangeCredentials = async (e) => {
    e.preventDefault();
    setCredMsg('');
    setCredError('');
    setCredLoading(true);

    try {
      const res = await fetch(`${API_URL}/change-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_username: user.username,
          new_username: newUsername.trim(),
          new_password: newPassword.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCredMsg(data.message || 'Credentials updated successfully!');
        if (onUserUpdated && data.user) {
          onUserUpdated(data.user);
        }
      } else {
        setCredError(data.detail || data.message || 'Failed to update credentials.');
      }
    } catch (err) {
      setCredError('Backend server error.');
    } finally {
      setCredLoading(false);
    }
  };

  const handleCreateStaffAccount = async (e) => {
    e.preventDefault();
    setStaffMsg('');
    setStaffError('');
    setStaffLoading(true);

    try {
      const res = await fetch(`${API_URL}/create-staff-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          created_by: user.username,
          role: staffRole,
          username: staffUname.trim(),
          password: staffPwd.trim(),
          department: staffDept,
          designation: staffDesig.trim() || undefined,
          mobile: staffMobile.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setStaffMsg(data.message);
        setStaffUname('');
        setStaffPwd('');
        setStaffDesig('');
      } else {
        setStaffError(data.detail || data.message || 'Failed to provision staff account.');
      }
    } catch (err) {
      setStaffError('Backend server error.');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      setRawStudentData(evt.target.result || '');
    };
    reader.readAsText(file);
  };

  const handleUploadStudents = async (e) => {
    e.preventDefault();
    setUploadMsg('');
    setUploadError('');
    setUploadLoading(true);

    try {
      const res = await fetch(`${API_URL}/upload-hostel-students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploaded_by: user.username,
          file_name: fileName || 'hostel_roster.txt',
          raw_content: rawStudentData
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setUploadMsg(data.message);
        setRawStudentData('');
        setFileName('');
        fetchHostelStudents();
      } else {
        setUploadError(data.detail || data.message || 'Upload failed.');
      }
    } catch (err) {
      setUploadError('Backend server error.');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteHostelStudent = async (regNo) => {
    try {
      const res = await fetch(`${API_URL}/hostel-students/${encodeURIComponent(regNo)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchHostelStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <img src="/srkr_logo.png" alt="SRKR Logo" className="h-9 object-contain" />
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                {isHostelSuperAdmin ? 'Hostel Super Admin Hub' : (isCollegeSuperAdmin ? 'College Super Admin Hub' : 'User Account & Profile')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                SRKR COLLEGE GPT account & settings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              activeTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              activeTab === 'credentials' ? 'bg-white text-violet-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" /> Edit Password
          </button>

          {isHostelAdmin && (
            <button
              onClick={() => setActiveTab('upload_students')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'upload_students' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-amber-600" /> Upload Hostel Roster
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('create_staff')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'create_staff' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" /> Add Staff Member
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: PROFILE INFO */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                isHostelSuperAdmin ? 'bg-amber-50 border-amber-200' : 'bg-violet-50/60 border-violet-100'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Holder</span>
                  <h4 className="text-lg font-extrabold text-slate-900">{user.username || user.name || 'User'}</h4>
                </div>
                <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-xs ${
                  isHostelSuperAdmin ? 'bg-amber-600' : 'bg-violet-600'
                }`}>
                  {isHostelSuperAdmin ? 'Hostel Super Admin' : (user.designation || user.role)}
                </span>
              </div>

              <div className="space-y-3">
                {role === 'student' && (
                  <>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-bold text-slate-600 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-violet-600" /> Department
                      </span>
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {user.department || 'CSE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="font-bold text-slate-600 flex items-center gap-2">
                        <Home className="w-4 h-4 text-orange-600" /> Hostel Resident Status
                      </span>
                      <span className={`font-bold px-2.5 py-1 rounded-lg ${
                        user.is_hostel_resident
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {user.is_hostel_resident ? 'Yes (Verified Hostel Resident)' : 'No (Day Scholar)'}
                      </span>
                    </div>
                  </>
                )}

                {role === 'hostel_admin' && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600" /> Administrative Scope
                    </span>
                    <span className="font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-300">
                      Hostel Student Affairs
                    </span>
                  </div>
                )}

                {isSuperAdmin && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-xs text-indigo-950">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-indigo-900 block flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-indigo-600" /> Invite-Only Staff Account Provisioning Active
                    </span>
                    <p className="leading-relaxed">
                      Public admin self-registration is disabled. Super Admin has exclusive authority to provision HOD, Faculty, and Hostel Admin accounts from the <strong>"Add Staff Member"</strong> tab.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDIT CREDENTIALS */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleChangeCredentials} className="space-y-3.5">
              <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl text-xs text-violet-900 font-medium">
                Update your account username and password for instant login.
              </div>

              {credMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {credMsg}
                </div>
              )}

              {credError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {credError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  CURRENT USERNAME
                </label>
                <input
                  type="text"
                  readOnly
                  value={user.username || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NEW USERNAME
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={credLoading}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                {credLoading ? 'Saving Changes...' : 'Save New Credentials'}
              </button>
            </form>
          )}

          {/* TAB 3: UPLOAD HOSTEL STUDENT ROSTER */}
          {activeTab === 'upload_students' && isHostelAdmin && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium">
                Upload student registration numbers/data file (PDF, CSV, TXT, or paste list). Students matching these registration numbers are automatically identified as Hostel Residents.
              </div>

              {uploadMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {uploadMsg}
                </div>
              )}

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadStudents} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    SELECT DOCUMENT FILE (TXT / CSV)
                  </label>
                  <input
                    type="file"
                    accept=".txt,.csv,.json,.doc,.pdf"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    OR PASTE STUDENT REGISTRATION NUMBERS (ONE PER LINE)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="25b91a54j0&#10;25b91a1201&#10;25b91a54k9"
                    value={rawStudentData}
                    onChange={(e) => setRawStudentData(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadLoading || !rawStudentData.trim()}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  {uploadLoading ? 'Indexing Roster...' : 'Upload & Index Hostel Student Roster'}
                </button>
              </form>

              {/* Display currently indexed Hostel Students Roster */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-800">
                  <span>Currently Indexed Hostel Students ({hostelStudentsList.length}):</span>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                  {hostelStudentsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">No hostel students indexed yet.</p>
                  ) : (
                    hostelStudentsList.map((st, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-mono">
                        <span className="font-bold text-slate-800">{st}</span>
                        <button
                          onClick={() => handleDeleteHostelStudent(st)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove student"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROVISION STAFF ACCOUNT (SUPER ADMIN ONLY) */}
          {activeTab === 'create_staff' && isSuperAdmin && (
            <form onSubmit={handleCreateStaffAccount} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                Provision a new HOD, Faculty, or Hostel Admin account. Hand the provisioned username & password directly to the staff member.
              </div>

              {staffMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {staffMsg}
                </div>
              )}

              {staffError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {staffError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  STAFF ROLE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setStaffRole('hod')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      staffRole === 'hod' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    HOD
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffRole('faculty')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      staffRole === 'faculty' ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Faculty
                  </button>
                  <button
                    type="button"
                    onClick={() => setStaffRole('hostel_admin')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      staffRole === 'hostel_admin' ? 'bg-amber-600 text-white border-amber-700 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Hostel Admin
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    USERNAME / ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. hod_ece_srkr"
                    value={staffUname}
                    onChange={(e) => setStaffUname(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    ASSIGN PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Initial password"
                    value={staffPwd}
                    onChange={(e) => setStaffPwd(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-bold outline-none"
                  />
                </div>
              </div>

              {staffRole !== 'hostel_admin' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    DEPARTMENT
                  </label>
                  <select
                    value={staffDept}
                    onChange={(e) => setStaffDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="CSE">CSE (Computer Science)</option>
                    <option value="ECE">ECE (Electronics & Comm.)</option>
                    <option value="EEE">EEE (Electrical & Electronics)</option>
                    <option value="MECHANICAL">MECHANICAL Engineering</option>
                    <option value="IT">IT (Information Technology)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  DESIGNATION / TITLE
                </label>
                <input
                  type="text"
                  placeholder={
                    staffRole === 'hod' ? 'Head of Department (HOD - ECE)' : (staffRole === 'faculty' ? 'Assistant Professor' : 'Warden - Block B')
                  }
                  value={staffDesig}
                  onChange={(e) => setStaffDesig(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-medium outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={staffLoading || !staffUname.trim() || !staffPwd.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                {staffLoading ? 'Provisioning Staff Account...' : `Provision ${staffRole.toUpperCase()} Account`}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
