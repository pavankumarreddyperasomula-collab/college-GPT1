import React, { useState, useEffect } from 'react';
import { X, Calendar, ExternalLink, Sparkles, Film, Code, Trophy, CheckCircle2, PlusCircle, Trash2, Tag, MapPin, Link as LinkIcon, AlertCircle, Users } from 'lucide-react';

const EventsModal = ({ isOpen, onClose, user, notifications = [] }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [regLink, setRegLink] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('SRKR Central Computer Center');
  const [category, setCategory] = useState('Technical Hackathon');
  const [description, setDescription] = useState('');
  
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const role = (user?.role || 'student').toLowerCase();
  const isAdmin = ['hod', 'super_admin', 'hostel_admin', 'faculty', 'admin_hod'].includes(role);

  // Fetch live events filtered by role and student's HOD code
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        role: role
      });
      if (user?.hod_code) {
        queryParams.append('hod_code', user.hod_code);
      }
      const res = await fetch(`http://localhost:8000/events?${queryParams.toString()}`);
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEvents();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handlePostEvent = async (e) => {
    e.preventDefault();
    setError('');
    setPosting(true);

    const eventTitle = title.trim() || 'SRKR Campus Event';
    const eventLink = regLink.trim() || 'https://srkr.ac.in';
    const senderScope = user?.department || user?.hod_code || user?.username || 'ALL';

    try {
      const res = await fetch('http://localhost:8000/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          category: category.trim() || 'Campus Event',
          date: date.trim() || new Date().toISOString().split('T')[0],
          location: location.trim() || 'SRKR Campus Grounds',
          description: description.trim() || `Official SRKR campus event: ${eventTitle}`,
          link: eventLink,
          sender_role: role === 'super_admin' ? 'super_admin' : (role === 'hostel_admin' ? 'hostel_admin' : 'hod'),
          sender_scope: senderScope
        })
      });
      const data = await res.json();
      if (res.ok && data.status === 'success') {
        setSuccessMsg(`Event "${eventTitle}" posted successfully!`);
        setTitle('');
        setRegLink('');
        setDescription('');
        setShowAddForm(false);
        fetchEvents();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setError(data.detail || data.message || 'Failed to post event.');
      }
    } catch (err) {
      setError('Connection error while posting event.');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (!window.confirm(`Are you sure you want to delete event "${eventTitle}"?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/delete-event/${encodeURIComponent(eventId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      }
    } catch (err) {
      alert('Failed to delete event.');
    }
  };

  const getEventIcon = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('hack') || c.includes('code') || c.includes('tech')) return Code;
    if (c.includes('movie') || c.includes('film') || c.includes('cultural')) return Film;
    if (c.includes('fest') || c.includes('annual')) return Sparkles;
    return Trophy;
  };

  const getEventColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('hack') || c.includes('code')) return 'bg-blue-600';
    if (c.includes('movie') || c.includes('film')) return 'bg-purple-600';
    if (c.includes('fest')) return 'bg-amber-600';
    if (c.includes('robot') || c.includes('ai')) return 'bg-emerald-600';
    return 'bg-rose-600';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                SRKR Campus Events & Registrations
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {events.length} Events
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAdmin
                  ? 'Manage college events & publish registration links for respective students'
                  : 'Active registration links for departmental & landmark college events'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Close Form' : '+ Post Event'}</span>
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
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

          {/* ADMIN: POST NEW EVENT WITH REGISTRATION LINK */}
          {isAdmin && showAddForm && (
            <form onSubmit={handlePostEvent} className="p-5 rounded-3xl bg-blue-50/70 border border-blue-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-blue-700" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-blue-950">
                    Post New Campus Event & Registration Link
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  Target Scope: {user?.hod_code || 'Campus-wide'}
                </span>
              </div>

              <p className="text-xs text-blue-900 font-medium">
                When you post this event, it will automatically appear in the event list for students in your department (<strong className="font-mono text-blue-950">{user?.department || user?.hod_code || 'All Campus'}</strong>).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Title / Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SRKR CodeCraft 2026 Hackathon"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <LinkIcon className="w-3 h-3 text-blue-600" /> Registration URL / Form Link (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://forms.gle/xyz or https://srkr.ac.in/event"
                    value={regLink}
                    onChange={(e) => setRegLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs font-semibold outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location / Venue (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CSE Seminar Hall / Main Grounds"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs font-semibold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs font-semibold outline-none cursor-pointer"
                >
                  <option value="Technical Hackathon">Technical Hackathon</option>
                  <option value="Department Workshop">Department Workshop</option>
                  <option value="Annual College Fest">Annual College Fest</option>
                  <option value="Coding Contest">Coding Contest</option>
                  <option value="Cultural & Celebrations">Cultural & Celebrations</option>
                  <option value="Sports Tournament">Sports Tournament</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide event details, team size, eligibility, prizes, or rules..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-slate-200 focus:border-blue-600 text-slate-900 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={posting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {posting ? 'Publishing Event...' : '🚀 Publish Event & Registration Link'}
                </button>
              </div>
            </form>
          )}

          {/* Student Specific Scope Info Banner */}
          {!isAdmin && user?.hod_code && (
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Users className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Showing Campus Events + Events posted by your Department HOD</span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded bg-white text-blue-800 font-extrabold border border-blue-200 text-[11px]">
                {user.hod_code}
              </span>
            </div>
          )}

          {/* Events List */}
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs font-medium">
              Loading active events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No campus events found.
            </div>
          ) : (
            events.map((evt) => {
              const IconComp = getEventIcon(evt.category);
              const colorBg = getEventColor(evt.category);
              const isActive = evt.status === "Active Registration";
              const isHODEvent = evt.sender_role === 'hod' && evt.sender_scope && evt.sender_scope !== 'ALL';

              return (
                <div
                  key={evt.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 ${
                    isHODEvent
                      ? 'bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-300 shadow-sm'
                      : isActive
                      ? 'bg-blue-50/40 border-blue-200 hover:border-blue-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${colorBg} text-white flex items-center justify-center shrink-0 shadow-sm`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                            {evt.title}
                          </h4>
                          {isHODEvent && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-mono font-bold shadow-2xs">
                              🎯 HOD Event ({evt.sender_scope})
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                          <span>📍 {evt.location}</span>
                          <span>•</span>
                          <span>📅 {evt.date}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {evt.status || 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    {evt.description}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Tag: {evt.category}
                    </span>

                    <div className="flex items-center gap-2">
                      {isAdmin && (evt.sender_scope === user?.hod_code || role === 'super_admin') && (
                        <button
                          onClick={() => handleDeleteEvent(evt.id, evt.title)}
                          className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      )}

                      <a
                        href={evt.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                      >
                        <span>{isActive ? 'Register Now' : 'Event Details'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            Close Events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsModal;

