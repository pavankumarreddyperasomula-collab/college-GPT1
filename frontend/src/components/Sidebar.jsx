import React, { useState, useEffect } from 'react';
import { History, User, PlusCircle, LogOut, X, MessageSquare, ShieldCheck, Trash2, ListFilter, Bell, Clock, Sparkles } from 'lucide-react';
import { API_URL } from '../config';

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
      const res = await fetch(`${API_URL}/notices`);
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
      const res = await fetch(`${API_URL}/delete-notice/${encodeURIComponent(noticeId)}`, {
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 right-0 h-full w-80 glass-panel border-l border-orange-200/80 z-40 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation Tabs */}
        <div className="p-3 border-b border-orange-200/60 flex items-center justify-between bg-gradient-to-r from-orange-50/60 via-rose-50/40 to-white">
          <div className="flex bg-white/80 p-1 rounded-2xl border border-orange-200/80 gap-1 w-full mr-2 shadow-2xs">
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:text-orange-900 hover:bg-orange-50/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                activeTab === 'notices'
                  ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-md shadow-orange-600/20'
                  : 'text-slate-600 hover:text-orange-900 hover:bg-orange-50/50'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Notices ({notices.length || 'All'})</span>
            </button>
          </div>

          <button
            onClick={handleCloseClick}
            className="p-1.5 rounded-xl hover:bg-orange-100/60 text-slate-500 hover:text-orange-900 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab 1: Session Chat History */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {safeHistory.length === 0 ? (
              <div className="text-center py-14 p-4 text-slate-400 text-xs font-medium">
                <Sparkles className="w-8 h-8 text-orange-400/60 mx-auto mb-2 animate-pulse" />
                No previous questions in this session yet.
              </div>
            ) : (
              safeHistory.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectHistory(q)}
                  className="w-full p-3 rounded-2xl glass-card text-left text-xs font-semibold text-slate-800 hover:text-orange-950 flex items-center gap-2.5 group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-100/80 text-orange-600 flex items-center justify-center shrink-0 group-hover:bg-gradient-to-tr group-hover:from-orange-600 group-hover:to-rose-600 group-hover:text-white transition-all shadow-2xs">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate flex-1">{q}</span>
                </button>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Active Vector Store Notices */}
        {activeTab === 'notices' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-orange-950 uppercase tracking-wider">Vector Store Documents</span>
              <button
                onClick={fetchNotices}
                className="text-[10px] text-orange-600 hover:text-rose-600 hover:underline font-extrabold"
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
                  className="p-3 rounded-2xl glass-card flex flex-col justify-between gap-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900 truncate max-w-[150px]">{n.title}</span>
                      <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-800 font-extrabold border border-emerald-500/30">
                        {n.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{n.snippet}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-orange-100 text-[10px]">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-600" />
                      {n.date_time_str || n.date || 'Passed: 23-08-2026 10:00 AM'}
                    </span>

                    {isNoticeCreator && (
                      <button
                        onClick={() => handleDeleteNotice(n.id, n.title)}
                        className="text-[10px] text-red-600 hover:text-red-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
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
      </aside>
    </>
  );
};

export default Sidebar;


