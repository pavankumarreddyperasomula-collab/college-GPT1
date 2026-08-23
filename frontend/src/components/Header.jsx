import React from 'react';
import { Menu, ShieldCheck, User, MapPin, Bell, Search, X } from 'lucide-react';

const Header = ({
  user,
  unreadCount = 0,
  searchQuery = '',
  setSearchQuery = () => {},
  onToggleSidebar,
  onOpenMaps,
  onOpenNotifications,
  onOpenProfile
}) => {
  return (
    <header className="h-16 bg-white/95 border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md shadow-2xs gap-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/srkr_logo.png"
          alt="SRKR Engineering College Logo"
          className="h-9 sm:h-10 object-contain drop-shadow-xs hover:scale-105 transition-transform"
        />

        <div className="hidden lg:block">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            COLLEGE GPT
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 uppercase tracking-wider">
              SRKR OFFICIAL
            </span>
          </h1>
        </div>
      </div>

      {/* Global Dashboard Live Search Input */}
      <div className="flex-1 max-w-md mx-2 sm:mx-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search campus rules, notices, events, maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full pl-10 pr-9 py-2 rounded-2xl bg-slate-100/90 border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Notification Bell Icon */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-orange-700 transition-all duration-200 shadow-xs group cursor-pointer"
          title="Campus Notice Inbox"
        >
          <Bell className="w-4 h-4 group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Campus Maps Button */}
        <button
          onClick={onOpenMaps}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-700 text-xs font-bold transition-all duration-200 shadow-xs group cursor-pointer"
          title="Open Campus Building Maps"
        >
          <MapPin className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Campus Maps</span>
        </button>

        {/* User Profile Button */}
        <button
          onClick={onOpenProfile}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-100/80 border border-slate-200 hover:border-orange-300 text-xs text-slate-800 font-semibold shadow-xs transition-all cursor-pointer"
          title="Click to view profile panel"
        >
          {user?.role === 'hod' || user?.role === 'super_admin' || user?.role === 'hostel_admin' ? (
            <ShieldCheck className="w-4 h-4 text-orange-600" />
          ) : (
            <User className="w-4 h-4 text-rose-600" />
          )}
          <span className="font-bold">{user?.username}</span>
          
          {user?.hod_code && (
            <span className="ml-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-white border border-slate-300 text-slate-700 font-bold shadow-2xs">
              {user.hod_code}
            </span>
          )}
        </button>

        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-all duration-200 shadow-xs cursor-pointer"
          title="Toggle Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
