"use client";
import { PrimaryButton } from "./ui";

interface Props {
  input: { target: string; context: string; geography: string; websiteUrl: string };
  onChange: (k: string, v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export default function StepInput({ input, onChange, onSubmit, loading }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm mb-2">
            <span>◆</span> Cold Outreach Intelligence
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            From research to ready-to-send messages
          </h1>
          <p className="text-[#555] text-base">
            Enter your target market and get a complete outreach intelligence report in minutes.
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 space-y-5">

          {/* Target Market */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]">
              Target Market or Industry <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={input.target}
              onChange={e => onChange("target", e.target.value)}
              onKeyDown={e => e.key === "Enter" && input.target.trim() && !loading && onSubmit()}
              placeholder="e.g. Recruitment agencies in the UK, or B2B SaaS companies selling to HR teams"
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder-[#333] text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* What are you selling */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]">
              What are you selling? <span className="text-[#444]">(optional — improves output)</span>
            </label>
            <textarea
              value={input.context}
              onChange={e => onChange("context", e.target.value)}
              placeholder="e.g. Cold email outreach services that book 10–15 qualified meetings per month for B2B companies"
              rows={3}
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white placeholder-[#333] text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
            />
          </div>

          {/* Prospect Website URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]">
              Prospect Website URL <span className="text-[#444]">(optional — adds SWOT & website analysis to report)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#444] text-sm select-none">🔗</span>
              <input
                type="url"
                value={input.websiteUrl}
                onChange={e => onChange("websiteUrl", e.target.value)}
                placeholder="https://prospect-company.com"
                className="w-full bg-[#000] border border-[#1a1a1a] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#333] text-sm focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            {input.websiteUrl && (
              <p className="text-xs text-blue-400/70">
                ✓ Research report will be personalised to this company and include a SWOT analysis
              </p>
            )}
          </div>

          {/* Geography */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0a0]">Location / Geography Focus</label>
            <select
              value={input.geography}
              onChange={e => onChange("geography", e.target.value)}
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
            >
              {["Global", "United States", "United Kingdom", "Europe", "Australia", "Canada", "South Africa", "Middle East", "Asia Pacific"].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <PrimaryButton
            onClick={onSubmit}
            disabled={!input.target.trim() || loading}
            className="w-full py-3.5 text-base"
          >
            {loading ? "Generating..." : "Generate Intelligence Report →"}
          </PrimaryButton>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-[#333]">
          {["Market Research", "ICP + Personas", "Campaign Strategy", "Outreach Messages"].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
