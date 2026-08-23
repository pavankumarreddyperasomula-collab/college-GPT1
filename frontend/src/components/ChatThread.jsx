import React, { useRef, useEffect, useState } from 'react';
import { Bot, User, FileText, Sparkles, BookOpen, Copy, Check } from 'lucide-react';

const ChatThread = ({ messages, loading, onQuickQuery }) => {
  const bottomRef = useRef(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const sampleQuestions = [
    "What time does the mess close?",
    "Can I bring a guest to the hostel?",
    "When is the next exam?",
    "How do I report a maintenance issue in my room?"
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl w-full mx-auto">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-center p-6 animate-fade-in">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 via-rose-600 to-amber-600 text-white flex items-center justify-center shadow-xl shadow-orange-600/25 mb-4">
            <Sparkles className="w-7 h-7 text-amber-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 tracking-tight">
            Ask <span className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-transparent">COLLEGE GPT</span> AI
          </h2>
          <p className="text-slate-600 text-xs max-w-xs mb-6 leading-relaxed font-medium">
            SRKR rules, hostel curfew, notice info, exam dates & campus questions.
          </p>

          <div className="w-full space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Suggested Questions:
            </p>
            <div className="space-y-2">
              {sampleQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onQuickQuery(q)}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-left text-xs font-semibold text-slate-700 hover:text-orange-950 transition-all duration-200 shadow-2xs hover:shadow-md group flex items-center justify-between cursor-pointer"
                >
                  <span className="truncate">{q}</span>
                  <span className="text-orange-600 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {messages.map((msg, idx) => {
        const isUser = msg.sender === 'user';
        const isCopied = copiedIdx === idx;

        return (
          <div
            key={idx}
            className={`flex items-start gap-3 animate-fade-in ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                isUser
                  ? 'bg-gradient-to-tr from-orange-600 to-rose-600 text-white shadow-orange-600/20'
                  : 'bg-white border border-slate-200 text-orange-700 shadow-xs'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-orange-600" />}
            </div>

            {/* Message Bubble */}
            <div className="max-w-[88%] sm:max-w-[80%] space-y-2 group relative">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-600 to-rose-600 text-white rounded-tr-none shadow-md shadow-orange-600/15 font-semibold'
                    : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-none shadow-xs font-medium'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Copy Button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.text, idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Copy Answer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Source Citations */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center pl-1 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-orange-600" /> Source:
                  </span>
                  {msg.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-orange-50 border border-orange-200 text-[10px] font-semibold text-orange-900 shadow-2xs"
                    >
                      <FileText className="w-3 h-3 text-orange-600" />
                      {src.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {loading && (
        <div className="flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-2xl bg-white border border-slate-200 text-orange-600 flex items-center justify-center shrink-0 shadow-xs">
            <Bot className="w-4 h-4 animate-pulse text-orange-600" />
          </div>
          <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-slate-500 font-medium pl-1">COLLEGE GPT is thinking...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatThread;
