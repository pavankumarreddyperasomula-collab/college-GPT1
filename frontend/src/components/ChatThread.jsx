import React, { useRef, useEffect, useState } from 'react';
import { Bot, User, FileText, Sparkles, BookOpen, Copy, Check, ArrowRight } from 'lucide-react';

// Helper to format inline elements (**bold**, `code`, *italic*)
const renderInline = (text) => {
  if (!text) return '';
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;
  const parts = [];
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="font-extrabold text-orange-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-orange-100/80 text-orange-800 font-mono text-[11px] font-bold border border-orange-200/80">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={match.index} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else {
      parts.push(token);
    }
    lastIdx = regex.lastIndex;
  }
  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }
  return parts.length > 0 ? parts : text;
};

// Component to render structured Markdown
const FormattedMarkdown = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let tableRows = [];
  let inCodeBlock = false;
  let codeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="p-3 bg-slate-900 text-amber-200 rounded-2xl text-xs font-mono overflow-x-auto border border-orange-500/30 my-2 shadow-inner">
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!/^\|[\s-:]+(\|[\s-:]+)+\|$/.test(trimmed)) {
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim());
        tableRows.push(cells);
      }
      if (i === lines.length - 1 || !lines[i + 1].trim().startsWith('|')) {
        if (tableRows.length > 0) {
          const header = tableRows[0];
          const body = tableRows.slice(1);
          elements.push(
            <div key={`table-${i}`} className="overflow-x-auto my-2.5 rounded-2xl border border-orange-200/80 shadow-2xs">
              <table className="w-full text-xs text-left border-collapse bg-white/90">
                <thead className="bg-gradient-to-r from-orange-100/80 to-rose-100/80 text-orange-950 border-b border-orange-200 font-extrabold">
                  <tr>
                    {header.map((h, hIdx) => (
                      <th key={hIdx} className="px-3 py-2 border-r border-orange-200/60 last:border-r-0">
                        {renderInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-100">
                  {body.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-orange-50/70 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 border-r border-orange-100 last:border-r-0 text-slate-800">
                          {renderInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          tableRows = [];
        }
      }
      continue;
    }

    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1.5" />);
      continue;
    }

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      elements.push(<hr key={`hr-${i}`} className="my-2.5 border-orange-200/70" />);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-orange-950 mt-2.5 mb-1 tracking-tight">
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={`h2-${i}`} className="text-base sm:text-lg font-extrabold text-orange-950 mt-3 mb-1.5 tracking-tight">
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      elements.push(
        <h1 key={`h1-${i}`} className="text-lg sm:text-xl font-black text-orange-950 mt-3.5 mb-2 tracking-tight">
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-0.5 text-slate-800 leading-relaxed">
          <span className="text-orange-600 font-extrabold text-xs mt-1 shrink-0">•</span>
          <span>{renderInline(trimmed.slice(2))}</span>
        </div>
      );
      continue;
    }

    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 my-0.5 text-slate-800 leading-relaxed">
          <span className="text-orange-600 font-extrabold text-xs shrink-0 mt-0.5">{numMatch[1]}.</span>
          <span>{renderInline(numMatch[2])}</span>
        </div>
      );
      continue;
    }

    elements.push(
      <p key={`p-${i}`} className="my-0.5 leading-relaxed text-slate-800">
        {renderInline(line)}
      </p>
    );
  }

  return <div className="space-y-0.5">{elements}</div>;
};

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
    <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-5 max-w-3xl w-full mx-auto">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[45vh] text-center p-4 animate-fade-in">
          <div className="relative group mb-3">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-orange-600 via-rose-600 to-amber-500 blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-14 h-14 rounded-3xl bg-gradient-to-tr from-orange-600 via-rose-600 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-1.5 tracking-tight">
            Ask <span className="orange-glow-text">COLLEGE GPT</span>
          </h2>
          <p className="text-slate-600 text-xs max-w-xs mb-5 leading-relaxed font-semibold">
            Instant answers on SRKR regulations, notice updates, curfew timings & exams.
          </p>

          <div className="w-full space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-orange-800/80 mb-2">
              Suggested Questions:
            </p>
            <div className="space-y-2">
              {sampleQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onQuickQuery(q)}
                  className="w-full p-3 rounded-2xl glass-card text-left text-xs font-bold text-slate-800 hover:text-orange-950 flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate pr-2">{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-600 group-hover:translate-x-1 transition-transform shrink-0" />
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
            className={`flex items-start gap-2.5 animate-fade-in ${
              isUser ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-xs font-extrabold shadow-md ${
                isUser
                  ? 'bg-gradient-to-tr from-orange-600 via-rose-600 to-amber-600 text-white shadow-orange-600/30'
                  : 'bg-white border border-orange-300 text-orange-600 shadow-2xs'
              }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-orange-600" />}
            </div>

            {/* Message Bubble */}
            <div className="max-w-[88%] sm:max-w-[82%] space-y-1.5 group relative">
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative ${
                  isUser
                    ? 'bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 text-white rounded-tr-none shadow-md shadow-orange-600/20 font-semibold'
                    : 'glass-panel-orange text-slate-900 rounded-tl-none font-medium'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <FormattedMarkdown text={msg.text} />
                )}

                {/* Copy Button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopy(msg.text, idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/80 hover:bg-white border border-orange-200 text-orange-700 hover:text-orange-950 transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer shadow-2xs"
                    title="Copy Answer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Source Citations */}
              {!isUser && msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center pl-1 pt-0.5">
                  <span className="text-[10px] font-black text-orange-800 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-orange-600" /> Source:
                  </span>
                  {msg.sources.map((src, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-orange-300 text-[10px] font-extrabold text-orange-950 shadow-2xs"
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
        <div className="flex items-start gap-2.5 animate-fade-in">
          <div className="w-8 h-8 rounded-2xl bg-white border border-orange-300 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Bot className="w-4 h-4 animate-pulse text-orange-600" />
          </div>
          <div className="p-3 glass-panel-orange rounded-2xl rounded-tl-none flex items-center gap-2 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-orange-600 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-rose-600 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-xs text-orange-950 font-bold pl-1">COLLEGE GPT is thinking...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatThread;

