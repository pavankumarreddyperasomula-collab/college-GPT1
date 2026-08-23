import React, { useState } from 'react';
import { X, Sparkles, Upload, Download, FileText, CheckCircle2, AlertCircle, Send, ShieldCheck, Key, Users } from 'lucide-react';

const DocFormatterModal = ({ isOpen, onClose, user, onNoticePublished }) => {
  const [docTitle, setDocTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [fileName, setFileName] = useState('');

  const [formatting, setFormatting] = useState(false);
  const [sendingToStudents, setSendingToStudents] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const role = (user?.role || 'student').toLowerCase();
  const isAdmin = ['hod', 'super_admin', 'hostel_admin', 'faculty', 'admin_hod'].includes(role);

  // Handle file upload (.txt, .md, .doc text files)
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

  // Call AI backend to format raw pasted text into organized document
  const handleFormatAI = async () => {
    if (!rawText.trim()) {
      setError('Please paste raw text or upload a file first.');
      return;
    }
    setError('');
    setFormatting(true);

    try {
      const res = await fetch('http://localhost:8000/format-document', {
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

  // Dispatch document directly to respective students based on HOD code
  const handleSendToStudents = async () => {
    const contentToSend = formattedText || rawText;
    if (!contentToSend.trim()) {
      setError('Please provide document content or format raw text first.');
      return;
    }
    const finalTitle = docTitle.trim() || 'Official Department Document';

    setError('');
    setSendingToStudents(true);

    const targetAudience = role === 'hostel_admin' 
      ? ['hostel'] 
      : (role === 'super_admin' ? ['all'] : ['students']);

    const category = role === 'hostel_admin' ? 'hostel' : 'college';
    const senderScope = user?.hod_code || user?.username || 'ALL';

    const now = new Date();
    const startDate = now.toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const res = await fetch('http://localhost:8000/send-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: finalTitle,
          title: finalTitle,
          body: contentToSend.trim(),
          category: category,
          start_date: startDate,
          end_date: endDate,
          audience: targetAudience,
          sender_role: role === 'super_admin' ? 'super_admin' : (role === 'hostel_admin' ? 'hostel_admin' : 'hod'),
          sender_scope: senderScope
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMsg(`Document "${finalTitle}" sent successfully to your respective students (Code: ${senderScope})!`);
        if (onNoticePublished) onNoticePublished();
        setTimeout(() => setSuccessMsg(''), 6000);
      } else {
        setError(data.detail || data.message || 'Failed to send document to students.');
      }
    } catch (err) {
      setError('Connection error while dispatching document to students.');
    } finally {
      setSendingToStudents(false);
    }
  };

  // Download formatted document file
  const handleDownload = () => {
    const contentToDownload = formattedText || rawText;
    if (!contentToDownload.trim()) return;

    const cleanTitle = (docTitle.trim() || 'Organized_Document').replace(/[^a-zA-Z0-9_-]/g, '_');
    const blob = new Blob([contentToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cleanTitle}_Formatted.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-800/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                AI Document Formatter & Dispatch
                {isAdmin && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 text-[10px] font-black uppercase">
                    Admin Mode
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAdmin 
                  ? 'Convert raw text into clean documents & send to respective students based on code'
                  : 'Paste raw website text or upload files → AI organizes into clean structured documents'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Admin Dispatch Scope Banner */}
          {isAdmin && (
            <div className="p-3.5 rounded-2xl bg-violet-50/80 border border-violet-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-violet-900 font-bold">
                <Users className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  {role === 'super_admin' 
                    ? 'Target Scope: Campus-wide Broadcast (All Students)' 
                    : `Target Scope: Respective students linked to code: ${user?.hod_code || 'HOD-MAIN'}`}
                </span>
              </div>
              {user?.hod_code && (
                <span className="font-mono px-2 py-0.5 rounded bg-white text-violet-800 font-extrabold border border-violet-200 text-[11px] self-start sm:self-auto">
                  {user.hod_code}
                </span>
              )}
            </div>
          )}

          {/* Title & File Upload Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Document Topic / Title
              </label>
              <input
                type="text"
                placeholder="e.g. Operating Systems Unit 1 Notes"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                spellCheck={false}
                autoComplete="off"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-700 text-slate-900 text-sm outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Upload File (.txt, .md)
              </label>
              <label className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
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

          {/* Raw Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Paste Raw Unstructured Text</span>
              <span className="text-[11px] text-slate-400 font-normal">Copy text from external websites, articles, or draft notes</span>
            </label>
            <textarea
              rows={5}
              placeholder="Paste raw text here from another website..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              spellCheck={false}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-slate-700 text-slate-900 text-xs leading-relaxed outline-none transition-all resize-none font-sans"
            />
          </div>

          {/* AI Action Button */}
          <div>
            <button
              onClick={handleFormatAI}
              disabled={formatting || !rawText.trim()}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-emerald-400 ${formatting ? 'animate-spin' : ''}`} />
              {formatting ? 'Formatting & Organizing Document with AI...' : 'Format Document with COLLEGE GPT AI'}
            </button>
          </div>

          {/* Formatted Output Preview */}
          {formattedText && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Organized Formatted Document
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> Download (.txt)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto border border-slate-800">
                {formattedText}
              </div>
            </div>
          )}

          {/* ADMIN DISPATCH SECTION */}
          {isAdmin && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-violet-700" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-950">
                    Dispatch Document to Respective Students
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-violet-700 bg-white px-2 py-0.5 rounded-md border border-violet-200">
                  {role === 'super_admin' ? 'Campus-wide' : `Code: ${user?.hod_code || 'HOD'}`}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Sends this converted document as an official circular to your respective students. Students who registered with code <span className="font-mono font-bold text-violet-900">{user?.hod_code || 'SUPER-ADMIN'}</span> will immediately receive it in their notice inbox and AI assistant.
              </p>
              <button
                onClick={handleSendToStudents}
                disabled={sendingToStudents || (!formattedText && !rawText)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-700 hover:to-purple-800 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-violet-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${sendingToStudents ? 'animate-spin' : ''}`} />
                {sendingToStudents ? 'Dispatching to Students...' : `📤 Send Document to Respective Students (${user?.hod_code || 'All'})`}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center">
          <button
            onClick={handleDownload}
            disabled={!formattedText && !rawText}
            className="px-4 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download File
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocFormatterModal;

