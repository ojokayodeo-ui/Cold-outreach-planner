import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

// ── Claude via direct fetch (no SDK) ─────────────────────────────────────────

async function claude(prompt: string, maxTokens = 2500): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(40000),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

// ── Perplexity live search ────────────────────────────────────────────────────

async function perplexitySearch(query: string): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: "You are a B2B market research analyst. Return detailed, factual, cited findings with real company names and specific statistics.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

// ── Proxycurl LinkedIn company scrape ────────────────────────────────────────

async function scrapeLinkedInCompany(url: string): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key || !url) return "";
  try {
    const res = await fetch(
      `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(url)}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return "";
    const d: any = await res.json();
    return [
      d.name && `Company: ${d.name}`,
      d.description && `Description: ${String(d.description).slice(0, 400)}`,
      d.industry && `Industry: ${d.industry}`,
      d.company_size_on_linkedin && `Size: ${d.company_size_on_linkedin} employees`,
      d.hq && `HQ: ${[d.hq.city, d.hq.country].filter(Boolean).join(", ")}`,
      d.specialities?.length && `Specialties: ${d.specialities.slice(0, 6).join(", ")}`,
    ].filter(Boolean).join("\n");
  } catch {
    return "";
  }
}

const SECTOR_LINKEDIN: Record<string, string[]> = {
  recruitment: ["https://www.linkedin.com/company/hays", "https://www.linkedin.com/company/michael-page"],
  saas: ["https://www.linkedin.com/company/hubspot", "https://www.linkedin.com/company/salesforce"],
  marketing: ["https://www.linkedin.com/company/wpromote", "https://www.linkedin.com/company/webfx"],
  consulting: ["https://www.linkedin.com/company/mckinsey", "https://www.linkedin.com/company/bain-and-company"],
};

function detectSector(target: string): string {
  const t = target.toLowerCase();
  if (/recruit|staffing|talent/.test(t)) return "recruitment";
  if (/saas|software|tech/.test(t)) return "saas";
  if (/market|agency|digital/.test(t)) return "marketing";
  if (/consult/.test(t)) return "consulting";
  return "";
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { target, context, geography } = await req.json();
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const geo = geography && geography !== "Global" ? geography : "";

  // 1. Fire live searches in parallel
  const [marketSearch, competitorSearch, buyerSearch] = await Promise.all([
    perplexitySearch(`Market size, growth rate, key trends and recent news for the ${target} market${geo ? ` in ${geo}` : ""}. Include specific statistics and sources.`),
    perplexitySearch(`Top 4-5 companies and competitors in the ${target} space${geo ? ` in ${geo}` : ""}. Their positioning, pricing, strengths and weaknesses.`),
    perplexitySearch(`Biggest pain points, frustrations, and buying triggers for decision-makers in ${target}${geo ? ` in ${geo}` : ""}. What makes them open to new solutions?`),
  ]);

  // 2. Optionally enrich with LinkedIn company data
  const sector = detectSector(target);
  const linkedInUrls = SECTOR_LINKEDIN[sector] ?? [];
  const linkedInResults = await Promise.all(linkedInUrls.slice(0, 2).map(scrapeLinkedInCompany));
  const linkedInData = linkedInResults.filter(Boolean).join("\n\n---\n\n");

  const hasLiveData = !!(marketSearch || competitorSearch || buyerSearch);

  const liveBlock = hasLiveData ? `
=== LIVE MARKET RESEARCH (ground your output in these facts) ===
[MARKET DATA]
${marketSearch || "Not available"}

[COMPETITOR DATA]
${competitorSearch || "Not available"}

[BUYER PSYCHOLOGY]
${buyerSearch || "Not available"}
${linkedInData ? `\n[LINKEDIN COMPANY DATA]\n${linkedInData}` : ""}
=== END LIVE RESEARCH ===
` : "";

  // 3. Claude synthesizes into structured JSON
  const prompt = `You are a world-class B2B market research analyst.

Synthesize the research below into a structured intelligence report for cold outreach campaigns.

Target: "${target}"
${context ? `Seller context: "${context}"` : ""}
${geo ? `Geography: ${geo}` : ""}
${liveBlock}

${hasLiveData ? "USE the live data above — reference real companies, real statistics, real trends." : "Use your training knowledge to produce the best possible research."}
Be specific. Use real company names, real percentages, real market dynamics.

Return ONLY valid JSON — no markdown fences.

{
  "market_overview": {
    "size": "Specific size with source e.g. '$4.2B (IBISWorld 2024)'",
    "maturity": "emerging|growing|mature|declining",
    "growth_rate": "e.g. 8.4% CAGR",
    "key_trends": ["Specific trend 1", "Trend 2", "Trend 3", "Trend 4", "Trend 5"]
  },
  "competitors": [
    {
      "name": "Real company name",
      "positioning": "How they position themselves",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "common_offer": "Their typical pitch or entry-point offer"
    }
  ],
  "pain_points": ["Specific pain point 1", "Pain point 2", "Pain point 3", "Pain point 4", "Pain point 5", "Pain point 6", "Pain point 7", "Pain point 8"],
  "desires": ["Desire 1", "Desire 2", "Desire 3", "Desire 4", "Desire 5", "Desire 6"],
  "objections": ["Objection 1", "Objection 2", "Objection 3", "Objection 4", "Objection 5"],
  "buying_triggers": ["Trigger 1", "Trigger 2", "Trigger 3", "Trigger 4", "Trigger 5"],
  "market_opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3"],
  "common_messaging": ["Overused pattern 1", "Pattern 2", "Pattern 3", "Pattern 4"]
}`;

  try {
    const raw = await claude(prompt, 4000);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json({
      ...data,
      _meta: {
        live_research: hasLiveData,
        linkedin_enriched: !!linkedInData,
        sources: [
          hasLiveData ? "Perplexity Sonar Pro" : "Claude training data",
          linkedInData ? "Proxycurl LinkedIn" : null,
        ].filter(Boolean),
      },
    });
  } catch (err: any) {
    console.error("Research failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate research" }, { status: 500 });
  }
}
