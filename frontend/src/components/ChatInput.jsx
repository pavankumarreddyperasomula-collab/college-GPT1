import React, { useState } from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ onSendMessage, onSendQuery, loading, disabled }) => {
  const [query, setQuery] = useState('');
  const isDisabled = Boolean(disabled || loading);
  const sendHandler = onSendMessage || onSendQuery;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if (!clean || isDisabled) return;

    // Reset input text box immediately for smooth UI feedback
    setQuery('');

    if (sendHandler) {
      sendHandler(clean);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-20">
      <form onSubmit={handleSubmit} className="w-full relative flex items-center">
        <input
          type="text"
          placeholder="Ask SRKR AI anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSubmit(e);
            }
          }}
          disabled={isDisabled}
          spellCheck={false}
          autoComplete="off"
          className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none shadow-xs transition-all duration-200"
        />
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!query.trim() || isDisabled}
          className="absolute right-1.5 w-9 h-9 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Send query"
        >
          <Send className={`w-4 h-4 ${isDisabled ? 'animate-pulse' : ''}`} />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
