"use client";
import { useState } from "react";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const SCOPE = "https://www.googleapis.com/auth/drive.file";

interface Props {
  input: { target: string; context: string; geography: string };
  research: any;
  icpData: any;
  strategy: any;
  messages: any;
  selectedPersona: number;
  selectedAngle: number;
  selectedOffer: number;
}

// ── Load Google Identity Services dynamically ─────────────────────────────────

function loadGIS(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://accounts.google.com/gsi/client";
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

function getGoogleToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!CLIENT_ID) { reject(new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set")); return; }
    loadGIS().then(() => {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: (resp: any) => {
          if (resp.error) reject(new Error(resp.error_description ?? resp.error));
          else resolve(resp.access_token);
        },
      });
      client.requestAccessToken({ prompt: "consent" });
    });
  });
}

// ── Upload to Drive as Google Doc ─────────────────────────────────────────────

async function uploadToDrive(token: string, name: string, html: string): Promise<string> {
  const boundary = "gdoc_" + Math.random().toString(36).slice(2);
  const body = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    JSON.stringify({ name, mimeType: "application/vnd.google-apps.document" }),
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
    `--${boundary}--`,
  ].join("\r\n");

  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Drive API error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return `https://docs.google.com/document/d/${data.id}/edit`;
}

// ── HTML report builder ───────────────────────────────────────────────────────

function buildHtml(p: Props): string {
  const { input, research, icpData, strategy, messages, selectedPersona, selectedAngle, selectedOffer } = p;
  const persona = icpData?.personas?.[selectedPersona];
  const angle = strategy?.angles?.[selectedAngle];
  const offer = strategy?.offers?.[selectedOffer];
  const date = new Date().toLocaleString();

  const list = (arr: any[]) => arr?.map(i => `<li>${i}</li>`).join("") ?? "";
  const badge = (t: string) => `<span style="background:#e8eaff;padding:2px 10px;border-radius:12px;font-size:13px;margin:2px;display:inline-block">${t}</span>`;

  const competitorRows = (research?.competitors ?? []).map((c: any) => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.positioning ?? ""}</td>
      <td>${(c.strengths ?? []).join(", ")}</td>
      <td>${(c.weaknesses ?? []).join(", ")}</td>
    </tr>`).join("");

  const personaCards = (icpData?.personas ?? []).map((per: any, i: number) => `
    <div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;${i === selectedPersona ? "border-color:#4f8ef7;background:#f5f7ff" : ""}">
      <h4 style="margin:0 0 8px">${per.title ?? ""}${i === selectedPersona ? " ★ Selected" : ""}</h4>
      <p><strong>Pain:</strong> ${(per.pain_points ?? []).join("; ")}</p>
      <p><strong>Quote:</strong> <em>"${per.quote ?? ""}"</em></p>
      <p><strong>Objections:</strong> ${(per.objections ?? []).join("; ")}</p>
    </div>`).join("");

  const emailSteps = (messages?.cold_email_sequence ?? []).map((e: any) => `
    <div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px">
      <p style="margin:0 0 4px;color:#666;font-size:13px">${e.label} — ${e.timing}</p>
      <p style="margin:0 0 8px"><strong>Subject:</strong> ${e.subject}</p>
      <div style="white-space:pre-wrap;font-size:14px;line-height:1.6">${e.body}</div>
    </div>`).join("");

  const hookRows = (messages?.personalization_hooks ?? []).map((h: any) => `
    <tr>
      <td>${h.trigger}</td>
      <td>${h.hook}</td>
      <td><em>${h.example}</em></td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:0 auto;padding:24px;color:#1a1a2e}
    h1{color:#1a1a2e;font-size:26px;border-bottom:3px solid #4f8ef7;padding-bottom:10px}
    h2{color:#4a4a8a;font-size:18px;margin-top:32px;border-bottom:1px solid #ddd;padding-bottom:6px}
    h3{color:#6060a0;font-size:15px}
    table{width:100%;border-collapse:collapse;font-size:13px}
    td,th{border:1px solid #ddd;padding:8px;vertical-align:top}
    th{background:#f0f0ff;font-weight:bold}
    ul{padding-left:20px;line-height:1.8}
  </style></head><body>

  <h1>Cold Outreach Intelligence Report</h1>
  <p><strong>Target Market:</strong> ${input.target}</p>
  ${input.context ? `<p><strong>Selling:</strong> ${input.context}</p>` : ""}
  <p><strong>Geography:</strong> ${input.geography || "Global"}</p>
  <p><strong>Generated:</strong> ${date}</p>

  ${research ? `
  <h2>1. Market Research</h2>
  <h3>Market Overview</h3>
  <p><strong>Size:</strong> ${research.market_overview?.size ?? ""}</p>
  <p><strong>Growth:</strong> ${research.market_overview?.growth_rate ?? ""} &nbsp;|&nbsp; <strong>Maturity:</strong> ${research.market_overview?.maturity ?? ""}</p>
  <p><strong>Key Trends:</strong></p><ul>${list(research.market_overview?.key_trends ?? [])}</ul>

  <h3>Competitor Landscape</h3>
  <table><tr><th>Company</th><th>Positioning</th><th>Strengths</th><th>Weaknesses</th></tr>${competitorRows}</table>

  <h3>Pain Points</h3><ul>${list(research.pain_points ?? [])}</ul>
  <h3>Desires</h3><ul>${list(research.desires ?? [])}</ul>
  <h3>Objections</h3><ul>${list(research.objections ?? [])}</ul>
  <h3>Buying Triggers</h3><ul>${list(research.buying_triggers ?? [])}</ul>
  <h3>Market Opportunities</h3><ul>${list(research.market_opportunities ?? [])}</ul>
  ` : ""}

  ${icpData ? `
  <h2>2. ICP & Buyer Personas</h2>
  <h3>Ideal Customer Profile</h3>
  <p><strong>Industry:</strong> ${icpData.icp?.industry ?? ""} &nbsp;|&nbsp; <strong>Sub-niche:</strong> ${icpData.icp?.sub_niche ?? ""}</p>
  <p><strong>Company size:</strong> ${icpData.icp?.company_size ?? ""} &nbsp;|&nbsp; <strong>Revenue:</strong> ${icpData.icp?.revenue_range ?? ""}</p>
  <p><strong>Geography:</strong> ${icpData.icp?.geography ?? ""}</p>
  <p><strong>Qualifiers:</strong> ${(icpData.icp?.qualifiers ?? []).join(", ")}</p>
  <p><strong>Disqualifiers:</strong> ${(icpData.icp?.disqualifiers ?? []).join(", ")}</p>
  <h3>Buyer Personas</h3>
  ${personaCards}
  ` : ""}

  ${strategy ? `
  <h2>3. Campaign Strategy</h2>
  <h3>Selected Angle: ${angle?.name ?? ""}</h3>
  <p>${angle?.description ?? ""}</p>
  <p><strong>Sample hook:</strong> <em>${angle?.sample_hook ?? ""}</em></p>
  <h3>Selected Offer: ${offer?.name ?? ""}</h3>
  <p>${offer?.description ?? ""}</p>
  <p><strong>CTA:</strong> ${offer?.cta ?? ""}</p>
  <h3>Lead Magnets</h3><ul>${list((strategy.lead_magnets ?? []).map((m: any) => `<strong>${m.name}</strong>: ${m.description ?? ""}`))}
  </ul>
  ` : ""}

  ${messages ? `
  <h2>4. Outreach Messages</h2>
  <h3>Cold Email Sequence (5 emails)</h3>
  ${emailSteps}
  <h3>LinkedIn Connection Request</h3>
  <div style="border:1px solid #ddd;border-radius:8px;padding:16px">${messages.linkedin_connection_note ?? ""}</div>
  <h3>LinkedIn Follow-up Message</h3>
  <div style="border:1px solid #ddd;border-radius:8px;padding:16px">${messages.linkedin_follow_up ?? ""}</div>
  <h3>Personalization Hooks</h3>
  <table><tr><th>Trigger to Look For</th><th>How to Use It</th><th>Example Opener</th></tr>${hookRows}</table>
  ` : ""}

</body></html>`;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GoogleDriveExport(props: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [docUrl, setDocUrl] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState("");

  async function handleExport() {
    setStatus("loading");
    setErrMsg("");
    try {
      const token = await getGoogleToken();
      const html = buildHtml(props);
      const name = `Cold Outreach Report — ${props.input.target} — ${new Date().toLocaleDateString()}`;
      const url = await uploadToDrive(token, name, html);
      setDocUrl(url);
      setStatus("success");
    } catch (e: any) {
      setErrMsg(e.message ?? "Export failed");
      setStatus("error");
    }
  }

  if (status === "success" && docUrl) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={docUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
          View in Google Drive
        </a>
        <button
          onClick={() => { setStatus("idle"); setDocUrl(null); }}
          className="text-xs text-[#6060a0] hover:text-[#e8e8f2] px-2 py-1.5"
        >
          Save again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleExport}
        disabled={status === "loading"}
        className="flex items-center gap-1.5 text-xs bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/30 hover:bg-[#4285F4]/20 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        {status === "loading" ? (
          <>
            <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            Saving to Drive…
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Save to Google Drive
          </>
        )}
      </button>
      {status === "error" && (
        <p className="text-xs text-red-400">{errMsg}</p>
      )}
    </div>
  );
}
