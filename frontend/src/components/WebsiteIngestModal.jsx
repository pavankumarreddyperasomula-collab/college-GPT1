import React, { useState } from 'react';
import { X, Globe, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Server, ArrowRight } from 'lucide-react';
import { API_URL } from '../config';

const WebsiteIngestModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await fetch(`${API_URL}/refresh-website`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data.results || []);
      } else {
        setError(data.detail || data.message || 'Failed to sync website content.');
      }
    } catch (err) {
      console.error('Error refreshing website:', err);
      setError('Cannot connect to backend server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'updated':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-[10px] tracking-wide border border-emerald-300 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> UPDATED
          </span>
        );
      case 'unchanged':
        return (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold text-[10px] tracking-wide border border-slate-300 flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-500" /> UNCHANGED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-950 font-black text-[10px] tracking-wide border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" /> FAILED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white/95 rounded-3xl w-full max-w-2xl border border-orange-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transform transition-all duration-300">
        
        {/* Glowing Header */}
        <div className="bg-gradient-to-r from-orange-600 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-300" />
            <h3 className="text-lg font-black tracking-tight">Website Content Ingestion (RAG Sync)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            title="Close Panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200/70 text-slate-800 text-xs font-semibold leading-relaxed space-y-2">
            <div className="flex items-center gap-2 text-orange-950 font-extrabold text-sm">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Allowlisted Sync Only</span>
            </div>
            <p>
              Manually crawl public content from the S.R.K.R. official portal for the allowlisted pages below.
              The ingestion pipeline uses a hash-based change detection system. If the page content has not changed,
              it skips re-embedding to save API tokens.
            </p>
          </div>

          {/* List of Tracked Allowlisted URLs */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Tracked Pages (Allowlist)</span>
            <div className="space-y-1.5">
              {[
                { url: "https://srkr.edu.in/notices", cat: "college" },
                { url: "https://srkr.edu.in/academic-calendar", cat: "college" },
                { url: "https://srkr.edu.in/departments/cse/syllabus", cat: "college" }
              ].map((p, idx) => (
                <div key={idx} className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-900 group hover:bg-slate-100/60 transition-colors">
                  <div className="flex items-center gap-2 truncate pr-4">
                    <Globe className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
                    <span className="truncate">{p.url}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[9px] font-black uppercase shrink-0 border border-orange-200">
                    {p.cat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Area */}
          {results && (
            <div className="space-y-2 animate-fade-in">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Sync Results</span>
              <div className="space-y-2">
                {results.map((r, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 truncate text-xs font-bold text-slate-900">
                        <ArrowRight className="w-3 h-3 text-orange-600 shrink-0" />
                        <span className="truncate" title={r.url}>{r.url}</span>
                      </div>
                      <div className="shrink-0">{getStatusBadge(r.status)}</div>
                    </div>
                    {r.status === 'updated' && (
                      <div className="text-[11px] font-bold text-slate-600">
                        Generated and stored <span className="font-extrabold text-orange-600">{r.chunks} chunk(s)</span> in RAG database.
                      </div>
                    )}
                    {r.status === 'failed' && (
                      <div className="text-[11px] font-bold text-rose-700 bg-rose-50/50 p-2 rounded-lg border border-rose-100">
                        Error: {r.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-200/70 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 text-xs font-extrabold hover:bg-slate-200 transition-colors cursor-pointer"
            disabled={loading}
          >
            Close
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Ingesting Website Content...' : 'Sync Website Content Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default WebsiteIngestModal;
