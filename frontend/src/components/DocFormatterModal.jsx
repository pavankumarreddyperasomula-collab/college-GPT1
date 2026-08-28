import React, { useState } from 'react';
import { 
  X, Sparkles, Upload, Download, FileText, CheckCircle2, AlertCircle, 
  Send, Users, Search, UserCheck, Calendar, ShieldCheck, Tag, ChevronDown, ChevronUp, FileCode, Trash2
} from 'lucide-react';
import { API_URL } from '../config';

const DocFormatterModal = ({ isOpen, onClose, user, documents = [], onDocumentPublished }) => {
  const role = (user?.role || 'student').toLowerCase();
  const isAdmin = ['hod', 'super_admin', 'hostel_admin', 'faculty', 'admin_hod', 'admin_faculty'].includes(role);

  // Tab State: 'received' or 'create'
  const [activeTab, setActiveTab] = useState('received');

  // Form State
  const [docTitle, setDocTitle] = useState('');
  const [senderName, setSenderName] = useState(
    user?.name || user?.username || (role === 'hostel_admin' ? 'Warden Rajesh' : 'Dr. K. V. Sharma')
  );
  const [senderDesignation, setSenderDesignation] = useState(
    user?.designation || (role === 'hostel_admin' ? 'Chief Hostel Administrator' : (role === 'super_admin' ? 'Super Administrator' : 'Head of Department (HOD - CSE)'))
  );
  const [targetScope, setTargetScope] = useState(
    user?.hod_code || user?.department || 'ALL'
  );
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [fileName, setFileName] = useState('');

  // UI States
  const [formatting, setFormatting] = useState(false);
  const [sendingToStudents, setSendingToStudents] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedDocId, setExpandedDocId] = useState(null);

  if (!isOpen) return null;

  // File Upload Handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    if (!docTitle) {
      setDocTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setRawText(event.target.result || '');
    };
    reader.onerror = () => {
      setError('Failed to read uploaded file content.');
    };
    reader.readAsText(file);
  };

  // AI Formatting Handler
  const handleFormatAI = async () => {
    if (!rawText.trim()) {
      setError('Please paste raw text or upload a file first.');
      return;
    }
    setError('');
    setFormatting(true);

    try {
      const res = await fetch(`${API_URL}/format-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle.trim() || 'Organized Campus Document',
          raw_text: rawText.trim()
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setFormattedText(data.formatted_text);
        setSuccessMsg('Document formatted & organized successfully by COLLEGE GPT!');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(data.detail || data.message || 'Failed to format document.');
      }
    } catch (err) {
      setError('Cannot connect to backend server for document formatting.');
    } finally {
      setFormatting(false);
    }
  };

  // Dispatch Document Handler (Sends to Respective Department Students with Sender Identity)
  const handleSendToStudents = async () => {
    const contentToSend = formattedText || rawText;
    if (!contentToSend.trim()) {
      setError('Please provide document content, paste text, or upload a file first.');
      return;
    }
    const finalTitle = docTitle.trim() || 'Official Department Document';

    setError('');
    setSendingToStudents(true);

    const category = role === 'hostel_admin' ? 'hostel' : 'college';
    const finalScope = targetScope.trim() || user?.hod_code || user?.department || 'ALL';

    try {
      const res = await fetch(`${API_URL}/send-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: finalTitle,
          body: contentToSend.trim(),
          file_name: fileName || `${finalTitle.replace(/\s+/g, '_')}.txt`,
          category: category,
          sender_name: senderName.trim() || user?.name || user?.username || 'Faculty Authority',
          sender_designation: senderDesignation.trim() || user?.designation || 'Department Authority',
          sender_role: role,
          sender_scope: finalScope
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMsg(`Document "${finalTitle}" dispatched directly to ${finalScope} students by ${senderName} (${senderDesignation})!`);
        if (onDocumentPublished) onDocumentPublished();
        setTimeout(() => {
          setSuccessMsg('');
          setActiveTab('received');
        }, 2000);
      } else {
        setError(data.detail || data.message || 'Failed to send document to students.');
      }
    } catch (err) {
      setError('Connection error while dispatching document to students.');
    } finally {
      setSendingToStudents(false);
    }
  };

  // Download Document File
  const handleDownloadDoc = (docToDownload) => {
    const content = docToDownload.body || docToDownload.formattedText || rawText;
    if (!content) return;

    const title = docToDownload.title || docTitle || 'Document';
    const cleanTitle = title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanTitle}_SRKR.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered Documents Search
  const filteredDocs = documents.filter((d) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.body?.toLowerCase().includes(q) ||
      d.sender_name?.toLowerCase().includes(q) ||
      d.sender_designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/25 backdrop-blur-md animate-fade-in">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200/60 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-md shadow-slate-900/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Official Department Documents & AI Tools
                <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 text-xs font-black">
                  {documents.length} Available
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="px-6 pt-3 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                activeTab === 'received'
                  ? 'bg-white text-slate-900 border-slate-200 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 border-transparent bg-transparent'
              }`}
            >
              <FileCode className="w-4 h-4 text-orange-600" />
              <span>Received Department Documents</span>
              {documents.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black">
                  {documents.length}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('create')}
                className={`px-4 py-2.5 text-xs font-extrabold rounded-t-2xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
                  activeTab === 'create'
                    ? 'bg-white text-slate-900 border-slate-200 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 border-transparent bg-transparent'
                }`}
              >
                <Upload className="w-4 h-4 text-violet-600" />
                <span>Upload / Create & Dispatch Document</span>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-black uppercase">
                  Admin Mode
                </span>
              </button>
            )}
          </div>

          {activeTab === 'received' && (
            <div className="relative hidden sm:block mb-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search documents or sender..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 outline-none focus:border-slate-400"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: RECEIVED DEPARTMENT DOCUMENTS */}
          {activeTab === 'received' && (
            <div className="space-y-4">
              {filteredDocs.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-800">No documents received yet</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Official files and guidelines sent by your HOD or Faculty will appear here.
                  </p>
                </div>
              ) : (
                filteredDocs.map((doc) => {
                  const isExpanded = expandedDocId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Document Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-extrabold uppercase border border-slate-200">
                              📄 {doc.file_name || 'Document'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-black uppercase">
                              Scope: {doc.sender_scope || 'ALL'}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                            {doc.title}
                          </h4>
                        </div>

                        {/* Download & Date & Delete */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isAdmin && (
                            <button
                              onClick={async () => {
                                if (!window.confirm('Are you sure you want to delete this document?')) return;
                                try {
                                  const res = await fetch(`${API_URL}/delete-document/${encodeURIComponent(doc.id)}`, {
                                    method: 'DELETE'
                                  });
                                  if (res.ok && onDocumentPublished) {
                                    onDocumentPublished();
                                  }
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer border border-red-200"
                              title="Delete document"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDownloadDoc(doc)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download (.txt)</span>
                          </button>
                        </div>
                      </div>

                      {/* Sender Identity Section (Highlighting Name & Designation) */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0 font-black text-sm">
                            <UserCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-[10px] font-extrabold text-orange-300 uppercase tracking-wider flex items-center gap-1">
                              <span>OFFICIAL SENDER IDENTITY</span>
                              <ShieldCheck className="w-3 h-3 text-orange-400" />
                            </div>
                            <h5 className="text-xs sm:text-sm font-black text-white">
                              {doc.sender_name || 'Faculty Member'}{' '}
                              <span className="font-normal text-slate-300">
                                ({doc.sender_designation || 'Department Authority'})
                              </span>
                            </h5>
                          </div>
                        </div>

                        <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1 bg-white/10 px-3 py-1 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-orange-400" />
                          <span>{doc.date_time_str || doc.created_at?.split('T')[0] || '20-08-2026'}</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans space-y-2">
                        <p className={isExpanded ? '' : 'line-clamp-3 font-medium'}>
                          {doc.body}
                        </p>
                        {doc.body && doc.body.length > 180 && (
                          <button
                            onClick={() => setExpandedDocId(isExpanded ? null : doc.id)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer pt-1"
                          >
                            {isExpanded ? (
                              <>Show Less <ChevronUp className="w-3.5 h-3.5" /></>
                            ) : (
                              <>Read Full Document Content <ChevronDown className="w-3.5 h-3.5" /></>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD / CREATE & DISPATCH DOCUMENT (ADMIN MODE) */}
          {activeTab === 'create' && isAdmin && (
            <div className="space-y-4">
              {/* Sender Details Input Box */}
              {/* Sender Details Input Box & Target Scope */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center gap-2 text-orange-400 font-extrabold text-xs uppercase tracking-wider">
                  <UserCheck className="w-4 h-4" />
                  <span>Sender Identity Metadata & Target Audience Scope</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                      Sender Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. K. V. Sharma"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-1">
                      Sender Designation
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Head of Department (HOD - CSE)"
                      value={senderDesignation}
                      onChange={(e) => setSenderDesignation(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs font-bold outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-extrabold text-amber-300 uppercase tracking-wider mb-1">
                      Target Department Scope
                    </label>
                    <select
                      value={targetScope}
                      onChange={(e) => setTargetScope(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 text-amber-200 border border-slate-700 text-xs font-bold outline-none focus:border-orange-500"
                    >
                      <option value="AIDS">AIDS - AI & Data Science</option>
                      <option value="CSE">CSE - Computer Science & Engg</option>
                      <option value="ECE">ECE - Electronics & Comm Engg</option>
                      <option value="EEE">EEE - Electrical & Electronics</option>
                      <option value="MECH">MECH - Mechanical Engg</option>
                      <option value="CIVIL">CIVIL - Civil Engg</option>
                      <option value="HOSTEL">HOSTEL - Resident Students</option>
                      <option value="ALL">ALL - All Campus Students</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Document Title & File Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Document Topic / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. R23 AI & DS Unit 1 Lab Manual"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-slate-700 text-slate-900 text-sm outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Upload File (.txt, .md, .doc)
                  </label>
                  <label className="w-full py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 border border-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="truncate">{fileName || 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".txt,.md,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Content Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Document Content / Text Body</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Uploaded file content or typed text will be sent to students
                  </span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Type document text or upload a file above..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-white border border-slate-200 focus:border-slate-700 text-slate-900 text-xs leading-relaxed outline-none resize-none font-sans"
                />
              </div>

              {/* Optional AI Format Button */}
              <button
                onClick={handleFormatAI}
                disabled={formatting || !rawText.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 text-emerald-400 ${formatting ? 'animate-spin' : ''}`} />
                {formatting ? 'Formatting Document with AI...' : 'Optional: AI Format Document with COLLEGE GPT'}
              </button>

              {/* Formatted Text Preview */}
              {formattedText && (
                <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto border border-slate-800">
                  {formattedText}
                </div>
              )}

              {/* Send Document Dispatch Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-violet-700" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-950">
                      Dispatch Document to Students
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-violet-700 bg-white px-2 py-0.5 rounded-md border border-violet-200">
                    Target Scope: {targetScope || 'ALL'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Sends this uploaded/created document directly to students in department scope{' '}
                  <strong className="text-violet-950">{targetScope || 'ALL'}</strong>.
                  Sender identity will be displayed as: <strong className="text-slate-900">{senderName}</strong> ({senderDesignation}).
                </p>
                <button
                  onClick={handleSendToStudents}
                  disabled={sendingToStudents || (!formattedText && !rawText)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className={`w-4 h-4 ${sendingToStudents ? 'animate-spin' : ''}`} />
                  {sendingToStudents ? 'Dispatching Document to Students...' : `📤 Send Document directly to ${targetScope || 'ALL'} Students`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
          <span className="text-xs text-slate-500 font-bold">
            SRKR Engineering College Official Department Document Exchange
          </span>
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

export default DocFormatterModal;
