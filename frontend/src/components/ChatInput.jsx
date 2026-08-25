import React, { useState, useRef } from 'react';
import { Send, Paperclip, FileText, X } from 'lucide-react';

const ChatInput = ({ onSendMessage, onSendQuery, loading, disabled }) => {
  const [query, setQuery] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  const isDisabled = Boolean(disabled || loading);
  const sendHandler = onSendMessage || onSendQuery;

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let fileText = '';
      if (file.name.toLowerCase().endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        fileText = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
      } else {
        fileText = await file.text();
      }

      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        text: fileText,
        isPdf: file.name.toLowerCase().endsWith('.pdf'),
        file: file
      });
    } catch (err) {
      console.error("Error reading attached file:", err);
      alert("Failed to read file. Please ensure it is a valid text, PDF, Markdown, or JSON file.");
    }
  };

  const handleRemoveFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const clean = query.trim();
    if ((!clean && !attachedFile) || isDisabled) return;

    const textToSend = clean || (attachedFile ? `Explain and summarize ${attachedFile.name}` : '');
    const currentAttached = attachedFile;

    setQuery('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (sendHandler) {
      sendHandler(textToSend, currentAttached);
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 sticky bottom-0 z-20">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.txt,.docx,.doc,.json,.csv,.md"
        className="hidden"
      />

      {/* Attachment Preview Badge Chip */}
      {attachedFile && (
        <div className="mb-2.5 flex items-center justify-between px-3 py-1.5 rounded-xl bg-orange-50/90 border border-orange-200 text-xs font-semibold text-orange-950 animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <FileText className="w-4 h-4 text-orange-600 shrink-0" />
            <span className="truncate">{attachedFile.name}</span>
            <span className="text-[10px] text-orange-700/80 font-normal shrink-0">
              ({(attachedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 hover:bg-orange-200/60 rounded-lg text-orange-700 hover:text-orange-950 transition-colors cursor-pointer shrink-0 ml-2"
            title="Remove file"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full relative flex items-center gap-2">
        {/* ChatGPT Style Paperclip Attachment Button */}
        <button
          type="button"
          onClick={handleFileClick}
          disabled={isDisabled}
          className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-orange-100/70 border border-slate-200 hover:border-orange-300 text-slate-600 hover:text-orange-700 flex items-center justify-center transition-all duration-200 cursor-pointer shrink-0 disabled:opacity-40"
          title="Upload document to RAG database"
        >
          <Paperclip className="w-4.5 h-4.5 text-slate-600 hover:text-orange-600" />
        </button>

        {/* Input Text Field */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder={attachedFile ? `Ask a question about ${attachedFile.name}...` : "Ask SRKR AI or attach a file..."}
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
            className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 rounded-2xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none shadow-xs transition-all duration-200"
          />
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={(!query.trim() && !attachedFile) || isDisabled}
            className="absolute right-1.5 w-8 h-8 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white flex items-center justify-center transition-all duration-200 shadow-md shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Send query"
          >
            <Send className={`w-3.5 h-3.5 ${isDisabled ? 'animate-pulse' : ''}`} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
