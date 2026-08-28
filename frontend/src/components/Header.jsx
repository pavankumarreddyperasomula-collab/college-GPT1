import React from 'react';
import { Menu, ShieldCheck, User, MapPin, Bell, Search, X, Sparkles, PlusCircle } from 'lucide-react';

const Header = ({
  user,
  unreadCount = 0,
  searchQuery = '',
  setSearchQuery = () => {},
  onToggleSidebar,
  onOpenMaps,
  onOpenNotifications,
  onOpenProfile,
  onOpenAddNotice,
  isChatOpen = true,
  onToggleChat = () => {}
}) => {
  const isNoticeCreator = user?.role === 'hod' || user?.role === 'hostel_admin' || user?.role === 'super_admin';

  return (
    <header className="h-16 glass-header px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-600 via-rose-600 to-amber-500 blur-xs opacity-60 group-hover:opacity-100 transition duration-300" />
          <div className="relative bg-white/90 rounded-xl p-1 shadow-xs flex items-center justify-center">
            <img
              src="/srkr_logo.png"
              alt="SRKR Engineering College Logo"
              className="h-8 sm:h-9 object-contain drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div className="hidden lg:block">
          <h1 className="text-base font-black tracking-tight flex items-center gap-2">
            <span className="orange-glow-text">COLLEGE GPT</span>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 text-orange-700 uppercase tracking-wider flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-2.5 h-2.5 text-orange-600 animate-pulse" />
              SRKR OFFICIAL
            </span>
          </h1>
        </div>
      </div>

      {/* Global Dashboard Live Search Input */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search campus rules, notices, events, maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-10 pr-9 py-2 rounded-2xl glass-input text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-2xs transition-all duration-300"
          />
          <Search className="w-4 h-4 text-orange-500/70 absolute left-3.5 top-2.5 pointer-events-none group-focus-within:text-orange-600 transition-colors" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-orange-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* AI Chat Box Toggle Button */}
        <button
          onClick={onToggleChat}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-xs font-extrabold transition-all duration-200 shadow-2xs group cursor-pointer ${
            isChatOpen
              ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white border-orange-500 shadow-md shadow-orange-600/20'
              : 'bg-white/80 hover:bg-orange-50/90 border-orange-200/80 hover:border-orange-400 text-slate-800'
          }`}
          title={isChatOpen ? "Close AI Assistant Chat Box" : "Open AI Assistant Chat Box"}
        >
          <Sparkles className={`w-4 h-4 ${isChatOpen ? 'text-amber-200 animate-pulse' : 'text-orange-600'}`} />
          <span className="hidden sm:inline">{isChatOpen ? 'Hide Chat' : 'AI Chat'}</span>
        </button>

        {/* Create Notice Button for Authorized Roles */}
        {isNoticeCreator && (
          <button
            onClick={onOpenAddNotice}
            className="px-3 py-2 rounded-2xl bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 hover:from-orange-700 hover:to-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all duration-200 cursor-pointer"
            title="Create and Publish Official Notice"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden md:inline">Create Notice</span>
          </button>
        )}

        {/* Notification Bell Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-2xl bg-white/80 hover:bg-orange-50/90 border border-orange-200/80 hover:border-orange-400 text-slate-700 hover:text-orange-700 transition-all duration-200 shadow-2xs group cursor-pointer"
          title="Campus Notice Inbox"
        >
          <Bell className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-rose-600 text-[10px] font-extrabold text-white shadow-md shadow-orange-600/30 animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Campus Maps Button */}
        <button
          onClick={onOpenMaps}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/80 hover:bg-amber-50/90 border border-amber-200/80 hover:border-amber-400 text-slate-800 hover:text-amber-700 text-xs font-bold transition-all duration-200 shadow-2xs group cursor-pointer"
          title="Open Campus Building Maps"
        >
          <MapPin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Campus Maps</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenProfile}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-orange-50/90 via-rose-50/70 to-white border border-orange-200/80 hover:border-orange-400 text-xs text-slate-800 font-semibold shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer"
          title="Click to view profile panel & log out"
        >
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center text-xs shadow-xs">
            {user?.role === 'hod' || user?.role === 'super_admin' || user?.role === 'hostel_admin' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            ) : (
              <User className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span className="font-extrabold text-slate-900">{user?.username}</span>
          
          {user?.hod_code && (
            <span className="ml-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-orange-200 text-orange-800 font-extrabold shadow-2xs">
              {user.hod_code}
            </span>
          )}
        </button>

        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-2xl bg-white/80 hover:bg-orange-100/60 border border-orange-200/80 hover:border-orange-400 text-slate-700 transition-all duration-200 shadow-2xs cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4 text-slate-700" />
        </button>
      </div>
    </header>
  );
};

export default Header;



