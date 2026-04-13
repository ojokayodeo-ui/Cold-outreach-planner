import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';
export const maxDuration = 120;

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

async function claude(prompt: string, maxTokens = 12000): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

async function perplexitySearch(query: string, maxTokens = 1500): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a B2B sales intelligence analyst. Return specific, factual data with real names and details." },
          { role: "user", content: query },
        ],
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch { return ""; }
}

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)",
        "Accept": "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";
    const html = await res.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);
    return text;
  } catch { return ""; }
}

async function lookupLinkedInCompany(domain: string): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key) return "";
  try {
    // Derive likely LinkedIn URL from domain
    const company = domain.replace(/^https?:\/\/(www\.)?/, "").split(".")[0];
    const url = `https://www.linkedin.com/company/${company}`;
    const res = await fetch(
      `https://nubela.co/proxycurl/api/linkedin/company?url=${encodeURIComponent(url)}`,
      { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return "";
    const d: any = await res.json();
    return [
      d.name && `Company: ${d.name}`,
      d.description && `Description: ${String(d.description).slice(0, 500)}`,
      d.industry && `Industry: ${d.industry}`,
      d.company_size_on_linkedin && `Size: ${d.company_size_on_linkedin} employees`,
      d.founded_year && `Founded: ${d.founded_year}`,
      d.hq && `HQ: ${[d.hq.city, d.hq.country].filter(Boolean).join(", ")}`,
      d.specialities?.length && `Specialties: ${d.specialities.slice(0, 8).join(", ")}`,
      d.follower_count && `LinkedIn followers: ${d.follower_count.toLocaleString()}`,
    ].filter(Boolean).join("\n");
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  let url: string, context: string, geography: string;
  try {
    ({ url, context, geography } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!url?.trim()) {
    return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
  }

  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  const domain = normalizedUrl.replace(/\/$/, "");

  // Run all intelligence gathering in parallel
  const [websiteText, companySearch, peopleSearch, newsSearch, linkedInData] = await Promise.all([
    scrapeWebsite(normalizedUrl),
    perplexitySearch(
      `Research the company at ${domain}. Find: exact company name, what they do (products/services), company size (headcount), founding year, HQ location, revenue range if known, their target customers, key achievements or differentiators. Be specific.`,
      2000
    ),
    perplexitySearch(
      `Who are the founders, CEO, and key decision-makers at the company ${domain}? Include names, titles, LinkedIn URLs, their professional background, and any public social media profiles or communities they participate in.`,
      1500
    ),
    perplexitySearch(
      `What is the latest news, funding, hiring trends, or growth signals for the company at ${domain}? Also: what are the biggest challenges or pain points companies like theirs typically face?`,
      1500
    ),
    lookupLinkedInCompany(normalizedUrl),
  ]);

  const hasData = !!(websiteText || companySearch || peopleSearch);

  const intelligenceBlock = `
=== PROSPECT INTELLIGENCE ===
[WEBSITE CONTENT — scraped directly]
${websiteText || "Could not scrape — use other sources"}

[COMPANY RESEARCH — from web]
${companySearch || "Not available"}

[PEOPLE & DECISION MAKERS]
${peopleSearch || "Not available"}

[RECENT NEWS & GROWTH SIGNALS]
${newsSearch || "Not available"}

${linkedInData ? `[LINKEDIN COMPANY DATA]\n${linkedInData}` : ""}
=== END INTELLIGENCE ===
`;

  const prompt = `You are a world-class B2B sales intelligence analyst and cold outreach specialist.

Analyze the prospect company below and generate a complete, personalised cold outreach report.

Prospect website: ${domain}
${context ? `What we sell: "${context}"` : ""}
${geography ? `Our geography: ${geography}` : ""}

${intelligenceBlock}

Generate a report that helps a salesperson understand this company deeply and reach out in the most personalised way possible. Make every section specific to THIS company — not generic.

Return ONLY valid JSON — no markdown.

{
  "company": {
    "name": "Exact company name",
    "website": "${domain}",
    "industry": "Their industry",
    "sub_niche": "Specific niche within industry",
    "size": "Headcount range e.g. 50-200 employees",
    "founded": "Year or Unknown",
    "location": "HQ city and country",
    "description": "3-sentence description of what they do, who they serve, and how they make money",
    "products_services": ["Main product/service 1", "Service 2", "Service 3"],
    "target_customers": "Who their customers are",
    "growth_signals": ["Signal showing they are growing or changing", "Signal 2"],
    "tech_signals": ["Technology or tool they use visible from website/data", "Tool 2"],
    "recent_news": ["Recent news item 1 if known", "News item 2"]
  },
  "decision_makers": [
    {
      "title": "Job title",
      "name": "Real name or 'Unknown'",
      "linkedin": "LinkedIn URL or 'Unknown'",
      "why_target": "Why this person is the right contact for what we sell",
      "likely_pain": "The specific pain this person feels that we solve"
    }
  ],
  "intelligence": {
    "inferred_pain_points": ["Specific pain 1 based on company stage/industry/signals", "Pain 2", "Pain 3", "Pain 4"],
    "buying_signals": ["Signal that suggests they need what we sell", "Signal 2"],
    "best_entry_point": "Which person to contact first and exactly why",
    "timing": "Why now is a good time to reach out to this specific company",
    "fit_score": 8,
    "fit_reasoning": "2 sentences explaining how strong a fit this prospect is for what we sell"
  },
  "outreach_angles": [
    {
      "name": "Angle name",
      "type": "pain|opportunity|curiosity|data|competitor",
      "hook": "The exact opening hook sentence — fully personalised to this company",
      "why_it_works": "Why this angle works specifically for this company"
    }
  ],
  "email_templates": [
    {
      "label": "Email 1 — [angle type]",
      "subject": "Subject line personalised to this company",
      "body": "Full email body (4-6 sentences). Use their company name, reference something specific about them. End with a soft CTA.",
      "best_for": "Who to send this to and when"
    },
    {
      "label": "Email 2 — Follow-up",
      "subject": "Follow-up subject line",
      "body": "Short follow-up email (3-4 sentences) referencing previous email.",
      "best_for": "Send 3-5 days after email 1"
    },
    {
      "label": "Email 3 — Break-up",
      "subject": "Final attempt subject",
      "body": "Short break-up email (2-3 sentences) that leaves door open.",
      "best_for": "Final touch in sequence"
    }
  ],
  "linkedin_messages": {
    "connection_request": "Short connection note (under 300 chars) — personalised, not salesy",
    "follow_up_dm": "Follow-up DM after connecting (2-3 sentences) — reference something specific"
  },
  "talk_track": {
    "opener": "How to open a cold call to this company — reference something specific",
    "key_questions": ["Discovery question 1 tailored to their situation", "Question 2", "Question 3"],
    "value_statement": "Your value prop framed specifically for this company's situation"
  }
}

Generate 5 outreach_angles and 2-3 decision_makers. Every field must be specific to this company — no generic placeholders.`;

  try {
    const raw = await claude(prompt);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json({
      ...data,
      _meta: {
        url: domain,
        scraped: !!websiteText,
        live_research: !!companySearch,
        linkedin: !!linkedInData,
        sources: [
          websiteText ? "Website scrape" : null,
          companySearch ? "Perplexity Sonar Pro" : null,
          linkedInData ? "Proxycurl LinkedIn" : null,
          "Claude claude-sonnet-4-6",
        ].filter(Boolean),
      },
    });
  } catch (err: any) {
    console.error("Prospect research failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate prospect report" }, { status: 500 });
  }
}
