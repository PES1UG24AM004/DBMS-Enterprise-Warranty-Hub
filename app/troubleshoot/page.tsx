'use client';

import React, { useState } from 'react';
import AppShell from '@/components/AppShell';
import {
  Search,
  Sparkles,
  Database,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  CornerDownRight,
} from 'lucide-react';

export default function TroubleshootPage() {
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultsData, setResultsData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    'air conditioner compressor refrigerant pressure drop and leak',
    'laptop high temperature thermal throttling and fan noise',
    'printer paper jam pickup roller feeding failure',
    'UPS battery communication fault runtime failure',
    'commercial washer drainage pump error code water standing',
    'commercial espresso machine steam pressure loss',
  ];

  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery !== undefined ? customQuery : queryText;
    if (!queryToUse.trim()) return;

    setLoading(true);
    setError(null);
    if (customQuery) setQueryText(customQuery);

    try {
      const res = await fetch('/api/troubleshoot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryToUse }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Vector similarity search failed.');
        setResultsData(null);
      } else {
        setResultsData(data);
      }
    } catch {
      setError('Failed to reach local inference service.');
      setResultsData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#252530] pb-4">
          <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-[#B88AFF] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#B88AFF]" />
            <span>LOCAL AI EMBEDDING ENGINE • POSTGRESQL PGVECTOR</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] mt-1">
            Semantic Equipment Troubleshooting Search
          </h1>
          <p className="text-xs text-[#9292A3] mt-0.5">
            Searches 384-dimensional dense vectors using cosine distance (<code className="text-[#00F0FF]">&lt;=&gt;</code>) to retrieve past repair solutions based on semantic meaning, not merely keyword exact matches.
          </p>
        </div>

        {/* Search Bar & Form */}
        <div className="bg-[#08080D] border border-[#252530] rounded-lg p-5 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9292A3] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Describe equipment malfunction symptoms or error codes..."
                className="w-full bg-[#12121A] border border-[#252530] focus:border-[#00F0FF] focus:outline-none rounded pl-9 pr-3 py-2.5 text-xs text-[#F5F5F7] placeholder-[#5F5F70]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="px-5 py-2.5 rounded bg-[#00F0FF] hover:bg-[#00d0e0] text-black font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  <span>Computing Vector...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Vector Search</span>
                </>
              )}
            </button>
          </form>

          {/* Quick test pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-mono text-[#9292A3] uppercase shrink-0">Sample Queries:</span>
            {sampleQueries.map((sq) => (
              <button
                key={sq}
                type="button"
                onClick={() => handleSearch(undefined, sq)}
                className="px-2 py-0.5 rounded bg-[#12121A] hover:bg-[#181824] border border-[#252530] hover:border-[#00F0FF]/40 text-[10px] text-[#9292A3] hover:text-[#00F0FF] transition-colors truncate max-w-xs"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-lg bg-[#FF4D6D]/10 border border-[#FF4D6D]/30 flex items-start gap-3 text-xs text-[#FF4D6D]">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">Vector Inference Engine Error</div>
              <div className="text-[11px] mt-0.5">{error}</div>
            </div>
          </div>
        )}

        {/* Inference & Vector Details Bar */}
        {resultsData && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-[#0D0D12] border border-[#252530] text-[11px] font-mono">
            <div className="flex items-center gap-4 text-[#9292A3]">
              <div>
                MODEL:{' '}
                <span className="text-[#00F0FF]">onnx-community/all-MiniLM-L6-v2-ONNX</span>
              </div>
              <div>
                DIMENSIONS: <span className="text-[#00F0FF]">{resultsData.dimensions}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[#9292A3]">
              <div>
                OPERATOR: <span className="text-[#4DDBA7]">COSINE DISTANCE (&lt;=&gt;)</span>
              </div>
              <div className="flex items-center gap-1 text-[#F5F5F7]">
                <Clock className="w-3 h-3 text-[#00F0FF]" />
                <span>{resultsData.execution_time_ms} ms</span>
              </div>
            </div>
          </div>
        )}

        {/* Results Container */}
        {resultsData && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#9292A3]">
                Top {resultsData.results.length} Semantically Relevant Historical Records
              </h2>
              <span className="text-[10px] font-mono text-[#00F0FF]">
                SORTED BY COSINE SIMILARITY
              </span>
            </div>

            {resultsData.results.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#9292A3] bg-[#08080D] border border-[#252530] rounded-lg">
                No matching historical maintenance records found.
              </div>
            ) : (
              resultsData.results.map((rec: any, idx: number) => {
                const simPct = parseFloat(rec.similarity_percentage);
                const scoreColor =
                  simPct >= 65
                    ? 'text-[#4DDBA7] border-[#4DDBA7]/40 bg-[#4DDBA7]/10'
                    : simPct >= 40
                    ? 'text-[#00F0FF] border-[#00F0FF]/40 bg-[#00F0FF]/10'
                    : 'text-[#FFB84D] border-[#FFB84D]/40 bg-[#FFB84D]/10';

                return (
                  <div
                    key={rec.id}
                    className="p-5 rounded-lg bg-[#08080D] border border-[#252530] hover:border-[#00F0FF]/40 transition-colors space-y-3"
                  >
                    {/* Top Row: Tag, Category, Similarity Score */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252530]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#00F0FF]">
                          #{idx + 1}
                        </span>
                        <span className="font-mono text-xs text-[#F5F5F7]">
                          [{rec.asset_tag}] {rec.asset_name}
                        </span>
                        <span className="text-[10px] text-[#9292A3] font-mono bg-[#12121A] px-2 py-0.5 rounded border border-[#252530]">
                          {rec.asset_category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#9292A3]">
                          Distance: {rec.cosine_distance}
                        </span>
                        <span className={`badge-tag px-2 py-0.5 rounded border text-[10px] font-bold ${scoreColor}`}>
                          {rec.similarity_percentage}% SIMILARITY
                        </span>
                      </div>
                    </div>

                    {/* Issue Title & Description */}
                    <div>
                      <h3 className="text-sm font-semibold text-[#F5F5F7]">
                        {rec.issue_title}
                      </h3>
                      <p className="text-xs text-[#9292A3] mt-1 leading-relaxed">
                        {rec.issue_description}
                      </p>
                    </div>

                    {/* Documented Resolution from DB */}
                    <div className="p-3 rounded bg-[#0D0D12] border border-[#252530] space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#4DDBA7]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="uppercase font-semibold">Documented Resolution Applied:</span>
                      </div>
                      <p className="text-xs text-[#F5F5F7] leading-relaxed pl-5">
                        {rec.resolution}
                      </p>
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#9292A3] pt-1">
                      <span>Service Specialist: {rec.performed_by_name || 'Technical Field Team'}</span>
                      <span>Recorded Date: {new Date(rec.record_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
