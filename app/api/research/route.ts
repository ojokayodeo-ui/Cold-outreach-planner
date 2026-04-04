import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const anthropic = new Anthropic();

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
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
            content:
              "You are a B2B market research analyst. Return detailed, factual, cited findings. Include real company names, real statistics, and specific data points where available.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 1500,
        return_citations: true,
      }),
      signal: AbortSignal.timeout(30000),
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
      `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(url)}&categories=include&funding_data=include&extra=include`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(15000),
      }
    );
    if (!res.ok) return "";
    const d: any = await res.json();
    const parts: string[] = [];
    if (d.name) parts.push(`Company: ${d.name}`);
    if (d.description) parts.push(`Description: ${String(d.description).slice(0, 500)}`);
    if (d.industry) parts.push(`Industry: ${d.industry}`);
    if (d.company_size_on_linkedin) parts.push(`Size: ${d.company_size_on_linkedin} employees`);
    if (d.hq) parts.push(`HQ: ${[d.hq.city, d.hq.country].filter(Boolean).join(", ")}`);
    if (d.specialities?.length) parts.push(`Specialties: ${d.specialities.slice(0, 6).join(", ")}`);
    if (d.tagline) parts.push(`Tagline: ${d.tagline}`);
    if (d.founded_on?.year) parts.push(`Founded: ${d.founded_on.year}`);
    if (d.follower_count) parts.push(`LinkedIn followers: ${d.follower_count.toLocaleString()}`);
    return parts.join("\n");
  } catch {
    return "";
  }
}

// ── Well-known LinkedIn URLs for common sectors (fallback enrichment) ─────────
const SECTOR_LINKEDIN: Record<string, string[]> = {
  recruitment: [
    "https://www.linkedin.com/company/hays",
    "https://www.linkedin.com/company/michael-page",
  ],
  saas: [
    "https://www.linkedin.com/company/hubspot",
    "https://www.linkedin.com/company/salesforce",
  ],
  marketing: [
    "https://www.linkedin.com/company/wpromote",
    "https://www.linkedin.com/company/webfx",
  ],
  consulting: [
    "https://www.linkedin.com/company/mckinsey",
    "https://www.linkedin.com/company/bain-and-company",
  ],
};

function detectSector(target: string): string {
  const t = target.toLowerCase();
  if (/recruit|staffing|talent/.test(t)) return "recruitment";
  if (/saas|software|tech/.test(t)) return "saas";
  if (/marketing|agency|digital/.test(t)) return "marketing";
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

  // 1. Fire all live research in parallel
  const [marketSearch, competitorSearch, buyerSearch] = await Promise.all([
    perplexitySearch(
      `Market size, growth rate, key trends and recent news for the ${target} market${geo ? ` in ${geo}` : ""}. Include specific statistics, percentages and sources.`
    ),
    perplexitySearch(
      `Top 4-5 companies and competitors in the ${target} space${geo ? ` in ${geo}` : ""}. For each: their positioning, pricing approach, strengths, weaknesses, and what they pitch to customers.`
    ),
    perplexitySearch(
      `What are the biggest pain points, frustrations, and buying triggers for decision-makers in ${target} companies${geo ? ` in ${geo}` : ""}? What events make them look for new solutions? What objections do they raise to vendors?`
    ),
  ]);

  // 2. Optionally enrich with LinkedIn company data
  const sector = detectSector(target);
  const linkedInUrls = SECTOR_LINKEDIN[sector] ?? [];
  const linkedInData = await Promise.all(
    linkedInUrls.slice(0, 2).map((url) => scrapeLinkedInCompany(url))
  ).then((results) => results.filter(Boolean).join("\n\n---\n\n"));

  // 3. Check if Perplexity is available — if not, note it in the prompt
  const hasLiveData = !!(marketSearch || competitorSearch || buyerSearch);
  const liveDataBlock = hasLiveData
    ? `
=== LIVE MARKET RESEARCH (use these facts, statistics, and company names in your output) ===

[MARKET DATA]
${marketSearch || "Not available"}

[COMPETITOR DATA]
${competitorSearch || "Not available"}

[BUYER PSYCHOLOGY & TRIGGERS]
${buyerSearch || "Not available"}

${linkedInData ? `[LINKEDIN COMPANY PROFILES]\n${linkedInData}` : ""}

=== END LIVE RESEARCH ===
`
    : "";

  // 4. Claude synthesizes everything into structured JSON
  const prompt = `You are a world-class B2B market research analyst.

Synthesize the live research data below into a structured intelligence report for planning cold outreach campaigns.

Target Market: "${target}"
${context ? `Seller Context: "${context}"` : ""}
${geo ? `Geography: ${geo}` : ""}
${liveDataBlock}

CRITICAL INSTRUCTIONS:
${hasLiveData ? "- USE the live research data above — reference real companies, real statistics, real trends found there" : "- Use your training knowledge to produce the best possible research"}
- Be SPECIFIC: use real company names, real percentages, real market dynamics
- Pain points must reflect what real decision-makers in this market actually complain about
- Competitors must be real players in this space (from live data or your knowledge)
- Buying triggers must be specific events, not generic statements

Return ONLY valid JSON — no markdown fences, no explanation.

{
  "market_overview": {
    "size": "Specific market size with source e.g. '$4.2B (IBISWorld 2024)'",
    "maturity": "emerging|growing|mature|declining",
    "growth_rate": "e.g. 8.4% CAGR (2024-2029)",
    "key_trends": ["Specific trend 1 with context", "Trend 2", "Trend 3", "Trend 4", "Trend 5"]
  },
  "competitors": [
    {
      "name": "Real company name",
      "positioning": "How they actually position themselves in the market",
      "strengths": ["Specific strength 1", "Specific strength 2"],
      "weaknesses": ["Specific weakness 1", "Specific weakness 2"],
      "common_offer": "Their typical entry-point offer or pitch"
    }
  ],
  "pain_points": [
    "Specific, realistic pain point decision-makers in this market face"
  ],
  "desires": [
    "Core desire or aspiration"
  ],
  "objections": [
    "Common objection they raise to vendors"
  ],
  "buying_triggers": [
    "Specific event or signal that makes them open to buy NOW"
  ],
  "market_opportunities": [
    "Gap or opportunity a new entrant could exploit"
  ],
  "common_messaging": [
    "Overused message pattern saturating this market — avoid these"
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(cleanJson(raw));

    // Surface whether live data was used
    return NextResponse.json({
      ...data,
      _meta: {
        live_research: hasLiveData,
        linkedin_enriched: !!linkedInData,
        sources: ["Perplexity Sonar Pro", hasLiveData ? "Live web" : "Claude training data", linkedInData ? "Proxycurl LinkedIn" : null].filter(Boolean),
      },
    });
  } catch (err) {
    console.error("Research generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate research report. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}
