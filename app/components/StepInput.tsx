"use client";
import { PrimaryButton } from "./ui";

interface Props {
  input: { target: string; context: string; geography: string };
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
          <h1 className="text-3xl font-bold text-[#e8e8f2] leading-tight">
            From research to ready-to-send messages
          </h1>
          <p className="text-[#6060a0] text-base">
            Enter your target market and get a complete outreach intelligence report in minutes.
          </p>
        </div>

        <div className="bg-[#0f0f1a] border border-[#1e1e35] rounded-2xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0c0]">
              Target Market or Industry <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={input.target}
              onChange={e => onChange("target", e.target.value)}
              onKeyDown={e => e.key === "Enter" && input.target.trim() && !loading && onSubmit()}
              placeholder="e.g. Recruitment agencies in the UK, or B2B SaaS companies selling to HR teams"
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-xl px-4 py-3 text-[#e8e8f2] placeholder-[#3a3a60] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0c0]">
              What are you selling? <span className="text-[#4a4a70]">(optional — improves output)</span>
            </label>
            <textarea
              value={input.context}
              onChange={e => onChange("context", e.target.value)}
              placeholder="e.g. Cold email outreach services that book 10–15 qualified meetings per month for B2B companies"
              rows={3}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-xl px-4 py-3 text-[#e8e8f2] placeholder-[#3a3a60] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#a0a0c0]">Geography Focus</label>
            <select
              value={input.geography}
              onChange={e => onChange("geography", e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-xl px-4 py-3 text-[#e8e8f2] text-sm focus:outline-none focus:border-[#4f8ef7] transition-colors"
            >
              {["Global", "United States", "United Kingdom", "Europe", "Australia", "Canada"].map(g => (
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

        <div className="flex items-center justify-center gap-6 text-xs text-[#4a4a70]">
          {["Market Research", "ICP + Personas", "Campaign Strategy", "Outreach Messages"].map((s, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f8ef7]/50" />
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
