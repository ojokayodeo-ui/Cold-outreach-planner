"use client";
import { useState } from "react";
import { Card, CopyButton, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props {
  data: any;
  personas: any[];
  angles: any[];
  offers: any[];
  selectedPersona: number;
  selectedAngle: number;
  selectedOffer: number;
  onSelectPersona: (i: number) => void;
  onSelectAngle: (i: number) => void;
  onSelectOffer: (i: number) => void;
  onRegenerate: () => void;
  onReset: () => void;
  loading: boolean;
  research?: any;
  icpData?: any;
  strategy?: any;
  input?: any;
  companyName?: string;
}

// ── Full report PDF ───────────────────────────────────────────────────────────
function buildFullPDF({
  data, research, icpData, strategy, input, companyName,
  selectedPersona, selectedAngle, selectedOffer, personas, angles, offers,
}: any) {
  const mo = research?.market_overview ?? {};
  const wa = research?.website_analysis ?? null;
  const sw = research?.swot ?? null;
  const cp = research?.competitor_profiles ?? [];
  const reportTitle = companyName || wa?.company_name || input?.target || "Campaign Report";
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  const ul = (items: string[], bullet = "•", color = "#555") =>
    `<ul>${(items ?? []).map((i: string) => `<li><span style="color:${color}">${bullet}</span> ${i}</li>`).join("")}</ul>`;

  const box = (label: string, value: string, bg = "#f9f9f9") =>
    `<div style="background:${bg};border:1px solid #e5e5e5;border-radius:6px;padding:10px 14px;flex:1;min-width:120px">
      <div style="font-size:11px;color:#888;margin-bottom:3px">${label}</div>
      <div style="font-size:14px;font-weight:600;color:#111">${value}</div>
    </div>`;

  const sectionHead = (title: string, color = "#1d4ed8") =>
    `<h2 style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:${color};border-bottom:2px solid ${color}22;padding-bottom:6px;margin:32px 0 14px">${title}</h2>`;

  const emailHtml = (data?.cold_email_sequence ?? []).map((e: any, i: number) => `
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:16px;margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <span style="font-weight:700;color:#111">${e.label ?? `Email ${i+1}`}</span>
        <span style="font-size:11px;background:#eff6ff;color:#1d4ed8;border-radius:20px;padding:2px 10px">${e.timing}</span>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:10px 14px;margin-bottom:8px">
        <div style="font-size:10px;color:#888;margin-bottom:3px;text-transform:uppercase">Subject</div>
        <div style="font-weight:600;color:#111">${e.subject}</div>
      </div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:10px 14px">
        <div style="font-size:10px;color:#888;margin-bottom:6px;text-transform:uppercase">Body</div>
        <div style="font-size:13px;color:#333;white-space:pre-line;line-height:1.7">${e.body}</div>
      </div>
    </div>`).join("");

  const personaHtml = (icpData?.personas ?? []).map((p: any, i: number) => `
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-left:4px solid #7c3aed;border-radius:8px;padding:16px;margin-bottom:12px">
      <div style="font-weight:700;font-size:15px;color:#111;margin-bottom:2px">${p.name} — ${p.title}</div>
      <div style="font-size:12px;color:#666;margin-bottom:10px">${p.company_stage ?? ""}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px">
        <div><strong style="color:#dc2626">Pain Points</strong>${ul(p.pain_points ?? [], "✕", "#dc2626")}</div>
        <div><strong style="color:#16a34a">Desires</strong>${ul(p.desires ?? [], "✓", "#16a34a")}</div>
        <div><strong style="color:#7c3aed">Objections</strong>${ul(p.objections ?? [], "✗", "#7c3aed")}</div>
        <div><strong style="color:#ea580c">Watering Holes</strong>${ul(p.watering_holes ?? [], "→", "#ea580c")}</div>
      </div>
      ${p.quote ? `<div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:10px;margin-top:10px;font-style:italic;color:#555">"${p.quote}"</div>` : ""}
    </div>`).join("");

  const anglesHtml = (strategy?.angles ?? []).slice(0, 5).map((a: any, i: number) => `
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px">
        <strong style="color:#111">${a.name}</strong>
        <span style="font-size:11px;background:#eff6ff;color:#1d4ed8;border-radius:20px;padding:2px 8px">${a.type} · ${a.effectiveness_score}/10</span>
      </div>
      <div style="font-size:12px;color:#666;margin-bottom:6px">${a.description}</div>
      <div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:8px 12px;font-style:italic;color:#333;font-size:12px">"${a.sample_hook}"</div>
    </div>`).join("");

  const competitorHtml = cp.slice(0, 5).map((c: any, i: number) => `
    <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-left:4px solid #7c3aed;border-radius:8px;padding:14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
        <strong style="color:#111">${c.name}</strong>
        <span style="font-size:11px;color:#888">${c.years_in_business ?? ""}</span>
      </div>
      <div style="font-size:12px;color:#555;margin-bottom:8px">${c.usp ?? ""}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:11px">
        <div><strong>Core Offer:</strong> ${c.core_offer ?? ""}</div>
        <div><strong>Pricing:</strong> ${c.pricing_model ?? "Unknown"}</div>
        ${c.owner_name && c.owner_name !== "Unknown" ? `<div><strong>Owner:</strong> ${c.owner_name}</div>` : ""}
      </div>
      ${c.differentiator_opportunity ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:8px 12px;margin-top:8px;font-size:11px"><strong style="color:#15803d">Your opportunity: </strong><span style="color:#166534">${c.differentiator_opportunity}</span></div>` : ""}
    </div>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Cold Outreach Intelligence Report — ${reportTitle}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a1a; padding: 40px; font-size: 13px; line-height: 1.6; }
  ul { list-style: none; padding: 0; }
  li { padding: 3px 0; display: flex; gap: 6px; align-items: flex-start; }
  a { color: #1d4ed8; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 8px; }
  .swot-cell { border-radius: 8px; padding: 14px; }
  .no-print { background:#1d4ed8;color:#fff;padding:12px 20px;border-radius:8px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between; }
  @media print {
    .no-print { display: none !important; }
    body { padding: 20px; }
    h2 { page-break-after: avoid; }
  }
</style>
</head>
<body>

<div class="no-print">
  <span><strong>Save as PDF:</strong> Press Ctrl+P (or Cmd+P on Mac) → choose "Save as PDF"</span>
  <button onclick="window.print()" style="background:#fff;color:#1d4ed8;border:none;padding:8px 18px;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px">🖨 Print / Save as PDF</button>
</div>

<!-- Cover -->
<div style="background:#0a0a0a;color:#fff;border-radius:12px;padding:32px;margin-bottom:36px">
  <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.1em;margin-bottom:8px">Cold Outreach Intelligence Report</div>
  <div style="font-size:28px;font-weight:700;margin-bottom:6px">${reportTitle}</div>
  ${wa?.tagline ? `<div style="font-size:14px;color:#aaa;margin-bottom:16px">${wa.tagline}</div>` : ""}
  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:16px">
    ${input?.target ? `<div style="background:#1a1a1a;border-radius:8px;padding:8px 16px"><div style="font-size:10px;color:#666;margin-bottom:2px">Target Market</div><div style="font-size:13px;color:#fff">${input.target}</div></div>` : ""}
    ${mo.size ? `<div style="background:#1a1a1a;border-radius:8px;padding:8px 16px"><div style="font-size:10px;color:#666;margin-bottom:2px">Market Size</div><div style="font-size:13px;color:#fff">${mo.size}</div></div>` : ""}
    ${mo.growth_rate ? `<div style="background:#1a1a1a;border-radius:8px;padding:8px 16px"><div style="font-size:10px;color:#666;margin-bottom:2px">Growth Rate</div><div style="font-size:13px;color:#22c55e">${mo.growth_rate}</div></div>` : ""}
    ${wa?.online_presence_quality ? `<div style="background:#1a1a1a;border-radius:8px;padding:8px 16px"><div style="font-size:10px;color:#666;margin-bottom:2px">Online Presence</div><div style="font-size:13px;color:#fff">${wa.online_presence_quality}</div></div>` : ""}
  </div>
  <div style="font-size:11px;color:#555;margin-top:20px">Generated ${date} · Cold Outreach Intelligence</div>
</div>

<!-- Market Overview -->
${sectionHead("1. Market Overview", "#1d4ed8")}
<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
  ${box("Market Size", mo.size ?? "—")}
  ${box("Growth Rate", mo.growth_rate ?? "—", "#f0fdf4")}
  ${box("Maturity", mo.maturity ?? "—")}
</div>
<div style="margin-bottom:8px">${(mo.key_trends ?? []).map((t: string) => `<span style="background:#eff6ff;color:#1d4ed8;border-radius:20px;padding:2px 10px;font-size:11px;margin:2px;display:inline-block">${t}</span>`).join("")}</div>

${wa ? `
${sectionHead("2. Website & Marketing Analysis — " + (wa.company_name ?? ""), "#7c3aed")}
<div style="background:#f9f9f9;border:1px solid #e5e5e5;border-left:4px solid #7c3aed;border-radius:8px;padding:16px;margin-bottom:14px">
  <div style="font-size:16px;font-weight:700;color:#111;margin-bottom:4px">${wa.company_name ?? ""}</div>
  ${wa.tagline ? `<div style="font-style:italic;color:#888;margin-bottom:8px">"${wa.tagline}"</div>` : ""}
  <p style="color:#444;margin-bottom:12px">${wa.what_they_do ?? ""}</p>
  <div class="grid2">
    <div><strong style="font-size:11px;color:#888;text-transform:uppercase">Target Audience</strong><p style="color:#555;font-size:12px;margin-top:3px">${wa.target_audience ?? ""}</p></div>
    <div><strong style="font-size:11px;color:#888;text-transform:uppercase">Value Proposition</strong><p style="color:#555;font-size:12px;margin-top:3px">${wa.value_proposition ?? ""}</p></div>
  </div>
  ${wa.key_services?.length ? `<div style="margin-top:10px">${wa.key_services.map((s: string) => `<span style="background:#f3e8ff;color:#7c3aed;border-radius:20px;padding:2px 10px;font-size:11px;margin:2px;display:inline-block">${s}</span>`).join("")}</div>` : ""}
</div>
<div class="grid2" style="margin-bottom:14px">
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px">
    <strong style="color:#15803d;font-size:11px;text-transform:uppercase">✓ Messaging Strengths</strong>
    ${ul(wa.messaging_strengths ?? [], "✓", "#15803d")}
  </div>
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px">
    <strong style="color:#dc2626;font-size:11px;text-transform:uppercase">✕ Messaging Gaps</strong>
    ${ul(wa.messaging_gaps ?? [], "✕", "#dc2626")}
  </div>
</div>
${wa.how_they_compare ? `<div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:12px 16px"><strong>Market Positioning: </strong><span style="color:#555">${wa.how_they_compare}</span></div>` : ""}
` : ""}

${sw ? `
${sectionHead("3. SWOT Analysis" + (wa?.company_name ? " — " + wa.company_name : ""), "#0a0a0a")}
<div class="swot-grid">
  <div class="swot-cell" style="background:#f0fdf4;border:1px solid #bbf7d0">
    <strong style="color:#15803d;font-size:11px;text-transform:uppercase;display:block;margin-bottom:8px">💪 Strengths</strong>
    ${ul(sw.strengths ?? [], "✓", "#15803d")}
  </div>
  <div class="swot-cell" style="background:#fff7ed;border:1px solid #fed7aa">
    <strong style="color:#c2410c;font-size:11px;text-transform:uppercase;display:block;margin-bottom:8px">⚠ Weaknesses</strong>
    ${ul(sw.weaknesses ?? [], "✕", "#c2410c")}
  </div>
  <div class="swot-cell" style="background:#eff6ff;border:1px solid #bfdbfe">
    <strong style="color:#1d4ed8;font-size:11px;text-transform:uppercase;display:block;margin-bottom:8px">🚀 Opportunities</strong>
    ${ul(sw.opportunities ?? [], "→", "#1d4ed8")}
  </div>
  <div class="swot-cell" style="background:#fef2f2;border:1px solid #fecaca">
    <strong style="color:#dc2626;font-size:11px;text-transform:uppercase;display:block;margin-bottom:8px">⚡ Threats</strong>
    ${ul(sw.threats ?? [], "!", "#dc2626")}
  </div>
</div>
` : ""}

${sectionHead((wa ? "4" : "2") + ". Buyer Intelligence", "#ea580c")}
<div class="grid2" style="margin-bottom:14px">
  <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px">
    <strong style="color:#dc2626;font-size:11px;text-transform:uppercase">Pain Points</strong>
    ${ul(research?.pain_points ?? [], "✕", "#dc2626")}
  </div>
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px">
    <strong style="color:#15803d;font-size:11px;text-transform:uppercase">Desires</strong>
    ${ul(research?.desires ?? [], "✓", "#15803d")}
  </div>
</div>
<div class="grid2">
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px">
    <strong style="color:#c2410c;font-size:11px;text-transform:uppercase">Buying Triggers</strong>
    ${ul(research?.buying_triggers ?? [], "→", "#ea580c")}
  </div>
  <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:14px">
    <strong style="color:#7c3aed;font-size:11px;text-transform:uppercase">Objections</strong>
    ${ul(research?.objections ?? [], "✗", "#7c3aed")}
  </div>
</div>

${cp.length ? `
${sectionHead((wa ? "5" : "3") + ". Competitor Intelligence (Top 5 of " + cp.length + ")", "#7c3aed")}
${competitorHtml}
` : ""}

${sectionHead((wa ? "6" : "4") + ". Buyer Personas", "#7c3aed")}
${personaHtml}

${sectionHead((wa ? "7" : "5") + ". Campaign Strategy", "#ea580c")}
<div style="margin-bottom:16px">
  <strong style="font-size:12px;color:#555;display:block;margin-bottom:8px">Top Outreach Angles</strong>
  ${anglesHtml}
</div>
${(strategy?.offers ?? []).length ? `
<div style="margin-bottom:16px">
  <strong style="font-size:12px;color:#555;display:block;margin-bottom:8px">Offers</strong>
  <div class="grid2">
    ${(strategy.offers ?? []).map((o: any) => `
      <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:12px">
        <strong style="color:#111">${o.name}</strong>
        <div style="font-size:11px;color:#888;margin:3px 0">${o.type} · ${o.friction_level} friction · ${o.expected_conversion}</div>
        <div style="font-size:12px;color:#555">${o.description}</div>
        ${o.cta ? `<div style="background:#fff;border:1px solid #e5e5e5;border-radius:6px;padding:8px;margin-top:8px;font-style:italic;font-size:12px;color:#1d4ed8">"${o.cta}"</div>` : ""}
      </div>`).join("")}
  </div>
</div>` : ""}

${sectionHead((wa ? "8" : "6") + ". Outreach Sequence", "#16a34a")}
<div style="margin-bottom:14px">
  <div style="font-size:12px;color:#555;margin-bottom:10px">
    <strong>Persona:</strong> ${personas[selectedPersona]?.title ?? ""} &nbsp;·&nbsp;
    <strong>Angle:</strong> ${angles[selectedAngle]?.name ?? ""} &nbsp;·&nbsp;
    <strong>Offer:</strong> ${offers[selectedOffer]?.name ?? ""}
  </div>
  ${emailHtml}
</div>

${data?.linkedin_connection_note || data?.linkedin_follow_up ? `
<strong style="font-size:12px;color:#555;display:block;margin-bottom:10px">LinkedIn Messages</strong>
<div class="grid2">
  ${data?.linkedin_connection_note ? `
  <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:14px">
    <strong style="font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:6px">Connection Request</strong>
    <div style="font-style:italic;color:#333">"${data.linkedin_connection_note}"</div>
  </div>` : ""}
  ${data?.linkedin_follow_up ? `
  <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:14px">
    <strong style="font-size:11px;color:#888;text-transform:uppercase;display:block;margin-bottom:6px">Follow-up DM</strong>
    <div style="font-style:italic;color:#333">"${data.linkedin_follow_up}"</div>
  </div>` : ""}
</div>
` : ""}

${data?.personalization_hooks?.length ? `
<strong style="font-size:12px;color:#555;display:block;margin:16px 0 10px">Personalization Hooks</strong>
${(data.personalization_hooks ?? []).map((h: any) => `
  <div style="background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:12px;margin-bottom:8px;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;font-size:12px">
    <div><strong style="color:#888;font-size:10px;text-transform:uppercase">Trigger</strong><p style="color:#333;margin-top:3px">${h.trigger}</p></div>
    <div><strong style="color:#888;font-size:10px;text-transform:uppercase">Hook</strong><p style="color:#333;margin-top:3px">${h.hook}</p></div>
    <div><strong style="color:#888;font-size:10px;text-transform:uppercase">Example</strong><p style="color:#1d4ed8;font-style:italic;margin-top:3px">"${h.example}"</p></div>
  </div>`).join("")}
` : ""}

<div style="text-align:center;color:#bbb;font-size:11px;margin-top:48px;padding-top:20px;border-top:1px solid #eee">
  Cold Outreach Intelligence Report · ${reportTitle} · ${date}
</div>

</body></html>`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StepMessages({
  data, personas, angles, offers,
  selectedPersona, selectedAngle, selectedOffer,
  onSelectPersona, onSelectAngle, onSelectOffer,
  onRegenerate, onReset, loading,
  research, icpData, strategy, input, companyName,
}: Props) {
  const [activeEmail, setActiveEmail] = useState(0);
  if (!data) return null;

  const {
    cold_email_sequence = [],
    linkedin_connection_note = "",
    linkedin_follow_up = "",
    personalization_hooks = [],
    objection_handling = [],
  } = data;

  const email = cold_email_sequence[activeEmail];
  const reportName = companyName || research?.website_analysis?.company_name || input?.target || "Report";

  function handleDownloadPDF() {
    const html = buildFullPDF({
      data, research, icpData, strategy, input, companyName,
      selectedPersona, selectedAngle, selectedOffer, personas, angles, offers,
    });
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <SectionHeader
          title="Outreach Sequences"
          subtitle={`${personas[selectedPersona]?.title ?? ""} · ${angles[selectedAngle]?.name ?? ""} angle`}
        />
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl px-5 py-2 transition-colors font-medium shrink-0"
        >
          ↓ Download Full Report PDF
        </button>
      </div>

      {/* Selectors + Regenerate */}
      <Card className="border-[#1a1a1a]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-[#555] block mb-1">Persona</label>
            <select value={selectedPersona} onChange={e => onSelectPersona(+e.target.value)}
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
              {personas.map((p: any, i: number) => <option key={i} value={i}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#555] block mb-1">Angle</label>
            <select value={selectedAngle} onChange={e => onSelectAngle(+e.target.value)}
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
              {angles.map((a: any, i: number) => <option key={i} value={i}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#555] block mb-1">Offer</label>
            <select value={selectedOffer} onChange={e => onSelectOffer(+e.target.value)}
              className="w-full bg-[#000] border border-[#1a1a1a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
              {offers.map((o: any, i: number) => <option key={i} value={i}>{o.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={onRegenerate} disabled={loading}
          className="w-full py-2 border border-[#1a1a1a] rounded-lg text-sm text-[#555] hover:text-white hover:border-[#333] disabled:opacity-40 transition-colors">
          {loading ? "Regenerating..." : "↺ Regenerate with new selections"}
        </button>
      </Card>

      {/* Email Sequence */}
      {cold_email_sequence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">Cold Email Sequence</h3>
          <div className="flex gap-1 mb-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-1 overflow-x-auto">
            {cold_email_sequence.map((e: any, i: number) => (
              <button key={i} onClick={() => setActiveEmail(i)}
                className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeEmail === i ? "bg-blue-500 text-white" : "text-[#555] hover:text-white"
                }`}>
                {e.label ?? `Email ${i + 1}`}
              </button>
            ))}
          </div>

          {email && (
            <Card className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-[#0a0a0a] border border-[#1a1a1a] rounded-full px-2 py-0.5 text-[#555]">{email.timing}</span>
                <span className="text-xs text-[#444]">{email.purpose}</span>
              </div>
              {email.psychological_trigger && (
                <div className="flex items-center gap-2 mt-2 mb-4">
                  <span className="text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5">
                    ⚡ {email.psychological_trigger}
                  </span>
                  {email.framework && (
                    <span className="text-xs text-[#4a4a70] italic">{email.framework}</span>
                  )}
                </div>
              )}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#555]">Subject Line</span>
                  <CopyButton text={email.subject} />
                </div>
                <p className="text-sm font-medium text-white">{email.subject}</p>
              </div>
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#555]">Email Body</span>
                  <CopyButton text={email.body} label="Copy Email" />
                </div>
                <pre className="text-sm text-[#c0c0c0] whitespace-pre-wrap font-sans leading-relaxed">{email.body}</pre>
              </div>
              <div className="mt-3 flex justify-end">
                <CopyButton text={`Subject: ${email.subject}\n\n${email.body}`} label="Copy Full Email" />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* LinkedIn */}
      <div>
        <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">LinkedIn Outreach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedin_connection_note && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Connection Request Note</p>
                <CopyButton text={linkedin_connection_note} />
              </div>
              <p className="text-xs text-[#555] mb-2">Under 300 characters — no hard sell</p>
              <p className="text-sm text-[#c0c0c0]">{linkedin_connection_note}</p>
              <p className="text-xs text-[#333] mt-2">{linkedin_connection_note.length} / 300 chars</p>
            </Card>
          )}
          {linkedin_follow_up && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">Follow-up Message</p>
                <CopyButton text={linkedin_follow_up} />
              </div>
              <p className="text-xs text-[#555] mb-2">After connection accepted</p>
              <p className="text-sm text-[#c0c0c0]">{linkedin_follow_up}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Objection Handling */}
      {data.objection_handling?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Objection Handling Scripts</h3>
          <div className="space-y-3">
            {data.objection_handling.map((o: any, i: number) => (
              <div key={i} className="bg-[#0d0d1a] border border-[#2a2a45] rounded-xl p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-semibold text-red-300">"{o.objection}"</p>
                  {o.psychological_reason && (
                    <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full px-2 py-0.5 shrink-0 whitespace-nowrap">
                      {o.psychological_reason}
                    </span>
                  )}
                </div>
                {o.response && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 flex items-start justify-between gap-2">
                    <p className="text-xs text-green-300 flex-1">{o.response}</p>
                    <CopyButton text={o.response} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Personalization Hooks */}
      {personalization_hooks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0a0] uppercase tracking-wider mb-3">Personalization Hooks</h3>
          <div className="space-y-3">
            {personalization_hooks.map((h: any, i: number) => (
              <Card key={i}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#555] mb-1">Look for</p>
                    <p className="text-[#c0c0c0]">{h.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#555] mb-1">Use it as</p>
                    {h.psychological_angle && (
                      <span className="inline-block text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full px-2 py-0.5 mb-2">
                        {h.psychological_angle}
                      </span>
                    )}
                    <p className="text-[#c0c0c0]">{h.hook}</p>
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#555] mb-1">Example opener</p>
                        <p className="text-[#a0a0a0] italic text-xs">"{h.example}"</p>
                      </div>
                      <CopyButton text={h.example} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1a1a1a] gap-4 flex-wrap">
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm font-medium"
        >
          ↓ Download Full Report as PDF
        </button>
        <div className="flex items-center gap-3">
          <p className="text-xs text-[#333]">{cold_email_sequence.length} emails · {personalization_hooks.length} hooks</p>
          <button onClick={onReset}
            className="px-4 py-2 rounded-lg border border-[#1a1a1a] text-sm text-[#555] hover:text-white hover:border-[#333] transition-colors">
            ← New Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
