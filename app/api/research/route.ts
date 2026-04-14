import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  let s = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  return s;
}

async function claude(prompt: string, maxTokens = 8000): Promise<string> {
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
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err.slice(0, 200)}`);
  }
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

async function perplexitySearch(query: string, maxTokens = 1200): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a B2B market research analyst. Return detailed, factual findings with real company names, URLs, and specific data." },
          { role: "user", content: query },
        ],
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch { return ""; }
}

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)", Accept: "text/html" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 4000);
  } catch { return ""; }
}

async function scrapeLinkedInCompany(url: string): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key || !url) return "";
  try {
    const res = await fetch(
      `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return "";
    const d: any = await res.json();
    return [
      d.name && `Company: ${d.name}`,
      d.description && `Description: ${String(d.description).slice(0, 350)}`,
      d.industry && `Industry: ${d.industry}`,
      d.company_size_on_linkedin && `Size: ${d.company_size_on_linkedin} employees`,
      d.hq && `HQ: ${[d.hq.city, d.hq.country].filter(Boolean).join(", ")}`,
      d.specialities?.length && `Specialties: ${d.specialities.slice(0, 5).join(", ")}`,
    ].filter(Boolean).join("\n");
  } catch { return ""; }
}

const SECTOR_LINKEDIN: Record<string, string[]> = {
  recruitment: ["https://www.linkedin.com/company/hays"],
  saas: ["https://www.linkedin.com/company/hubspot"],
  marketing: ["https://www.linkedin.com/company/wpromote"],
  consulting: ["https://www.linkedin.com/company/mckinsey"],
};

function detectSector(target: string): string {
  const t = target.toLowerCase();
  if (/recruit|staffing|talent/.test(t)) return "recruitment";
  if (/saas|software|tech/.test(t)) return "saas";
  if (/market|agency|digital/.test(t)) return "marketing";
  if (/consult/.test(t)) return "consulting";
  return "";
}

export async function POST(req: NextRequest) {
  let target: string, context: string, geography: string, websiteUrl: string;
  try {
    ({ target, context, geography, websiteUrl } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const geo = geography && geography !== "Global" ? geography : "";
  const hasWebsite = !!(websiteUrl?.trim());
  const normalizedUrl = hasWebsite
    ? (websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`)
    : "";

  // All external calls run in parallel — capped at 10s each to stay under Netlify's 60s limit
  const sector = detectSector(target);
  const linkedInUrl = (SECTOR_LINKEDIN[sector] ?? [])[0] ?? "";

  const [marketSearch, competitorSearch, buyerSearch, competitorIntel, websiteText, linkedInData] =
    await Promise.all([
      perplexitySearch(
        `Market size, growth rate, key trends and recent news for the ${target} market${geo ? ` in ${geo}` : ""}. Include specific statistics and sources.`
      ),
      perplexitySearch(
        `List 10 specific real companies competing in the ${target} space${geo ? ` in ${geo}` : ""}. ` +
        `For each: company name, website URL, year founded, size, main offer, pricing, ` +
        `founder/owner name and LinkedIn URL, their USP, common customer complaints, and gaps you can exploit.`,
        2000
      ),
      perplexitySearch(
        `Biggest pain points, frustrations, buying triggers, and objections for decision-makers in ${target}${geo ? ` in ${geo}` : ""}. What makes them receptive to new solutions?`
      ),
      hasWebsite
        ? perplexitySearch(
            `Research the company at ${normalizedUrl}. Find: exact company name, what they do, ` +
            `company size, founding year, location, products/services, target customers, ` +
            `recent news or funding, growth signals, and how they compare to others in the ${target} market.`,
            1200
          )
        : Promise.resolve(""),
      hasWebsite ? scrapeWebsite(normalizedUrl) : Promise.resolve(""),
      linkedInUrl ? scrapeLinkedInCompany(linkedInUrl).catch(() => "") : Promise.resolve(""),
    ]).catch(() => ["", "", "", "", "", ""] as string[]);

  const hasLiveData = !!(marketSearch || competitorSearch || buyerSearch);

  const websiteBlock = hasWebsite ? `
=== PROSPECT WEBSITE INTELLIGENCE ===
URL: ${normalizedUrl}
[WEBSITE SCRAPED CONTENT]
${websiteText || "Could not scrape"}
[WEB RESEARCH ON THIS COMPANY]
${competitorIntel || "Not available"}
=== END WEBSITE INTELLIGENCE ===
` : "";

  const liveBlock = `
=== LIVE MARKET RESEARCH ===
[MARKET DATA] ${marketSearch || "Not available"}

[BUYER PSYCHOLOGY] ${buyerSearch || "Not available"}

[10 COMPETITORS — names, websites, founders, USPs, pricing, complaints, gaps]
${competitorSearch || "Not available"}

${linkedInData ? `[LINKEDIN DATA]\n${linkedInData}` : ""}
=== END LIVE RESEARCH ===
`;

  const websiteJsonSection = hasWebsite ? `,
  "website_analysis": {
    "company_name": "Exact company name",
    "tagline": "Their headline or tagline from the website",
    "what_they_do": "2-sentence description of their business",
    "target_audience": "Who they serve",
    "key_services": ["Service 1", "Service 2", "Service 3"],
    "value_proposition": "Their main value prop",
    "online_presence_quality": "strong|moderate|weak",
    "messaging_strengths": ["What their marketing does well 1", "Strength 2"],
    "messaging_gaps": ["Gap in their current marketing 1", "Gap 2"],
    "cta_strategy": "What conversion action they push visitors toward",
    "how_they_compare": "How they stack up vs others in this market"
  },
  "swot": {
    "strengths": ["Internal strength specific to this company 1", "Strength 2", "Strength 3", "Strength 4"],
    "weaknesses": ["Internal weakness based on data 1", "Weakness 2", "Weakness 3", "Weakness 4"],
    "opportunities": ["External opportunity available to this company 1", "Opportunity 2", "Opportunity 3", "Opportunity 4"],
    "threats": ["External threat to this company 1", "Threat 2", "Threat 3", "Threat 4"]
  }` : "";

  const prompt = `You are a world-class B2B market research analyst and competitive intelligence specialist.

Synthesize ALL research below into a structured report for cold outreach targeting: "${target}"
${context ? `Seller: "${context}"` : ""}${geo ? `\nGeography: ${geo}` : ""}

${websiteBlock}
${liveBlock}

Use real company names, URLs, people from the research. Mark unknowns as "Unknown" — never fabricate.
${hasWebsite ? `website_analysis and swot must be specific to the company at ${normalizedUrl}.` : ""}

Return ONLY valid JSON — no markdown.

{
  "market_overview": {
    "size": "e.g. '$4.2B (IBISWorld 2024)'",
    "maturity": "emerging|growing|mature|declining",
    "growth_rate": "e.g. 8.4% CAGR",
    "key_trends": ["Trend 1", "Trend 2", "Trend 3", "Trend 4", "Trend 5"]
  },
  "competitor_profiles": [
    {
      "name": "Real company name",
      "website": "URL or Unknown",
      "linkedin_url": "LinkedIn URL or Unknown",
      "founded_year": "Year or Unknown",
      "years_in_business": "e.g. ~9 years",
      "company_size": "e.g. 11–50 employees",
      "owner_name": "Founder/CEO or Unknown",
      "owner_linkedin": "LinkedIn URL or Unknown",
      "owner_background": "2-sentence bio or Unknown",
      "owner_online_presence": ["LinkedIn", "Twitter @handle", "podcast", "newsletter"],
      "usp": "Their USP in one sentence",
      "core_offer": "What they sell specifically",
      "pricing_model": "e.g. £2k–5k/mo retainer",
      "needs_they_solve": ["Problem 1", "Problem 2", "Problem 3"],
      "shortcomings": ["Gap 1", "Gap 2", "Gap 3"],
      "differentiator_opportunity": "Specific gap you can exploit"
    }
  ],
  "pain_points": ["Pain 1","Pain 2","Pain 3","Pain 4","Pain 5","Pain 6","Pain 7","Pain 8"],
  "desires": ["Desire 1","Desire 2","Desire 3","Desire 4","Desire 5","Desire 6"],
  "objections": ["Objection 1","Objection 2","Objection 3","Objection 4","Objection 5"],
  "buying_triggers": ["Trigger 1","Trigger 2","Trigger 3","Trigger 4","Trigger 5"],
  "market_opportunities": ["Opportunity 1","Opportunity 2","Opportunity 3"],
  "common_messaging": ["Overused pattern 1","Pattern 2","Pattern 3","Pattern 4"]${websiteJsonSection}
}

Generate exactly 5 competitor_profiles.${hasWebsite ? " website_analysis and swot are mandatory." : ""}`;

  try {
    const raw = await claude(prompt);
    const data = JSON.parse(cleanJson(raw));

    const competitors = (data.competitor_profiles ?? []).map((p: any) => ({
      name: p.name,
      positioning: p.usp ?? "",
      strengths: p.needs_they_solve?.slice(0, 2) ?? [],
      weaknesses: p.shortcomings?.slice(0, 2) ?? [],
      common_offer: p.core_offer ?? "",
    }));

    return NextResponse.json({
      ...data,
      competitors,
      _meta: {
        live_research: hasLiveData,
        website_scraped: hasWebsite && !!websiteText,
        website_url: normalizedUrl || null,
        linkedin_enriched: !!linkedInData,
        sources: [
          hasLiveData ? "Perplexity Sonar Pro" : "Claude training data",
          hasWebsite ? "Website scrape" : null,
          linkedInData ? "Proxycurl LinkedIn" : null,
        ].filter(Boolean),
      },
    });
  } catch (err: any) {
    console.error("Research failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate research" }, { status: 500 });
  }
}
