"use client";
import { useState } from "react";
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

function CompetitorCard({ c, index }: { c: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-purple-500/40">
      {/* Header — always visible */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <p className="font-semibold text-[#f0f0f0]">{c.name}</p>
            {c.years_in_business && c.years_in_business !== "Unknown" && (
              <span className="text-xs text-[#555555] bg-[#111111] border border-[#1a1a1a] rounded-full px-2 py-0.5">
                Est. {c.founded_year !== "Unknown" ? c.founded_year : ""} · {c.years_in_business}
              </span>
            )}
          </div>
          {c.usp && (
            <p className="text-xs text-[#a0a0a0] leading-relaxed">{c.usp}</p>
          )}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 text-xs text-[#555555] hover:text-[#f0f0f0] bg-[#111111] border border-[#1a1a1a] rounded-lg px-3 py-1.5 transition-colors"
        >
          {expanded ? "Collapse ▲" : "Full Report ▼"}
        </button>
      </div>

      {/* Links row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {c.website && c.website !== "Unknown" && (
          <a href={c.website} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 hover:bg-blue-500/20 transition-colors">
            🌐 Website
          </a>
        )}
        {c.linkedin_url && c.linkedin_url !== "Unknown" && (
          <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 hover:bg-blue-500/20 transition-colors">
            in Company Page
          </a>
        )}
        {c.owner_linkedin && c.owner_linkedin !== "Unknown" && (
          <a href={c.owner_linkedin} target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 hover:bg-green-500/20 transition-colors">
            in {c.owner_name !== "Unknown" ? c.owner_name : "Founder"}
          </a>
        )}
        {c.company_size && c.company_size !== "Unknown" && (
          <span className="text-xs text-[#555555] bg-[#0a0a0a] border border-[#1a1a1a] rounded-full px-3 py-1">
            {c.company_size}
          </span>
        )}
      </div>

      {/* Core offer + pricing — always visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {c.core_offer && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
            <p className="text-xs text-[#555555] mb-1">Core Offer</p>
            <p className="text-xs text-[#d0d0d0]">{c.core_offer}</p>
          </div>
        )}
        {c.pricing_model && c.pricing_model !== "Unknown" && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
            <p className="text-xs text-[#555555] mb-1">Pricing Model</p>
            <p className="text-xs text-[#d0d0d0]">{c.pricing_model}</p>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="space-y-4 border-t border-[#1a1a1a] pt-4 mt-1 animate-fade-in">

          {/* Owner section */}
          {(c.owner_name && c.owner_name !== "Unknown") && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-2">Founder / Owner</p>
              <p className="text-sm font-semibold text-[#f0f0f0] mb-1">{c.owner_name}</p>
              {c.owner_background && c.owner_background !== "Unknown" && (
                <p className="text-xs text-[#a0a0a0] mb-3 leading-relaxed">{c.owner_background}</p>
              )}
              {c.owner_online_presence?.length > 0 && (
                <div>
                  <p className="text-xs text-[#555555] mb-1">Find them online</p>
                  <div className="flex flex-wrap gap-2">
                    {c.owner_online_presence.map((p: string, i: number) => (
                      <span key={i} className="text-xs bg-[#111111] border border-[#222222] text-[#a0a0a0] rounded-full px-2.5 py-1">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Needs they solve */}
          {c.needs_they_solve?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Needs They Solve</p>
              <ul className="space-y-1.5">
                {c.needs_they_solve.map((n: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#a0a0a0]">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>{n}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shortcomings */}
          {c.shortcomings?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Shortcomings & Gaps</p>
              <ul className="space-y-1.5">
                {c.shortcomings.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#a0a0a0]">
                    <span className="text-red-400 mt-0.5 shrink-0">✕</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Your opportunity */}
          {c.differentiator_opportunity && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-green-400 mb-1">Your Opportunity vs. {c.name}</p>
              <p className="text-xs text-green-300 leading-relaxed">{c.differentiator_opportunity}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function StepResearch({ data, target, onNext, loading }: Props) {
  if (!data) return null;
  const {
    market_overview: mo,
    competitors = [],
    competitor_profiles = [],
    pain_points = [],
    desires = [],
    objections = [],
    buying_triggers = [],
    market_opportunities = [],
    common_messaging = [],
    _meta,
  } = data;

  const displayCompetitors = competitor_profiles.length > 0 ? competitor_profiles : competitors;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader title="Market Research" subtitle={`Intelligence report for: ${target}`} />
        {_meta?.sources?.length > 0 && (
          <div className="shrink-0 flex flex-wrap gap-1.5 justify-end mt-1">
            {_meta.live_research && (
              <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
                Live data
              </span>
            )}
            {_meta.sources.map((s: string, i: number) => (
              <span key={i} className="text-xs bg-[#0a0a0a] text-[#555555] border border-[#1a1a1a] rounded-full px-2.5 py-1">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Market Overview */}
      <Card>
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-4">Market Overview</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555555]">Market Size</p>
            <p className="text-sm font-semibold text-[#f0f0f0] mt-1">{mo?.size}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555555]">Growth Rate</p>
            <p className="text-sm font-semibold text-green-400 mt-1">{mo?.growth_rate}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555555]">Maturity</p>
            <div className="mt-1">
              <Tag color={maturityColor[mo?.maturity] ?? "gray"}>{mo?.maturity}</Tag>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(mo?.key_trends ?? []).map((t: string, i: number) => <Tag key={i} color="blue">{t}</Tag>)}
        </div>
      </Card>

      {/* Competitor Intelligence */}
      {displayCompetitors.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider">Competitor Intelligence</h3>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5">
              {displayCompetitors.length} competitors
            </span>
          </div>
          <p className="text-xs text-[#555555] mb-4">
            Click "Full Report" on any card to see founder details, needs they solve, shortcomings, and your opportunity against them.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayCompetitors.map((c: any, i: number) =>
              competitor_profiles.length > 0
                ? <CompetitorCard key={i} c={c} index={i} />
                : (
                  <Card key={i}>
                    <p className="font-semibold text-[#f0f0f0] mb-1">{c.name}</p>
                    <p className="text-xs text-[#555555] mb-3">{c.positioning}</p>
                    <p className="text-xs text-[#444444] italic mb-2">"{c.common_offer}"</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        {(c.strengths ?? []).map((s: string, j: number) => (
                          <div key={j} className="flex items-start gap-1 text-green-400 mb-0.5">
                            <span className="mt-0.5 shrink-0">+</span><span className="text-[#a0a0a0]">{s}</span>
                          </div>
                        ))}
                      </div>
                      <div>
                        {(c.weaknesses ?? []).map((w: string, j: number) => (
                          <div key={j} className="flex items-start gap-1 text-red-400 mb-0.5">
                            <span className="mt-0.5 shrink-0">−</span><span className="text-[#a0a0a0]">{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )
            )}
          </div>
        </div>
      )}

      {/* Pain / Desires grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500/60">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Pain Points</h3>
          <ol className="space-y-2">
            {pain_points.map((p: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
                <span className="text-[#555555] shrink-0 w-5">{i + 1}.</span>{p}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-l-4 border-l-green-500/60">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Desires & Aspirations</h3>
          <ol className="space-y-2">
            {desires.map((d: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
                <span className="text-[#555555] shrink-0 w-5">{i + 1}.</span>{d}
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
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
                <span className="text-orange-400 shrink-0">→</span>{t}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-l-4 border-l-purple-500/60">
          <h3 className="text-sm font-semibold text-purple-400 mb-3">Common Objections</h3>
          <ul className="space-y-2">
            {objections.map((o: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
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
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
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
          <p className="text-xs text-[#555555] mb-3">Everyone in your market is saying these things. Differentiate by NOT using them.</p>
          <ul className="space-y-2">
            {common_messaging.map((m: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#a0a0a0] line-through decoration-yellow-400/40">
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
