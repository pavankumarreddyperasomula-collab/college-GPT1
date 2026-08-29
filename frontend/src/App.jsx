import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatThread from './components/ChatThread';
import ChatInput from './components/ChatInput';
import RoleSelection from './components/RoleSelection';
import StudentOtpLogin from './components/StudentOtpLogin';
import AdminLogin from './components/AdminLogin';
import AddNoticeModal from './components/AddNoticeModal';
import NotificationModal from './components/NotificationModal';
import ProfileModal from './components/ProfileModal';
import CampusMapModal from './components/CampusMapModal';
import RulesModal from './components/RulesModal';
import DocFormatterModal from './components/DocFormatterModal';
import EventsModal from './components/EventsModal';
import WebsiteIngestModal from './components/WebsiteIngestModal';
import StudentQuickHub from './components/StudentQuickHub';
import AdminQuickHub from './components/AdminQuickHub';
import Aurora from './components/Aurora';
import { X } from 'lucide-react';
import { API_URL } from './config';

const App = () => {
  // Navigation & Session View States
  const [view, setView] = useState('role_selection');
  const [user, setUser] = useState(null);

  // Sidebar & Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddNoticeOpen, setIsAddNoticeOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState('profile');
  const [isMapsOpen, setIsMapsOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDocFormatterOpen, setIsDocFormatterOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isWebsiteIngestOpen, setIsWebsiteIngestOpen] = useState(false);

  // Chat Panel Toggle State
  const [isChatOpen, setIsChatOpen] = useState(true);

  // Chat Threads
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Notifications & Documents
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [readNoticeIds, setReadNoticeIds] = useState(() => {
    try {
      const saved = localStorage.getItem('srkr_read_notices');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save read notices to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('srkr_read_notices', JSON.stringify(readNoticeIds));
    } catch (e) {
      console.error(e);
    }
  }, [readNoticeIds]);

  // Live Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications for logged in user
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const queryParams = new URLSearchParams({
        role: user.role || 'student',
        is_hostel_resident: user.is_hostel_resident ? 'true' : 'false'
      });
      const deptCode = user.department || user.hod_code;
      if (deptCode) {
        queryParams.append('hod_code', deptCode);
      }

      const res = await fetch(`${API_URL}/notifications?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Fetch documents for logged in user
  const fetchDocuments = async () => {
    if (!user) return;
    try {
      const queryParams = new URLSearchParams({
        role: user.role || 'student',
        is_hostel_resident: user.is_hostel_resident ? 'true' : 'false'
      });
      const deptCode = user.department || user.hod_code;
      if (deptCode) {
        queryParams.append('hod_code', deptCode);
      }

      const res = await fetch(`${API_URL}/documents?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  // Poll for notifications and documents every 3 seconds for instant updates
  useEffect(() => {
    if (user && view === 'dashboard') {
      fetchNotifications();
      fetchDocuments();
      const interval = setInterval(() => {
        fetchNotifications();
        fetchDocuments();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, view]);

  const unreadCount = notifications.filter((n) => !readNoticeIds.includes(n.id)).length;

  // Filtered Search Results calculation
  const searchResults = searchQuery.trim() ? {
    notices: notifications.filter(n => 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.theme?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    rules: [
      { name: "Attendance 75% Minimum Requirement", action: () => setIsRulesOpen(true) },
      { name: "Mandatory College ID Card Policy", action: () => setIsRulesOpen(true) },
      { name: "Anti-Ragging Regulations & Helpline", action: () => setIsRulesOpen(true) },
      { name: "Examination Malpractice Guidelines", action: () => setIsRulesOpen(true) }
    ].filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())),
    events: [
      { name: "Hack 'N' Clash 2026 Hackathon", action: () => setIsEventsOpen(true) },
      { name: "Korean Kanaka Raju Movie Pre-release Event", action: () => setIsEventsOpen(true) },
      { name: "Irumudi Movie Trailer Launch Event", action: () => setIsEventsOpen(true) },
      { name: "SPOURTHI Annual Tech Fest", action: () => setIsEventsOpen(true) }
    ].filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase())),
    maps: [
      { name: "CSE Department Block Location", action: () => setIsMapsOpen(true) },
      { name: "Central Library & Digital Hub Map", action: () => setIsMapsOpen(true) },
      { name: "Student Hostel Block A & Mess Navigation", action: () => setIsMapsOpen(true) }
    ].filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
  } : null;

  const handleSelectRole = (roleType) => {
    if (roleType === 'student') setView('student_login');
    else if (roleType === 'admin') setView('admin_login');
    else if (roleType === 'super_admin') setView('super_admin_login');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setView('dashboard');
  };

  const handleSendMessage = async (text, attachedFile = null) => {
    if (!text.trim() && !attachedFile) return;

    // Ensure chat panel is open when a message is sent
    setIsChatOpen(true);

    let userMsgText = text.trim();
    if (attachedFile) {
      userMsgText = `📄 **Attached File**: \`${attachedFile.name}\`\n${userMsgText}`;
    }

    const newMsg = { sender: 'user', text: userMsgText };
    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const payload = {
        query: text.trim() || `Explain and summarize ${attachedFile?.name}`,
        ...(attachedFile ? {
          attached_file: {
            file_name: attachedFile.name,
            content: attachedFile.text,
            category: 'college'
          }
        } : {})
      };

      const res = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: data.answer,
            sources: data.sources || []
          }
        ]);
        // Refresh documents list after new file indexing
        if (attachedFile) {
          fetchDocuments();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Sorry, I encountered an error answering your request.' }
        ]);
      }
    } catch (err) {
      console.error("Chat API error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Cannot connect to AI backend service. If using Render free hosting, the backend takes ~30s to wake up on the first request. Please try asking again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNoticeInbox = () => {
    setIsNotificationOpen(true);
    const allIds = notifications.map((n) => n.id);
    setReadNoticeIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const handleClearNoticeHistory = () => {
    setNotifications([]);
    setReadNoticeIds([]);
  };

  return (
    <div className="w-full h-[100dvh] flex flex-col relative overflow-hidden font-sans text-slate-900 bg-gradient-to-br from-orange-50/70 via-rose-50/50 to-amber-50/60">
      {/* Warm Reddish-Orange Ambient Aurora Backdrop Glow */}
      <Aurora colorStops={["#ff6b35", "#f72585", "#ffb703"]} />

      {/* 1. Entry Screens */}
      {view === 'role_selection' && (
        <RoleSelection onSelectRole={handleSelectRole} />
      )}

      {view === 'student_login' && (
        <StudentOtpLogin
          onBack={() => setView('role_selection')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {view === 'admin_login' && (
        <AdminLogin
          onBack={() => setView('role_selection')}
          onLoginSuccess={handleLoginSuccess}
          initialTab="admin"
        />
      )}

      {view === 'super_admin_login' && (
        <AdminLogin
          onBack={() => setView('role_selection')}
          onLoginSuccess={handleLoginSuccess}
          initialTab="super_admin"
        />
      )}

      {/* 2. Main Dashboard Interface */}
      {view === 'dashboard' && (
        <div className="flex flex-col h-[100dvh] overflow-hidden relative z-10">
          <Header
            user={user}
            unreadCount={unreadCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onOpenMaps={() => setIsMapsOpen(true)}
            onOpenNotifications={handleOpenNoticeInbox}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenAddNotice={() => setIsAddNoticeOpen(true)}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />

          {/* Live Search Results Overlay Dropdown */}
          {searchResults && (
            <div className="glass-panel border-b border-orange-300 shadow-xl px-6 py-4 z-30 max-h-72 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-orange-800 tracking-wider">
                  Live Search Results for "{searchQuery}"
                </h4>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-extrabold text-orange-700 hover:text-orange-950"
                >
                  Clear Search
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search Notices */}
                {searchResults.notices.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-2xl glass-card">
                    <span className="text-[10px] font-black uppercase text-orange-900">Matching Notices ({searchResults.notices.length})</span>
                    {searchResults.notices.map(n => (
                      <button
                        key={n.id}
                        onClick={() => { handleOpenNoticeInbox(); setSearchQuery(''); }}
                        className="w-full text-left p-2 rounded-xl bg-white/90 hover:bg-orange-100/70 border border-orange-200 text-xs font-bold text-slate-900 truncate block shadow-2xs cursor-pointer"
                      >
                        📢 NOTICE: {n.theme || n.title}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Rules */}
                {searchResults.rules.length > 0 && (
                  <div className="space-y-1.5 p-3 rounded-2xl glass-card">
                    <span className="text-[10px] font-black uppercase text-rose-900">Matching Rules ({searchResults.rules.length})</span>
                    {searchResults.rules.map((r, rIdx) => (
                      <button
                        key={rIdx}
                        onClick={() => { r.action(); setSearchQuery(''); }}
                        className="w-full text-left p-2 rounded-xl bg-white/90 hover:bg-rose-100/70 border border-rose-200 text-xs font-bold text-slate-900 truncate block shadow-2xs cursor-pointer"
                      >
                        📕 {r.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Events & Maps */}
                {(searchResults.events.length > 0 || searchResults.maps.length > 0) && (
                  <div className="space-y-1.5 p-3 rounded-2xl glass-card">
                    <span className="text-[10px] font-black uppercase text-amber-900">Events & Maps</span>
                    {searchResults.events.map((e, eIdx) => (
                      <button
                        key={eIdx}
                        onClick={() => { e.action(); setSearchQuery(''); }}
                        className="w-full text-left p-2 rounded-xl bg-white/90 hover:bg-amber-100/70 border border-amber-200 text-xs font-bold text-slate-900 truncate block shadow-2xs cursor-pointer"
                      >
                        🎟️ {e.name}
                      </button>
                    ))}
                    {searchResults.maps.map((m, mIdx) => (
                      <button
                        key={mIdx}
                        onClick={() => { m.action(); setSearchQuery(''); }}
                        className="w-full text-left p-2 rounded-xl bg-white/90 hover:bg-amber-100/70 border border-amber-200 text-xs font-bold text-slate-900 truncate block shadow-2xs cursor-pointer"
                      >
                        📍 {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 flex overflow-hidden relative max-w-[1600px] w-full mx-auto">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
              history={messages.filter((m) => m.sender === 'user').map((m) => m.text)}
              onSelectHistory={(q) => {
                setIsChatOpen(true);
                handleSendMessage(q);
              }}
              user={user}
              onOpenAddNotice={() => setIsAddNoticeOpen(true)}
              onOpenAddNoticeModal={() => setIsAddNoticeOpen(true)}
              onOpenNotifications={handleOpenNoticeInbox}
              unreadCount={unreadCount}
              onLogout={() => {
                setUser(null);
                setMessages([]);
                setView('role_selection');
              }}
            />

            {/* Main Content Area: Responsive Flexible Grid */}
            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 gap-6 w-full">
              {/* CAMPUS QUICK HUB (EXPANDS TO 100% WIDTH WHEN AI CHAT IS CLOSED) */}
              <div className={`w-full ${isChatOpen ? 'lg:w-1/2' : 'w-full'} overflow-y-auto pr-1 transition-all duration-300`}>
                {user?.role === 'student' ? (
                  <StudentQuickHub
                    user={user}
                    unreadCount={unreadCount}
                    documentsCount={documents.length}
                    onOpenRules={() => setIsRulesOpen(true)}
                    onOpenDocuments={() => setIsDocFormatterOpen(true)}
                    onOpenNotices={handleOpenNoticeInbox}
                    onOpenEvents={() => setIsEventsOpen(true)}
                    onOpenMaps={() => setIsMapsOpen(true)}
                    onOpenProfile={() => setIsProfileOpen(true)}
                  />
                ) : (
                  <AdminQuickHub
                    user={user}
                    unreadCount={unreadCount}
                    onOpenAddNotice={() => setIsAddNoticeOpen(true)}
                    onOpenNotices={handleOpenNoticeInbox}
                    onOpenDocuments={() => setIsDocFormatterOpen(true)}
                    onOpenEvents={() => setIsEventsOpen(true)}
                    onOpenMaps={() => setIsMapsOpen(true)}
                    onOpenRules={() => setIsRulesOpen(true)}
                    onOpenProfile={() => { setProfileModalTab('profile'); setIsProfileOpen(true); }}
                    onOpenAddStaff={() => { setProfileModalTab('create_staff'); setIsProfileOpen(true); }}
                    onOpenWebsiteIngest={() => setIsWebsiteIngestOpen(true)}
                  />
                )}
              </div>

              {/* AI CHAT PANEL WITH CLOSE (X) BUTTON */}
              {isChatOpen && (
                <div className="w-full lg:w-1/2 shrink-0 flex flex-col glass-panel border border-orange-200/90 rounded-3xl overflow-hidden shadow-xl max-h-[85vh] lg:max-h-none animate-fade-in">
                  <div className="p-3.5 bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 text-white font-black text-xs flex items-center justify-between shrink-0 shadow-xs">
                    <span className="flex items-center gap-1.5 tracking-tight">
                      ✨ SRKR Assistant Chat
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-mono font-extrabold border border-white/30">
                        AI Online
                      </span>
                      <button
                        onClick={() => setIsChatOpen(false)}
                        className="p-1 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
                        title="Close AI Assistant Chat Box"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <ChatThread
                    messages={messages}
                    loading={loading}
                    onQuickQuery={(q) => {
                      setIsChatOpen(true);
                      handleSendMessage(q);
                    }}
                  />
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    loading={loading}
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddNoticeModal
        isOpen={isAddNoticeOpen}
        onClose={() => setIsAddNoticeOpen(false)}
        user={user}
        onNoticePublished={fetchNotifications}
      />

      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        user={user}
        notifications={notifications}
        onClearAll={handleClearNoticeHistory}
        onDeleteNotice={fetchNotifications}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        initialTab={profileModalTab}
        onUserUpdated={(updatedUser) => setUser(updatedUser)}
        onLogout={() => {
          setUser(null);
          setMessages([]);
          setView('role_selection');
          setIsProfileOpen(false);
        }}
      />


      <CampusMapModal
        isOpen={isMapsOpen}
        onClose={() => setIsMapsOpen(false)}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <DocFormatterModal
        isOpen={isDocFormatterOpen}
        onClose={() => setIsDocFormatterOpen(false)}
        user={user}
        documents={documents}
        onDocumentPublished={fetchDocuments}
      />

      <EventsModal
        isOpen={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
        user={user}
        notifications={notifications}
      />

      <WebsiteIngestModal
        isOpen={isWebsiteIngestOpen}
        onClose={() => setIsWebsiteIngestOpen(false)}
      />
    </div>
  );
};

export default App;

