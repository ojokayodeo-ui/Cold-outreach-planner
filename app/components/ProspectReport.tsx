"use client";
import { useState } from "react";
import { Card, CopyButton, Tag, PrimaryButton } from "./ui";

interface Props {
  sellerContext: string;
  geography: string;
  onClose: () => void;
}

function fitColor(score: number) {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  return "text-red-400";
}

function downloadReport(report: any) {
  const co = report.company ?? {};
  const intel = report.intelligence ?? {};
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Prospect Report — ${co.name ?? "Unknown"}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#000; color:#e0e0e0; margin:0; padding:40px; line-height:1.6; }
  h1 { color:#fff; font-size:24px; margin-bottom:4px; }
  h2 { color:#a0a0ff; font-size:14px; text-transform:uppercase; letter-spacing:.08em; margin:32px 0 12px; border-bottom:1px solid #1a1a1a; padding-bottom:6px; }
  h3 { color:#fff; font-size:15px; margin-bottom:4px; }
  .meta { color:#555; font-size:13px; margin-bottom:32px; }
  .card { background:#0a0a0a; border:1px solid #1a1a1a; border-radius:10px; padding:20px; margin-bottom:16px; }
  .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .tag { display:inline-block; background:#1a1a2e; color:#8080ff; border:1px solid #2a2a4a; border-radius:20px; padding:2px 10px; font-size:12px; margin:2px; }
  .green { color:#22c55e; } .red { color:#ef4444; } .yellow { color:#eab308; } .blue { color:#3b82f6; }
  .email-block { background:#080808; border:1px solid #1a1a1a; border-radius:8px; padding:16px; margin:8px 0; white-space:pre-wrap; font-family:monospace; font-size:13px; color:#d0d0d0; }
  .subject { font-weight:600; color:#fff; margin-bottom:8px; }
  .score { font-size:36px; font-weight:700; }
  ul { padding-left:18px; margin:8px 0; }
  li { margin:4px 0; font-size:14px; color:#c0c0c0; }
  a { color:#3b82f6; }
</style>
</head>
<body>
<h1>${co.name ?? "Unknown Company"}</h1>
<div class="meta">
  ${co.website ? `<a href="${co.website}">${co.website}</a> · ` : ""}
  ${co.industry ?? ""} ${co.sub_niche ? `/ ${co.sub_niche}` : ""} ·
  ${co.size ?? ""} · ${co.location ?? ""} · Founded ${co.founded ?? "Unknown"}
</div>

<h2>Company Overview</h2>
<div class="card">
  <p>${co.description ?? ""}</p>
  ${co.products_services?.length ? `<p><strong>Products / Services:</strong> ${co.products_services.join(", ")}</p>` : ""}
  ${co.target_customers ? `<p><strong>Their Customers:</strong> ${co.target_customers}</p>` : ""}
  ${co.growth_signals?.length ? `<p><strong>Growth Signals:</strong></p><ul>${co.growth_signals.map((s: string) => `<li>${s}</li>`).join("")}</ul>` : ""}
  ${co.recent_news?.length ? `<p><strong>Recent News:</strong></p><ul>${co.recent_news.map((n: string) => `<li>${n}</li>`).join("")}</ul>` : ""}
</div>

<h2>Fit Assessment</h2>
<div class="card">
  <div class="score ${fitColor(intel.fit_score)}">${intel.fit_score ?? "?"}/10</div>
  <p>${intel.fit_reasoning ?? ""}</p>
  ${intel.best_entry_point ? `<p><strong>Best Entry Point:</strong> ${intel.best_entry_point}</p>` : ""}
  ${intel.timing ? `<p><strong>Why Now:</strong> ${intel.timing}</p>` : ""}
</div>

<h2>Decision Makers</h2>
${(report.decision_makers ?? []).map((dm: any) => `
<div class="card">
  <h3>${dm.name ?? "Unknown"} — ${dm.title ?? ""}</h3>
  ${dm.linkedin && dm.linkedin !== "Unknown" ? `<a href="${dm.linkedin}">${dm.linkedin}</a><br/>` : ""}
  <p>${dm.why_target ?? ""}</p>
  ${dm.likely_pain ? `<p><em>Pain: ${dm.likely_pain}</em></p>` : ""}
</div>`).join("")}

<h2>Inferred Pain Points & Buying Signals</h2>
<div class="grid2">
  <div class="card">
    <strong class="red">Pain Points</strong>
    <ul>${(intel.inferred_pain_points ?? []).map((p: string) => `<li>${p}</li>`).join("")}</ul>
  </div>
  <div class="card">
    <strong class="green">Buying Signals</strong>
    <ul>${(intel.buying_signals ?? []).map((s: string) => `<li>${s}</li>`).join("")}</ul>
  </div>
</div>

<h2>Outreach Angles</h2>
${(report.outreach_angles ?? []).map((a: any) => `
<div class="card">
  <h3>${a.name}</h3>
  <p style="color:#aaa;font-style:italic">"${a.hook}"</p>
  <p>${a.why_it_works}</p>
</div>`).join("")}

<h2>Email Templates</h2>
${(report.email_templates ?? []).map((e: any) => `
<div class="card">
  <strong>${e.label}</strong>
  <div class="subject">Subject: ${e.subject}</div>
  <div class="email-block">${e.body}</div>
  ${e.best_for ? `<p style="color:#555;font-size:12px">${e.best_for}</p>` : ""}
</div>`).join("")}

<h2>LinkedIn Messages</h2>
<div class="card">
  <strong>Connection Request</strong>
  <div class="email-block">${report.linkedin_messages?.connection_request ?? ""}</div>
  <strong>Follow-up DM</strong>
  <div class="email-block">${report.linkedin_messages?.follow_up_dm ?? ""}</div>
</div>

<h2>Talk Track</h2>
<div class="card">
  <strong>Opener:</strong><p>${report.talk_track?.opener ?? ""}</p>
  <strong>Key Discovery Questions:</strong>
  <ul>${(report.talk_track?.key_questions ?? []).map((q: string) => `<li>${q}</li>`).join("")}</ul>
  <strong>Value Statement:</strong><p>${report.talk_track?.value_statement ?? ""}</p>
</div>

<p style="color:#333;font-size:11px;margin-top:40px">Generated by Cold Outreach Intelligence · ${new Date().toLocaleDateString()}</p>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `prospect-report-${(co.name ?? "unknown").toLowerCase().replace(/\s+/g, "-")}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function ProspectReport({ sellerContext, geography, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [context, setContext] = useState(sellerContext ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any>(null);

  async function generate() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/prospect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), context, geography }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate report");
      setReport(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const co = report?.company ?? {};
  const intel = report?.intelligence ?? {};

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4">
      <div className="w-full max-w-4xl bg-[#000] border border-[#1a1a1a] rounded-2xl shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a1a]">
          <div>
            <h2 className="text-base font-semibold text-white">Prospect Research Report</h2>
            <p className="text-xs text-[#555] mt-0.5">Enter any company's website to get a personalised outreach report</p>
          </div>
          <button onClick={onClose} className="text-[#555] hover:text-white text-xl leading-none px-2">✕</button>
        </div>

        {/* Input form */}
        {!report && (
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-[#555] block mb-1.5">Company Website URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !loading && generate()}
                placeholder="https://acmecorp.com"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-[#555] block mb-1.5">What you sell <span className="text-[#333]">(helps personalise the report)</span></label>
              <input
                type="text"
                value={context}
                onChange={e => setContext(e.target.value)}
                placeholder="e.g. Done-for-you cold email outreach that books discovery calls"
                className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <PrimaryButton onClick={generate} disabled={loading || !url.trim()} className="w-full">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Researching prospect...
                </span>
              ) : "Generate Prospect Report →"}
            </PrimaryButton>

            {loading && (
              <p className="text-xs text-[#555] text-center">
                Scraping website · searching web · pulling LinkedIn data · generating report...
              </p>
            )}
          </div>
        )}

        {/* Report */}
        {report && (
          <div className="p-6 space-y-6 animate-fade-in">

            {/* Company header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{co.name ?? "Unknown Company"}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {co.industry && <Tag color="blue">{co.industry}</Tag>}
                  {co.sub_niche && <Tag color="purple">{co.sub_niche}</Tag>}
                  {co.size && <span className="text-xs text-[#555]">{co.size}</span>}
                  {co.location && <span className="text-xs text-[#555]">· {co.location}</span>}
                  {co.founded && co.founded !== "Unknown" && <span className="text-xs text-[#555]">· Est. {co.founded}</span>}
                </div>
                {report._meta?.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {report._meta.sources.map((s: string, i: number) => (
                      <span key={i} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2 py-0.5">{s}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => downloadReport(report)}
                  className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg px-4 py-2 transition-colors"
                >
                  ↓ Download Report
                </button>
                <button
                  onClick={() => { setReport(null); setUrl(""); }}
                  className="text-xs text-[#555] hover:text-white border border-[#1a1a1a] rounded-lg px-3 py-2 transition-colors"
                >
                  New Prospect
                </button>
              </div>
            </div>

            {/* Company description */}
            {co.description && (
              <Card>
                <p className="text-sm text-[#c0c0c0] leading-relaxed mb-3">{co.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {co.products_services?.length > 0 && (
                    <div>
                      <p className="text-[#555] mb-1">Products / Services</p>
                      <div className="flex flex-wrap gap-1">
                        {co.products_services.map((p: string, i: number) => <Tag key={i} color="blue">{p}</Tag>)}
                      </div>
                    </div>
                  )}
                  {co.target_customers && (
                    <div>
                      <p className="text-[#555] mb-1">Their Customers</p>
                      <p className="text-[#a0a0a0]">{co.target_customers}</p>
                    </div>
                  )}
                </div>
                {co.growth_signals?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-[#555] mb-1">Growth Signals</p>
                    <div className="flex flex-wrap gap-1">
                      {co.growth_signals.map((s: string, i: number) => (
                        <span key={i} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-2.5 py-0.5">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {co.recent_news?.filter((n: string) => n && n !== "Unknown").length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-[#555] mb-1">Recent News</p>
                    <ul className="space-y-1">
                      {co.recent_news.filter((n: string) => n && n !== "Unknown").map((n: string, i: number) => (
                        <li key={i} className="text-xs text-[#a0a0a0] flex gap-2"><span className="text-blue-400">·</span>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </Card>
            )}

            {/* Fit score + intelligence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-green-500/40">
                <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Prospect Fit Score</p>
                <div className={`text-4xl font-bold mb-2 ${fitColor(intel.fit_score ?? 0)}`}>
                  {intel.fit_score ?? "?"}<span className="text-lg text-[#333]">/10</span>
                </div>
                <p className="text-xs text-[#a0a0a0] leading-relaxed">{intel.fit_reasoning}</p>
              </Card>
              <Card>
                <p className="text-xs text-[#555] uppercase tracking-wider mb-2">Entry Point & Timing</p>
                {intel.best_entry_point && (
                  <p className="text-xs text-[#d0d0d0] mb-2"><span className="text-blue-400">→</span> {intel.best_entry_point}</p>
                )}
                {intel.timing && (
                  <p className="text-xs text-[#a0a0a0]"><span className="text-green-400">⏱</span> {intel.timing}</p>
                )}
              </Card>
            </div>

            {/* Decision makers */}
            {report.decision_makers?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Decision Makers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {report.decision_makers.map((dm: any, i: number) => (
                    <Card key={i} className="border-l-4 border-l-blue-500/40">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-white text-sm">{dm.name !== "Unknown" ? dm.name : "Contact"}</p>
                          <p className="text-xs text-[#555]">{dm.title}</p>
                        </div>
                        {dm.linkedin && dm.linkedin !== "Unknown" && (
                          <a href={dm.linkedin} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-2.5 py-1 hover:bg-blue-500/20 transition-colors shrink-0">
                            in LinkedIn
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-[#a0a0a0] mb-2">{dm.why_target}</p>
                      {dm.likely_pain && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
                          <p className="text-xs text-red-300">{dm.likely_pain}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pain points + buying signals */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intel.inferred_pain_points?.length > 0 && (
                <Card className="border-l-4 border-l-red-500/40">
                  <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">Inferred Pain Points</p>
                  <ul className="space-y-2">
                    {intel.inferred_pain_points.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]">
                        <span className="text-red-400 mt-0.5 shrink-0">✕</span>{p}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {intel.buying_signals?.length > 0 && (
                <Card className="border-l-4 border-l-green-500/40">
                  <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3">Buying Signals</p>
                  <ul className="space-y-2">
                    {intel.buying_signals.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs text-[#c0c0c0]">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>

            {/* Outreach angles */}
            {report.outreach_angles?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Personalised Outreach Angles</h4>
                <div className="space-y-3">
                  {report.outreach_angles.map((a: any, i: number) => (
                    <Card key={i}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-[#555] bg-[#0a0a0a] border border-[#1a1a1a] rounded-full w-5 h-5 flex items-center justify-center shrink-0">{i + 1}</span>
                        <p className="font-semibold text-white text-sm">{a.name}</p>
                        {a.type && <Tag color="purple">{a.type}</Tag>}
                      </div>
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 mb-2 flex items-start justify-between gap-2">
                        <p className="text-sm text-[#d0d0d0] italic flex-1">"{a.hook}"</p>
                        <CopyButton text={a.hook} />
                      </div>
                      <p className="text-xs text-[#555]">{a.why_it_works}</p>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Email templates */}
            {report.email_templates?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">Email Templates</h4>
                <div className="space-y-4">
                  {report.email_templates.map((e: any, i: number) => (
                    <Card key={i}>
                      <div className="flex items-center justify-between mb-3">
                        <Tag color="blue">{e.label}</Tag>
                        {e.best_for && <span className="text-xs text-[#444]">{e.best_for}</span>}
                      </div>
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-2 mb-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-[#555]">Subject: <span className="text-white">{e.subject}</span></p>
                        <CopyButton text={e.subject} />
                      </div>
                      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-4 py-3 flex items-start justify-between gap-3">
                        <p className="text-sm text-[#c0c0c0] whitespace-pre-line flex-1 leading-relaxed">{e.body}</p>
                        <CopyButton text={e.body} />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* LinkedIn messages */}
            {report.linkedin_messages && (
              <div>
                <h4 className="text-xs font-semibold text-[#555] uppercase tracking-wider mb-3">LinkedIn Messages</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <p className="text-xs text-blue-400 font-semibold mb-2">Connection Request</p>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-3 flex items-start justify-between gap-2">
                      <p className="text-sm text-[#c0c0c0] italic flex-1 leading-relaxed">"{report.linkedin_messages.connection_request}"</p>
                      <CopyButton text={report.linkedin_messages.connection_request} />
                    </div>
                  </Card>
                  <Card>
                    <p className="text-xs text-blue-400 font-semibold mb-2">Follow-up DM</p>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-3 flex items-start justify-between gap-2">
                      <p className="text-sm text-[#c0c0c0] italic flex-1 leading-relaxed">"{report.linkedin_messages.follow_up_dm}"</p>
                      <CopyButton text={report.linkedin_messages.follow_up_dm} />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Talk track */}
            {report.talk_track && (
              <Card className="border-l-4 border-l-orange-500/40">
                <h4 className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-3">Cold Call Talk Track</h4>
                {report.talk_track.opener && (
                  <div className="mb-3">
                    <p className="text-xs text-[#555] mb-1">Opener</p>
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2 flex justify-between gap-2">
                      <p className="text-sm text-[#d0d0d0] italic flex-1">"{report.talk_track.opener}"</p>
                      <CopyButton text={report.talk_track.opener} />
                    </div>
                  </div>
                )}
                {report.talk_track.key_questions?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-[#555] mb-2">Key Discovery Questions</p>
                    <ul className="space-y-2">
                      {report.talk_track.key_questions.map((q: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[#c0c0c0]">
                          <span className="text-orange-400 mt-0.5 shrink-0">Q{i + 1}.</span>{q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {report.talk_track.value_statement && (
                  <div>
                    <p className="text-xs text-[#555] mb-1">Value Statement</p>
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 flex justify-between gap-2">
                      <p className="text-sm text-green-300 flex-1">"{report.talk_track.value_statement}"</p>
                      <CopyButton text={report.talk_track.value_statement} />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Download CTA */}
            <div className="flex gap-3 pt-2 border-t border-[#1a1a1a]">
              <button
                onClick={() => downloadReport(report)}
                className="flex-1 py-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-sm font-medium"
              >
                ↓ Download Full Report as HTML
              </button>
              <button
                onClick={() => { setReport(null); setUrl(""); }}
                className="px-6 py-3 rounded-xl text-[#555] border border-[#1a1a1a] hover:text-white hover:border-[#333] transition-colors text-sm"
              >
                Research Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
