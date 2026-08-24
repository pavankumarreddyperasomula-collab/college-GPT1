import React, { useState, useEffect } from 'react';
import { X, User, ShieldCheck, Key, Home, Building, Phone, Briefcase, GitBranch, GraduationCap, Lock, Upload, UserPlus, FileText, Trash2, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config';

const ProfileModal = ({ isOpen, onClose, user, onUserUpdated }) => {
  if (!isOpen || !user) return null;

  const role = (user.role || 'student').toLowerCase();
  const isHostelSuperAdmin = role === 'super_admin' && (user.super_admin_type === 'hostel' || user.category === 'hostel' || (user.username && user.username.toLowerCase().includes('hostel')));
  const isCollegeSuperAdmin = role === 'super_admin' && !isHostelSuperAdmin;
  const isHostelAdmin = role === 'hostel_admin' || isHostelSuperAdmin;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'credentials', 'create_admin', 'upload_students'

  // Change Credentials Form state
  const [newUsername, setNewUsername] = useState(user.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [credMsg, setCredMsg] = useState('');
  const [credError, setCredError] = useState('');
  const [credLoading, setCredLoading] = useState(false);

  // Create Hostel Admin Form state
  const [adminUname, setAdminUname] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  const [adminDesig, setAdminDesig] = useState('Hostel Warden Block A');
  const [createMsg, setCreateMsg] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Upload Hostel Students Data state
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

  const handleCreateHostelAdmin = async (e) => {
    e.preventDefault();
    setCreateMsg('');
    setCreateError('');
    setCreateLoading(true);

    try {
      const res = await fetch(`${API_URL}/create-hostel-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          created_by: user.username,
          username: adminUname.trim(),
          password: adminPwd.trim(),
          designation: adminDesig
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setCreateMsg(data.message);
        setAdminUname('');
        setAdminPwd('');
      } else {
        setCreateError(data.detail || data.message || 'Failed to create Hostel Admin.');
      }
    } catch (err) {
      setCreateError('Backend server error.');
    } finally {
      setCreateLoading(false);
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
                {isHostelSuperAdmin ? 'Hostel Super Admin Hub' : 'User Account & Profile'}
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

          {isHostelSuperAdmin && (
            <button
              onClick={() => setActiveTab('create_admin')}
              className={`px-3 py-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                activeTab === 'create_admin' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-600" /> Create Hostel Admin
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

                {isHostelSuperAdmin && (
                  <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-300 space-y-2 text-xs text-amber-950">
                    <h5 className="font-black flex items-center gap-1.5 text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-700" /> Hostel Super Admin Directives
                    </h5>
                    <p className="leading-relaxed">
                      You are one of the 2 authorized Hostel Super Admin members. You have overall hostel administration rights, including uploading student rosters and creating Hostel Admins.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE CREDENTIALS */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleChangeCredentials} className="space-y-3.5">
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl text-xs text-violet-900 font-medium">
                Update your login username and/or personal password. Next login will require the updated credentials.
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
                  disabled
                  value={user.username}
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

          {/* TAB 4: CREATE HOSTEL ADMIN (HOSTEL SUPER ADMIN ONLY) */}
          {activeTab === 'create_admin' && isHostelSuperAdmin && (
            <form onSubmit={handleCreateHostelAdmin} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                As Hostel Super Admin, create a new Hostel Admin user and assign their username & password.
              </div>

              {createMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {createMsg}
                </div>
              )}

              {createError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  HOSTEL ADMIN USERNAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hostel_warden_block_b"
                  value={adminUname}
                  onChange={(e) => setAdminUname(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-sm font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  ASSIGN INITIAL PASSWORD
                </label>
                <input
                  type="password"
                  required
                  placeholder="Assign password"
                  value={adminPwd}
                  onChange={(e) => setAdminPwd(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  DESIGNATION / BLOCK
                </label>
                <input
                  type="text"
                  placeholder="e.g. Warden - Block A"
                  value={adminDesig}
                  onChange={(e) => setAdminDesig(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 text-xs font-semibold outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={createLoading || !adminUname.trim() || !adminPwd.trim()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                {createLoading ? 'Creating Account...' : 'Create & Save Hostel Admin Credentials'}
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
