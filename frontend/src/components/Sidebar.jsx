import React, { useState, useEffect } from 'react';
import { History, User, PlusCircle, LogOut, X, MessageSquare, ShieldCheck, Trash2, ListFilter, Bell, Clock } from 'lucide-react';

const Sidebar = ({
  isOpen = false,
  onClose,
  onToggle,
  history = [],
  onSelectHistory = () => {},
  user = null,
  onLogout = () => {},
  onOpenAddNotice,
  onOpenAddNoticeModal,
  onOpenNotifications = () => {},
  onOpenProfile = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'notices'
  const [notices, setNotices] = useState([]);
  const [loadingNotices, setLoadingNotices] = useState(false);

  const handleCloseClick = onClose || onToggle || (() => {});
  const handleAddNoticeClick = onOpenAddNoticeModal || onOpenAddNotice || (() => {});
  const safeHistory = Array.isArray(history) ? history : [];

  const fetchNotices = async () => {
    setLoadingNotices(true);
    try {
      const res = await fetch('http://localhost:8000/notices');
      const data = await res.json();
      if (res.ok) {
        setNotices(data.notices || []);
      }
    } catch (err) {
      console.error('Failed to fetch notices:', err);
    } finally {
      setLoadingNotices(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notices') {
      fetchNotices();
    }
  }, [activeTab]);

  const handleDeleteNotice = async (noticeId, title) => {
    if (!window.confirm(`Are you sure you want to delete notice "${title}"?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/delete-notice/${encodeURIComponent(noticeId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId && n.title !== title));
      }
    } catch (err) {
      alert('Failed to delete notice.');
    }
  };

  const isNoticeCreator = user?.role === 'hod' || user?.role === 'hostel_admin' || user?.role === 'super_admin';

  return (
    <>
      {isOpen && (
        <div
          onClick={handleCloseClick}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-full w-80 bg-white/95 border-l border-slate-200 backdrop-blur-xl z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Tabs */}
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full mr-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-orange-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Chat History</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'notices'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Notices ({notices.length || 'All'})</span>
            </button>
          </div>

          <button
            onClick={handleCloseClick}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Session Chat History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {safeHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-medium">
                No previous questions in this session yet.
              </div>
            ) : (
              safeHistory.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectHistory(q)}
                  className="w-full p-3 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200/80 hover:border-orange-300 text-left text-xs text-slate-700 hover:text-orange-950 flex items-center gap-2 transition-all duration-200 group shadow-2xs cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-orange-600 shrink-0 group-hover:scale-110 transition-transform" />
                  <span className="truncate">{q}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Active Vector Store Notices */}
        {activeTab === 'notices' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">Vector Store Documents</span>
              <button
                onClick={fetchNotices}
                className="text-[10px] text-orange-600 hover:underline font-bold"
              >
                Refresh
              </button>
            </div>

            {loadingNotices ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">Loading notices...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">No notices in store.</div>
            ) : (
              notices.map((n) => (
                <div
                  key={n.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-2 group hover:border-orange-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 truncate max-w-[150px]">{n.title}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.snippet}</p>
                  </div>

                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      {n.date_time_str || n.date || 'Passed: 23-08-2026 10:00 AM'}
                    </span>

                    {isNoticeCreator && (
                      <button
                        onClick={() => handleDeleteNotice(n.id, n.title)}
                        className="text-[10px] text-red-600 hover:text-red-700 flex items-center gap-1 font-bold transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Profile & Admin Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
          {/* Notification Bell Inbox Button */}
          <button
            onClick={onOpenNotifications}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-orange-50 border border-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4 text-orange-600" />
            <span>Open Notice Inbox</span>
          </button>

          {/* EXCLUDE FROM COMPONENT TREE FOR FACULTY AND STUDENT ROLES */}
          {isNoticeCreator && (
            <button
              onClick={handleAddNoticeClick}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 via-rose-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 transition-all duration-200 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          )}

          <div
            onClick={onOpenProfile}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-2xs cursor-pointer hover:border-orange-300 transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs shrink-0">
                {isNoticeCreator ? <ShieldCheck className="w-4 h-4 text-orange-600" /> : <User className="w-4 h-4 text-rose-600" />}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 truncate">{user?.username || 'User'}</div>
                <div className="text-[10px] text-slate-500 capitalize flex items-center gap-1 font-medium">
                  <span>{user?.designation || user?.role}</span>
                  {user?.hod_code && (
                    <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-700 font-mono text-[9px] font-bold">
                      {user.hod_code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onLogout(); }}
              title="Logout"
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
