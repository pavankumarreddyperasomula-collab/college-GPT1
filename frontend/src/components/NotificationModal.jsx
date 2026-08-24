import React from 'react';
import { X, Bell, Calendar, Clock, Building, ShieldCheck, Printer, Trash2 } from 'lucide-react';
import { API_URL } from '../config';

const NotificationModal = ({ isOpen, onClose, user, notifications = [], onMarkAsRead, onClearAll, onDeleteNotice }) => {
  if (!isOpen) return null;

  const userRole = (user?.role || 'student').toLowerCase();
  const isAdmin = ['super_admin', 'hod', 'hostel_admin', 'faculty'].includes(userRole);

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async (noticeId) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      const res = await fetch(`${API_URL}/delete-notice/${encodeURIComponent(noticeId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (onDeleteNotice) onDeleteNotice(noticeId);
      } else {
        alert('Failed to delete notice.');
      }
    } catch (e) {
      console.error(e);
      alert('Error deleting notice.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-100 border border-slate-300 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Official SRKR Campus Circulars
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-black">
                  {notifications.length} Circulars
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Circular
            </button>

            {notifications.length > 0 && isAdmin && (
              <button
                onClick={onClearAll}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear History
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printed Paper Circular List */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 flex-1 bg-slate-200/60">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm text-slate-500">
              <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-bold text-slate-800">No active circulars in your inbox right now.</p>
              <p className="text-xs text-slate-400 mt-1">Official announcements published by HODs or Admins will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="bg-white border border-slate-300 shadow-md p-6 sm:p-10 rounded-2xl space-y-6 text-slate-900 font-serif relative transition-all hover:shadow-xl group"
              >
                {/* Admin Delete Action Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="absolute top-4 right-4 p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-all cursor-pointer shadow-xs border border-red-200"
                    title="Delete notice"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* 1. Official Header */}
                <div className="text-center space-y-1 border-b border-slate-300 pb-4">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                    SAGI RAMA KRISHNAM RAJU ENGINEERING COLLEGE (AUTONOMOUS)
                  </h2>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    SRKR MARG, CHINA AMIRAM, BHIMAVARAM-534204, W.G.Dt., A.P., INDIA
                  </p>
                </div>

                {/* 2. Top Right Date Display */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs sm:text-sm font-bold pt-1">
                  <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-950 font-sans text-[11px] uppercase font-black tracking-wider border border-orange-300 shadow-2xs">
                    📁 CATEGORY: <strong>{notif.category || 'General'}</strong>
                  </span>
                  <span className="font-black text-amber-950 bg-amber-200/95 border-2 border-amber-400 px-4 py-1.5 rounded-xl font-mono shadow-xs text-xs sm:text-sm tracking-wide">
                    📅 <strong>DATE: {notif.date_time_str || notif.start_date || '20-08-2026'}</strong>
                  </span>
                </div>

                {/* 3. Center Underlined NOTICE Title */}
                <div className="text-center py-2">
                  <h3 className="text-lg font-black tracking-widest text-slate-900 underline underline-offset-8 uppercase font-sans">
                    N O T I C E
                  </h3>
                </div>

                {/* 4. Notice Theme & Body Text */}
                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-slate-900 px-1 sm:px-3">
                  <div className="p-4 bg-amber-100/90 border-l-8 border-amber-500 rounded-r-2xl shadow-xs font-sans space-y-1">
                    <span className="text-[11px] font-black text-amber-900 uppercase tracking-widest block">
                      📌 OFFICIAL NOTICE THEME (MARKED):
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                      <mark className="bg-amber-300/90 text-slate-950 px-2.5 py-0.5 rounded-lg font-black">
                        {notif.theme || notif.title}
                      </mark>
                    </h4>
                    {notif.start_date && (
                      <p className="text-xs font-extrabold text-amber-950 pt-1 font-mono">
                        ⏳ EFFECTIVE PERIOD: <span className="bg-white/80 px-2 py-0.5 rounded border border-amber-300"><strong>{notif.start_date}</strong> to <strong>{notif.end_date || notif.start_date}</strong></span>
                      </p>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap font-medium leading-loose text-slate-900 text-sm sm:text-base">
                    {notif.body?.split(/(\*\*.*?\*\*)/g).map((part, idx) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return (
                          <strong key={idx} className="font-black text-slate-950 bg-amber-100/80 px-1.5 py-0.5 rounded border-b-2 border-amber-400">
                            {part.slice(2, -2)}
                          </strong>
                        );
                      }
                      return part;
                    })}
                  </div>
                </div>

                {/* 5. Official Distribution List & Principal Signature */}
                <div className="pt-6 border-t border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-sans text-slate-700">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">Copy to:</p>
                    <p>• The Principal's Table</p>
                    <p>• The Management Office</p>
                    <p>• The Director, SRKREC</p>
                    <p>• All the Heads of the Departments</p>
                    <p>• All the Programme Coordinators</p>
                    <p>• The Manager, Principal's Office</p>
                    <p>• The Executive Engineer</p>
                    <p>• Hostel Wardens (A, B & C Blocks)</p>
                    <p>• Principal's Office all sections</p>
                    <p>• Circulation to all class rooms</p>
                    <p>• Office file (DPS), Master file</p>
                  </div>

                  <div className="space-y-0.5 pt-3 md:pt-4">
                    <p>• All the Deans</p>
                    <p>• Head Foundation Year & Incubation</p>
                    <p>• The Controller of Examinations</p>
                    <p>• The Head, CITI</p>
                    <p>• The In-charge, Central Library</p>
                    <p>• The H.R. Manager</p>
                    <p>• The Physical Education Dept.</p>
                    <p>• The Transport Dept.</p>
                    <p>• The College Stores & Dispensary</p>
                    <p>• All Notice boards</p>
                  </div>

                  <div className="flex flex-col items-center justify-end text-center pt-4 md:pt-0">
                    <div className="w-28 h-10 mb-1 flex items-center justify-center">
                      <svg className="w-24 h-10 text-slate-900 stroke-current fill-none stroke-[2]" viewBox="0 0 100 40">
                        <path d="M10 25 C30 10, 40 35, 60 15 C75 5, 80 30, 90 20" />
                        <line x1="15" y1="30" x2="85" y2="30" strokeWidth="1" />
                      </svg>
                    </div>
                    <span className="text-xs font-black tracking-wider text-slate-900 uppercase">
                      PRINCIPAL
                    </span>
                    <span className="text-[9px] text-slate-500 font-semibold">
                      SRKR Engineering College
                    </span>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>Issued by: {notif.sender_role?.toUpperCase() || 'ADMIN'} ({notif.sender_scope || 'ALL'})</span>
                  <span>Ref Circular ID: {notif.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center">
          <span className="text-xs text-slate-500 font-bold">
            Official SRKR Engineering College Notice Circular Format
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Circulars
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
