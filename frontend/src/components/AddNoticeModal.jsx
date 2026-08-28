import React, { useState, useEffect } from 'react';
import { Sparkles, Send, X, Calendar, Tag, AlertCircle, Edit3 } from 'lucide-react';
import { API_URL } from '../config';

const AddNoticeModal = ({ isOpen, onClose, user, onNoticeAdded }) => {
  const role = (user?.role || 'hod').toLowerCase();

  const [theme, setTheme] = useState('');
  const [category, setCategory] = useState(role === 'hostel_admin' ? 'hostel' : 'college');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  
  const [draftBody, setDraftBody] = useState('');
  
  // Super Admin / HOD audience state
  const [audStudents, setAudStudents] = useState(true);
  const [audFaculty, setAudFaculty] = useState(role === 'hod');
  const [audHods, setAudHods] = useState(false);
  const [audHostel, setAudHostel] = useState(role === 'hostel_admin');
  const [audSuperAdmin, setAudSuperAdmin] = useState(false);
  const [audAll, setAudAll] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (role === 'hostel_admin') {
      setCategory('hostel');
      setAudHostel(true);
    }
  }, [role, isOpen]);

  if (!isOpen) return null;

  const handleGenerateNotice = async () => {
    if (!theme.trim()) {
      setError('Please enter a theme/topic for the notice first.');
      return;
    }
    setError('');
    setGenerating(true);

    try {
      const res = await fetch(`${API_URL}/generate-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          category: category,
          start_date: startDate,
          end_date: endDate
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDraftBody(data.draft_text);
      } else {
        setError(data.message || 'Failed to generate notice draft.');
      }
    } catch (err) {
      setError('Cannot connect to backend server.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!theme.trim() || !draftBody.trim()) {
      setError('Please enter a theme and generate or write the notice content.');
      return;
    }

    let audience = [];
    if (role === 'hostel_admin') {
      audience = ['hostel'];
    } else if (role === 'hod') {
      if (audStudents) audience.push('students');
      if (audFaculty) audience.push('faculty');
      if (audSuperAdmin) audience.push('super_admin');
    } else if (role === 'super_admin') {
      if (audAll) {
        audience = ['all'];
      } else {
        if (audHods) audience.push('hods');
        if (audFaculty) audience.push('faculty');
        if (audStudents) audience.push('students');
        if (audHostel) audience.push('hostel');
      }
    }

    if (audience.length === 0) {
      setError('Please select at least one recipient audience filter.');
      return;
    }

    setError('');
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/send-notice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          title: theme.trim(),
          body: draftBody.trim(),
          category: category,
          start_date: startDate,
          end_date: endDate,
          audience: audience,
          sender_role: role,
          sender_scope: user?.department || user?.hod_code || user?.username || 'ALL'
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMsg(data.message);
        setTimeout(() => {
          setSuccessMsg('');
          onNoticeAdded && onNoticeAdded();
          onClose();
          setTheme('');
          setDraftBody('');
        }, 1500);
      } else {
        setError(data.detail || data.message || 'Failed to publish notice.');
      }
    } catch (err) {
      setError('Connection error while publishing notice.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 backdrop-blur-md animate-fade-in">
      <div className="bg-white/85 backdrop-blur-2xl border border-white/50 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200/60 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Create & Embed Campus Notice</h3>
              <p className="text-xs text-slate-500 font-medium">Role: <strong className="uppercase text-orange-700">{role}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSendNotice} className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Theme/Topic */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Notice Theme / Topic (Marked / Bold)
              </label>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                ⭐ Highlighted in Circular
              </span>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Mid-Semester Examination Schedule & Hostel Curfew Timings"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 text-slate-900 text-sm font-semibold outline-none transition-all"
            />
          </div>

          {/* Dates & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-600" /> Start Date (Marked)
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-orange-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-orange-600" /> End Date (Marked)
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold outline-none focus:border-orange-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-orange-600" /> Category Tag
              </label>
              {role === 'hostel_admin' ? (
                <div className="px-3 py-2.5 rounded-xl bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs uppercase">
                  Hostel (Locked)
                </div>
              ) : (
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold outline-none focus:border-orange-600"
                >
                  <option value="college">College Notice</option>
                  <option value="hostel">Hostel Notice</option>
                </select>
              )}
            </div>
          </div>

          {/* AI Generate Button */}
          <div>
            <button
              type="button"
              onClick={handleGenerateNotice}
              disabled={generating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-orange-900 font-extrabold text-xs flex items-center justify-center gap-2 border border-orange-200 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 text-orange-700 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Drafting Notice with Bold Highlights...' : 'Generate Notice Text with AI (Bold Theme & Dates)'}
            </button>
          </div>

          {/* Editable Draft Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Editable Draft Text
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Use **bold** for key rules</span>
            </label>
            <textarea
              rows={5}
              required
              placeholder="Click 'Generate Notice Text with AI' or write official notice content here..."
              value={draftBody}
              onChange={(e) => setDraftBody(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 text-slate-900 text-sm leading-relaxed outline-none transition-all resize-none"
            />
          </div>

          {/* Recipient Audience Options per Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Audience Filters (Role-Dependent)
            </label>

            {/* Hostel Admin: Static text, no checkboxes */}
            {role === 'hostel_admin' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold text-xs">
                Audience: <strong className="text-amber-950">Hostel-resident students only</strong> (Fixed target scope)
              </div>
            )}

            {/* HOD: Students / Faculty / Super Admin */}
            {role === 'hod' && (
              <div className="flex flex-wrap items-center gap-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audStudents}
                    onChange={(e) => setAudStudents(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  Students ({user?.department || 'My Department'})
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audFaculty}
                    onChange={(e) => setAudFaculty(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  Faculty
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={audSuperAdmin}
                    onChange={(e) => setAudSuperAdmin(e.target.checked)}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
                  />
                  Super Admin
                </label>
              </div>
            )}

            {/* Super Admin: 5 Audience Checkboxes */}
            {role === 'super_admin' && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audHods}
                      disabled={audAll}
                      onChange={(e) => setAudHods(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300"
                    />
                    HOD's
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audFaculty}
                      disabled={audAll}
                      onChange={(e) => setAudFaculty(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300"
                    />
                    Faculty
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audStudents}
                      disabled={audAll}
                      onChange={(e) => setAudStudents(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300"
                    />
                    Students
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audHostel}
                      disabled={audAll}
                      onChange={(e) => setAudHostel(e.target.checked)}
                      className="w-4 h-4 rounded text-slate-900 border-slate-300"
                    />
                    Hostel Only
                  </label>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-bold text-orange-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={audAll}
                      onChange={(e) => {
                        setAudAll(e.target.checked);
                        if (e.target.checked) {
                          setAudHods(true);
                          setAudFaculty(true);
                          setAudStudents(true);
                          setAudHostel(true);
                        }
                      }}
                      className="w-4 h-4 rounded text-orange-600 border-slate-300"
                    />
                    All (Broadcast to Everyone)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Send Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-sm shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Publishing & Embedding Notice...' : 'Publish & Embed Notice into AI Assistant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoticeModal;
