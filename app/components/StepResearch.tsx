"use client";
import { Card, CopyButton, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props {
  data: any;
  target: string;
  onNext: () => void;
  loading: boolean;
}

const maturityColor: Record<string, string> = {
  emerging: "blue", growing: "green", mature: "yellow", declining: "red",
};

export default function StepResearch({ data, target, onNext, loading }: Props) {
  if (!data) return null;
  const { market_overview: mo, competitors = [], pain_points = [], desires = [],
    objections = [], buying_triggers = [], market_opportunities = [], common_messaging = [] } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Market Research" subtitle={`Intelligence report for: ${target}`} />

      {/* Market Overview */}
      <Card>
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-4">Market Overview</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-[#080810] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#6060a0]">Market Size</p>
            <p className="text-sm font-semibold text-[#e8e8f2] mt-1">{mo?.size}</p>
          </div>
          <div className="bg-[#080810] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#6060a0]">Growth Rate</p>
            <p className="text-sm font-semibold text-[#22c55e] mt-1">{mo?.growth_rate}</p>
          </div>
          <div className="bg-[#080810] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#6060a0]">Maturity</p>
            <div className="mt-1">
              <Tag color={maturityColor[mo?.maturity] ?? "gray"}>{mo?.maturity}</Tag>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(mo?.key_trends ?? []).map((t: string, i: number) => <Tag key={i} color="blue">{t}</Tag>)}
        </div>
      </Card>

      {/* Competitors */}
      {competitors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Competitor Landscape</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitors.map((c: any, i: number) => (
              <Card key={i}>
                <p className="font-semibold text-[#e8e8f2] mb-1">{c.name}</p>
                <p className="text-xs text-[#6060a0] mb-3">{c.positioning}</p>
                <p className="text-xs text-[#4a4a70] italic mb-2">"{c.common_offer}"</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    {(c.strengths ?? []).map((s: string, j: number) => (
                      <div key={j} className="flex items-start gap-1 text-green-400 mb-0.5">
                        <span className="mt-0.5 shrink-0">+</span><span className="text-[#a0a0c0]">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    {(c.weaknesses ?? []).map((w: string, j: number) => (
                      <div key={j} className="flex items-start gap-1 text-red-400 mb-0.5">
                        <span className="mt-0.5 shrink-0">−</span><span className="text-[#a0a0c0]">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pain / Desires grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500/60">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Pain Points</h3>
          <ol className="space-y-2">
            {pain_points.map((p: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-[#6060a0] shrink-0 w-5">{i + 1}.</span>{p}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-l-4 border-l-green-500/60">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Desires & Aspirations</h3>
          <ol className="space-y-2">
            {desires.map((d: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-[#6060a0] shrink-0 w-5">{i + 1}.</span>{d}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Triggers / Objections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-orange-500/60">
          <h3 className="text-sm font-semibold text-orange-400 mb-3">Buying Triggers</h3>
          <ul className="space-y-2">
            {buying_triggers.map((t: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-orange-400 shrink-0">→</span>{t}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-purple-500/60">
          <h3 className="text-sm font-semibold text-purple-400 mb-3">Common Objections</h3>
          <ul className="space-y-2">
            {objections.map((o: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-purple-400 shrink-0">✕</span>{o}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Opportunities */}
      {market_opportunities.length > 0 && (
        <Card className="border-l-4 border-l-blue-500/60">
          <h3 className="text-sm font-semibold text-blue-400 mb-3">Market Opportunities</h3>
          <ul className="space-y-2">
            {market_opportunities.map((o: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-blue-400 shrink-0">◆</span>{o}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Overused messaging */}
      {common_messaging.length > 0 && (
        <Card className="border-l-4 border-l-yellow-500/60">
          <h3 className="text-sm font-semibold text-yellow-400 mb-1">Overused Messaging — Avoid These</h3>
          <p className="text-xs text-[#6060a0] mb-3">Everyone in your market is saying these things. Differentiate by NOT using them.</p>
          <ul className="space-y-2">
            {common_messaging.map((m: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#a0a0c0] line-through decoration-yellow-400/40">
                <span className="no-underline text-yellow-400 shrink-0">⚠</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="flex justify-end pt-2">
        <PrimaryButton onClick={onNext} disabled={loading}>
          {loading ? "Generating ICP..." : "Generate ICP & Personas →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
