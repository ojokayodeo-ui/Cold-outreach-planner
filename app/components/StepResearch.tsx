"use client";
import { useState } from "react";
import { Card, CopyButton, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props {
  data: any;
  target: string;
  prefetching?: boolean;
  onNext: () => void;
  loading: boolean;
}

const maturityColor: Record<string, string> = {
  emerging: "blue", growing: "green", mature: "yellow", declining: "red",
};

// ── PDF generator ────────────────────────────────────────────────────────────
function downloadPDF(data: any, target: string) {
  const mo = data.market_overview ?? {};
  const wa = data.website_analysis ?? null;
  const sw = data.swot ?? null;
  const cp = data.competitor_profiles ?? [];
  const companyName = wa?.company_name ?? target;

  const section = (title: string, color: string, content: string) => `
    <div class="section">
      <h2 style="color:${color};border-bottom:2px solid ${color}30;padding-bottom:6px">${title}</h2>
      ${content}
    </div>`;

  const list = (items: string[], bullet = "•", color = "#555") =>
    `<ul>${(items ?? []).map(i => `<li><span style="color:${color}">${bullet}</span> ${i}</li>`).join("")}</ul>`;

  const grid2 = (a: string, b: string) =>
    `<div class="grid2"><div>${a}</div><div>${b}</div></div>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Market Intelligence Report — ${companyName}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.6; }
  h1 { font-size: 26px; color: #0a0a0a; margin-bottom: 4px; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin: 0 0 12px; }
  h3 { font-size: 14px; font-weight: 600; color: #111; margin-bottom: 4px; }
  .meta { color: #666; font-size: 12px; margin-bottom: 8px; }
  .badge { display: inline-block; background: #f0f0f0; border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; color: #333; margin-right: 4px; }
  .section { margin-bottom: 28px; page-break-inside: avoid; }
  .card { background: #f9f9f9; border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .card-border-blue { border-left: 4px solid #3b82f6; }
  .card-border-green { border-left: 4px solid #16a34a; }
  .card-border-red { border-left: 4px solid #dc2626; }
  .card-border-purple { border-left: 4px solid #7c3aed; }
  .card-border-orange { border-left: 4px solid #ea580c; }
  .card-border-yellow { border-left: 4px solid #ca8a04; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid4 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .swot-cell { border-radius: 8px; padding: 14px; }
  .swot-s { background: #f0fdf4; border: 1px solid #bbf7d0; }
  .swot-w { background: #fff7ed; border: 1px solid #fed7aa; }
  .swot-o { background: #eff6ff; border: 1px solid #bfdbfe; }
  .swot-t { background: #fef2f2; border: 1px solid #fecaca; }
  .swot-cell h3 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 8px; }
  .swot-s h3 { color: #15803d; } .swot-w h3 { color: #c2410c; }
  .swot-o h3 { color: #1d4ed8; } .swot-t h3 { color: #dc2626; }
  ul { padding-left: 0; list-style: none; }
  li { padding: 3px 0; color: #333; display: flex; gap: 6px; }
  .stat-box { display: inline-block; background: #f5f5f5; border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px 18px; margin-right: 12px; text-align: center; min-width: 100px; }
  .stat-val { font-size: 18px; font-weight: 700; color: #111; }
  .stat-lbl { font-size: 11px; color: #666; margin-top: 2px; }
  .comp-name { font-weight: 600; font-size: 14px; color: #111; }
  .comp-usp { color: #555; font-size: 12px; margin: 2px 0 8px; }
  .tag { display: inline-block; background: #eff6ff; color: #1d4ed8; border-radius: 20px; padding: 1px 8px; font-size: 11px; margin: 2px; }
  a { color: #3b82f6; text-decoration: none; }
  .page-break { page-break-after: always; }
  .header-bar { background: #0a0a0a; color: #fff; border-radius: 10px; padding: 20px 24px; margin-bottom: 28px; }
  .header-bar .title { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .header-bar .sub { font-size: 13px; color: #aaa; }
  @media print {
    body { padding: 20px; }
    .no-print { display: none; }
    .page-break { page-break-after: always; }
  }
</style>
</head>
<body>

<div class="no-print" style="background:#1d4ed8;color:#fff;padding:12px 20px;border-radius:8px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between">
  <span><strong>Save as PDF:</strong> Use your browser's Print function (Ctrl+P / Cmd+P) and choose "Save as PDF"</span>
  <button onclick="window.print()" style="background:#fff;color:#1d4ed8;border:none;padding:8px 16px;border-radius:6px;font-weight:600;cursor:pointer">Print / Save PDF</button>
</div>

<div class="header-bar">
  <div class="title">Market Intelligence Report</div>
  <div class="sub">${companyName}${wa ? ` · ${wa.what_they_do?.split(".")[0] ?? ""}` : ""}</div>
  <div style="margin-top:8px;font-size:11px;color:#666">Generated ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · Cold Outreach Intelligence</div>
</div>

${section("Market Overview", "#3b82f6", `
  <div style="margin-bottom:14px">
    <div class="stat-box"><div class="stat-val">${mo.size ?? "—"}</div><div class="stat-lbl">Market Size</div></div>
    <div class="stat-box"><div class="stat-val" style="color:#16a34a">${mo.growth_rate ?? "—"}</div><div class="stat-lbl">Growth Rate</div></div>
    <div class="stat-box"><div class="stat-val">${mo.maturity ?? "—"}</div><div class="stat-lbl">Maturity</div></div>
  </div>
  <div>${(mo.key_trends ?? []).map((t: string) => `<span class="tag">${t}</span>`).join("")}</div>
`)}

${wa ? section("Website & Marketing Analysis", "#7c3aed", `
  <div class="card card-border-purple">
    <h3>${wa.company_name ?? ""}</h3>
    <p class="meta">${wa.tagline ?? ""}</p>
    <p style="margin-bottom:10px">${wa.what_they_do ?? ""}</p>
    ${grid2(
      `<div><strong>Target Audience</strong><p style="color:#555;font-size:12px">${wa.target_audience ?? ""}</p></div>
       <div style="margin-top:10px"><strong>Value Proposition</strong><p style="color:#555;font-size:12px">${wa.value_proposition ?? ""}</p></div>`,
      `<div><strong>Key Services</strong>${list(wa.key_services ?? [], "→", "#7c3aed")}</div>
       <div style="margin-top:8px"><strong>Online Presence</strong><span class="badge">${wa.online_presence_quality ?? ""}</span></div>`
    )}
  </div>
  ${grid2(
    `<div class="card" style="border-left:4px solid #16a34a">
      <h3 style="color:#15803d;margin-bottom:8px">✓ Messaging Strengths</h3>
      ${list(wa.messaging_strengths ?? [], "✓", "#16a34a")}
    </div>`,
    `<div class="card" style="border-left:4px solid #dc2626">
      <h3 style="color:#dc2626;margin-bottom:8px">✕ Messaging Gaps</h3>
      ${list(wa.messaging_gaps ?? [], "✕", "#dc2626")}
    </div>`
  )}
  ${wa.how_they_compare ? `<div class="card"><strong>Market Positioning:</strong> <span style="color:#555">${wa.how_they_compare}</span></div>` : ""}
`) : ""}

${sw ? section("SWOT Analysis" + (wa?.company_name ? ` — ${wa.company_name}` : ""), "#0a0a0a", `
  <div class="grid4">
    <div class="swot-cell swot-s">
      <h3>💪 Strengths</h3>
      ${list(sw.strengths ?? [], "✓", "#15803d")}
    </div>
    <div class="swot-cell swot-w">
      <h3>⚠ Weaknesses</h3>
      ${list(sw.weaknesses ?? [], "✕", "#c2410c")}
    </div>
    <div class="swot-cell swot-o">
      <h3>🚀 Opportunities</h3>
      ${list(sw.opportunities ?? [], "→", "#1d4ed8")}
    </div>
    <div class="swot-cell swot-t">
      <h3>⚡ Threats</h3>
      ${list(sw.threats ?? [], "!", "#dc2626")}
    </div>
  </div>
`) : ""}

${section("Buyer Intelligence", "#ea580c", grid2(
  `<div class="card card-border-red">
    <h3 style="color:#dc2626;margin-bottom:8px">Pain Points</h3>
    ${list(data.pain_points ?? [], "✕", "#dc2626")}
  </div>
  <div class="card card-border-orange" style="margin-top:12px">
    <h3 style="color:#ea580c;margin-bottom:8px">Buying Triggers</h3>
    ${list(data.buying_triggers ?? [], "→", "#ea580c")}
  </div>`,
  `<div class="card card-border-green">
    <h3 style="color:#16a34a;margin-bottom:8px">Desires & Aspirations</h3>
    ${list(data.desires ?? [], "✓", "#16a34a")}
  </div>
  <div class="card" style="border-left:4px solid #7c3aed;margin-top:12px">
    <h3 style="color:#7c3aed;margin-bottom:8px">Common Objections</h3>
    ${list(data.objections ?? [], "✗", "#7c3aed")}
  </div>`
))}

<div class="page-break"></div>

${section("Competitor Intelligence (10 Competitors)", "#7c3aed",
  (data.competitor_profiles ?? []).map((c: any, i: number) => `
    <div class="card card-border-purple" style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <div>
          <span style="background:#7c3aed;color:#fff;border-radius:50%;width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;margin-right:6px">${i+1}</span>
          <span class="comp-name">${c.name}</span>
          ${c.years_in_business && c.years_in_business !== "Unknown" ? `<span class="badge" style="margin-left:6px">${c.years_in_business}</span>` : ""}
        </div>
        <div style="font-size:11px;color:#888">
          ${c.website && c.website !== "Unknown" ? `<a href="${c.website}">${c.website}</a>` : ""}
        </div>
      </div>
      <p class="comp-usp">${c.usp ?? ""}</p>
      ${grid2(
        `<div><strong style="font-size:11px;color:#555;text-transform:uppercase">Core Offer</strong><p style="font-size:12px;color:#333;margin-top:2px">${c.core_offer ?? ""}</p></div>
         <div style="margin-top:8px"><strong style="font-size:11px;color:#555;text-transform:uppercase">Pricing</strong><p style="font-size:12px;color:#333;margin-top:2px">${c.pricing_model ?? "Unknown"}</p></div>
         ${c.owner_name && c.owner_name !== "Unknown" ? `<div style="margin-top:8px"><strong style="font-size:11px;color:#555;text-transform:uppercase">Owner / Founder</strong><p style="font-size:12px;color:#333;margin-top:2px">${c.owner_name}${c.owner_linkedin && c.owner_linkedin !== "Unknown" ? ` · <a href="${c.owner_linkedin}">LinkedIn</a>` : ""}</p></div>` : ""}`,
        `<div><strong style="font-size:11px;color:#16a34a;text-transform:uppercase">Needs They Solve</strong>${list(c.needs_they_solve ?? [], "✓", "#16a34a")}</div>
         <div style="margin-top:8px"><strong style="font-size:11px;color:#dc2626;text-transform:uppercase">Shortcomings</strong>${list(c.shortcomings ?? [], "✕", "#dc2626")}</div>`
      )}
      ${c.differentiator_opportunity ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px;margin-top:10px"><strong style="color:#15803d;font-size:11px">YOUR OPPORTUNITY: </strong><span style="color:#166534;font-size:12px">${c.differentiator_opportunity}</span></div>` : ""}
    </div>`).join("")
)}

${section("Market Opportunities & Messaging", "#3b82f6", grid2(
  `<div class="card card-border-blue">
    <h3 style="color:#1d4ed8;margin-bottom:8px">Market Opportunities</h3>
    ${list(data.market_opportunities ?? [], "◆", "#1d4ed8")}
  </div>`,
  `<div class="card card-border-yellow">
    <h3 style="color:#ca8a04;margin-bottom:8px">⚠ Avoid These Overused Phrases</h3>
    ${(data.common_messaging ?? []).map((m: string) => `<li style="text-decoration:line-through;color:#999;display:flex;gap:6px"><span style="color:#ca8a04;text-decoration:none">⚠</span>${m}</li>`).join("")}
  </div>`
))}

<div style="text-align:center;color:#aaa;font-size:11px;margin-top:40px;padding-top:20px;border-top:1px solid #eee">
  Market Intelligence Report · ${companyName} · Generated by Cold Outreach Intelligence · ${new Date().toLocaleDateString()}
</div>

</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ── Competitor card (expandable) ─────────────────────────────────────────────
function CompetitorCard({ c, index }: { c: any; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-l-4 border-l-purple-500/40">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-full w-6 h-6 flex items-center justify-center shrink-0">
              {index + 1}
            </span>
            <p className="font-semibold text-[#f0f0f0]">{c.name}</p>
            {c.years_in_business && c.years_in_business !== "Unknown" && (
              <span className="text-xs text-[#555] bg-[#111] border border-[#1a1a1a] rounded-full px-2 py-0.5">
                Est. {c.founded_year !== "Unknown" ? c.founded_year : ""} · {c.years_in_business}
              </span>
            )}
          </div>
          {c.usp && <p className="text-xs text-[#a0a0a0] leading-relaxed">{c.usp}</p>}
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          className="shrink-0 text-xs text-[#555] hover:text-white bg-[#111] border border-[#1a1a1a] rounded-lg px-3 py-1.5 transition-colors"
        >
          {expanded ? "Collapse ▲" : "Full Report ▼"}
        </button>
      </div>

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
            in Company
          </a>
        )}
        {c.owner_linkedin && c.owner_linkedin !== "Unknown" && (
          <a href={c.owner_linkedin} target="_blank" rel="noopener noreferrer"
            className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 hover:bg-green-500/20 transition-colors">
            in {c.owner_name !== "Unknown" ? c.owner_name : "Founder"}
          </a>
        )}
        {c.company_size && c.company_size !== "Unknown" && (
          <span className="text-xs text-[#555] bg-[#0a0a0a] border border-[#1a1a1a] rounded-full px-3 py-1">{c.company_size}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
        {c.core_offer && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
            <p className="text-xs text-[#555] mb-1">Core Offer</p>
            <p className="text-xs text-[#d0d0d0]">{c.core_offer}</p>
          </div>
        )}
        {c.pricing_model && c.pricing_model !== "Unknown" && (
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
            <p className="text-xs text-[#555] mb-1">Pricing</p>
            <p className="text-xs text-[#d0d0d0]">{c.pricing_model}</p>
          </div>
        )}
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-[#1a1a1a] pt-4 animate-fade-in">
          {c.owner_name && c.owner_name !== "Unknown" && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4">
              <p className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-2">Founder / Owner</p>
              <p className="text-sm font-semibold text-white mb-1">{c.owner_name}</p>
              {c.owner_background && c.owner_background !== "Unknown" && (
                <p className="text-xs text-[#a0a0a0] mb-3 leading-relaxed">{c.owner_background}</p>
              )}
              {c.owner_online_presence?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {c.owner_online_presence.map((p: string, i: number) => (
                    <span key={i} className="text-xs bg-[#111] border border-[#222] text-[#a0a0a0] rounded-full px-2.5 py-1">{p}</span>
                  ))}
                </div>
              )}
            </div>
          )}
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
          {c.shortcomings?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Shortcomings</p>
              <ul className="space-y-1.5">
                {c.shortcomings.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#a0a0a0]">
                    <span className="text-red-400 mt-0.5 shrink-0">✕</span>{s}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

// ── Main component ───────────────────────────────────────────────────────────
export default function StepResearch({ data, target, prefetching, onNext, loading }: Props) {
  if (!data) return null;
  const {
    market_overview: mo,
    competitor_profiles = [],
    website_analysis: wa,
    swot,
    pain_points = [],
    desires = [],
    objections = [],
    buying_triggers = [],
    market_opportunities = [],
    common_messaging = [],
    _meta,
  } = data;

  const companyName = wa?.company_name ?? target;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader
          title={wa ? `Intelligence Report — ${companyName}` : "Market Research"}
          subtitle={wa ? `Website analysis, SWOT & market intelligence` : `Report for: ${target}`}
        />
        <div className="flex items-center gap-2 flex-wrap">
          {_meta?.live_research && (
            <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-soft" />
              Live data
            </span>
          )}
          {(_meta?.sources ?? []).map((s: string, i: number) => (
            <span key={i} className="text-xs bg-[#0a0a0a] text-[#555] border border-[#1a1a1a] rounded-full px-2.5 py-1">{s}</span>
          ))}
          <button
            onClick={() => downloadPDF(data, target)}
            className="flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg px-4 py-1.5 transition-colors font-medium"
          >
            ↓ Download PDF
          </button>
        </div>
      </div>

      {/* Market Overview */}
      <Card>
        <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-4">Market Overview</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555]">Market Size</p>
            <p className="text-sm font-semibold text-white mt-1">{mo?.size}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555]">Growth Rate</p>
            <p className="text-sm font-semibold text-green-400 mt-1">{mo?.growth_rate}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex-1 min-w-[120px]">
            <p className="text-xs text-[#555]">Maturity</p>
            <div className="mt-1"><Tag color={maturityColor[mo?.maturity] ?? "gray"}>{mo?.maturity}</Tag></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(mo?.key_trends ?? []).map((t: string, i: number) => <Tag key={i} color="blue">{t}</Tag>)}
        </div>
      </Card>

      {/* Website Analysis */}
      {wa && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">Website & Marketing Analysis</h3>
          <Card className="border-l-4 border-l-purple-500/40 mb-4">
            <div className="flex items-start gap-4 flex-wrap mb-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-base mb-1">{wa.company_name}</p>
                {wa.tagline && <p className="text-sm text-[#a0a0a0] italic mb-2">"{wa.tagline}"</p>}
                <p className="text-sm text-[#c0c0c0] leading-relaxed mb-3">{wa.what_they_do}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[#555] mb-1">Target Audience</p>
                    <p className="text-[#a0a0a0]">{wa.target_audience}</p>
                  </div>
                  <div>
                    <p className="text-[#555] mb-1">Value Proposition</p>
                    <p className="text-[#a0a0a0]">{wa.value_proposition}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0">
                <p className="text-xs text-[#555] mb-1">Online Presence</p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  wa.online_presence_quality === "strong" ? "text-green-400 bg-green-500/10 border-green-500/30" :
                  wa.online_presence_quality === "moderate" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" :
                  "text-red-400 bg-red-500/10 border-red-500/30"
                }`}>{wa.online_presence_quality}</span>
              </div>
            </div>
            {wa.key_services?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-[#555] mb-2">Key Services / Products</p>
                <div className="flex flex-wrap gap-1.5">
                  {wa.key_services.map((s: string, i: number) => <Tag key={i} color="purple">{s}</Tag>)}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {wa.messaging_strengths?.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-green-400 mb-2">✓ Messaging Strengths</p>
                  <ul className="space-y-1">
                    {wa.messaging_strengths.map((s: string, i: number) => (
                      <li key={i} className="text-xs text-[#a0a0a0] flex gap-2"><span className="text-green-400 shrink-0">+</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {wa.messaging_gaps?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-400 mb-2">✕ Messaging Gaps</p>
                  <ul className="space-y-1">
                    {wa.messaging_gaps.map((g: string, i: number) => (
                      <li key={i} className="text-xs text-[#a0a0a0] flex gap-2"><span className="text-red-400 shrink-0">−</span>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {wa.how_they_compare && (
              <div className="mt-3 bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3">
                <p className="text-xs text-[#555] mb-1">Market Positioning</p>
                <p className="text-xs text-[#c0c0c0]">{wa.how_they_compare}</p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* SWOT Analysis */}
      {swot && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">
            SWOT Analysis{wa?.company_name ? ` — ${wa.company_name}` : ""}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-green-500/5 border border-green-500/25 rounded-xl p-4">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3">💪 Strengths</p>
              <ul className="space-y-2">
                {(swot.strengths ?? []).map((s: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]"><span className="text-green-400 shrink-0 mt-0.5">✓</span>{s}</li>
                ))}
              </ul>
            </div>
            <div className="bg-orange-500/5 border border-orange-500/25 rounded-xl p-4">
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">⚠ Weaknesses</p>
              <ul className="space-y-2">
                {(swot.weaknesses ?? []).map((w: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]"><span className="text-orange-400 shrink-0 mt-0.5">✕</span>{w}</li>
                ))}
              </ul>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/25 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">🚀 Opportunities</p>
              <ul className="space-y-2">
                {(swot.opportunities ?? []).map((o: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]"><span className="text-blue-400 shrink-0 mt-0.5">→</span>{o}</li>
                ))}
              </ul>
            </div>
            <div className="bg-red-500/5 border border-red-500/25 rounded-xl p-4">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">⚡ Threats</p>
              <ul className="space-y-2">
                {(swot.threats ?? []).map((t: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]"><span className="text-red-400 shrink-0 mt-0.5">!</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Competitor Intelligence */}
      {competitor_profiles.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider">Competitor Intelligence</h3>
            <span className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full px-2.5 py-0.5">
              {competitor_profiles.length} competitors
            </span>
          </div>
          <p className="text-xs text-[#555] mb-4">Click "Full Report" to see founder details, needs, shortcomings, and your opportunity vs each competitor.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {competitor_profiles.map((c: any, i: number) => <CompetitorCard key={i} c={c} index={i} />)}
          </div>
        </div>
      )}

      {/* Pain / Desires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-red-500/60">
          <h3 className="text-sm font-semibold text-red-400 mb-3">Pain Points</h3>
          <ol className="space-y-2">
            {pain_points.map((p: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
                <span className="text-[#555] shrink-0 w-5">{i + 1}.</span>{p}
              </li>
            ))}
          </ol>
        </Card>
        <Card className="border-l-4 border-l-green-500/60">
          <h3 className="text-sm font-semibold text-green-400 mb-3">Desires & Aspirations</h3>
          <ol className="space-y-2">
            {desires.map((d: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0c0]">
                <span className="text-[#555] shrink-0 w-5">{i + 1}.</span>{d}
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
          <p className="text-xs text-[#555] mb-3">Everyone in your market says these. Differentiate by NOT using them.</p>
          <ul className="space-y-2">
            {common_messaging.map((m: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#a0a0a0] line-through decoration-yellow-400/40">
                <span className="no-underline text-yellow-400 shrink-0">⚠</span><span>{m}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-between pt-2 gap-4">
        <button
          onClick={() => downloadPDF(data, target)}
          className="flex items-center gap-2 text-sm bg-[#0a0a0a] text-[#a0a0a0] border border-[#1a1a1a] hover:text-white hover:border-[#333] px-5 py-2.5 rounded-xl transition-colors"
        >
          ↓ Download Full Report as PDF
        </button>
        <PrimaryButton onClick={onNext} disabled={loading}>
          {loading ? "Generating ICP..." : prefetching ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Pre-loading ICP...
            </span>
          ) : "Generate ICP & Personas →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
