import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const anthropic = new Anthropic();

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

// ── Perplexity: search for real ICP examples ─────────────────────────────────

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
            content: "You are a B2B sales intelligence analyst. Return specific, factual data about companies and decision-makers.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 1000,
        return_citations: true,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch {
    return "";
  }
}

// ── Proxycurl: search for real people profiles ────────────────────────────────

async function searchLinkedInPeople(
  titles: string[],
  geography: string
): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key) return "";

  try {
    const params = new URLSearchParams({
      country: geography?.toLowerCase().includes("uk") || geography?.toLowerCase().includes("united kingdom") ? "GB" : "US",
      current_role_title: titles.slice(0, 2).join(" OR "),
      enrich_profile: "enrich",
      page_size: "3",
    });

    const res = await fetch(
      `https://nubela.co/proxycurl/api/search/person?${params}`,
      {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(20000),
      }
    );

    if (!res.ok) return "";
    const data: any = await res.json();
    const profiles = data.results ?? [];

    return profiles
      .slice(0, 3)
      .map((p: any) => {
        const profile = p.profile ?? {};
        const parts: string[] = [];
        if (profile.full_name) parts.push(`Name: ${profile.full_name}`);
        if (profile.occupation) parts.push(`Role: ${profile.occupation}`);
        if (profile.headline) parts.push(`Headline: ${profile.headline}`);
        if (profile.summary) parts.push(`Summary: ${String(profile.summary).slice(0, 300)}`);
        const exp = profile.experiences?.[0];
        if (exp?.company) parts.push(`Company: ${exp.company} (${exp.company_linkedin_profile_url ? "LinkedIn" : ""})`);
        if (profile.skills?.length) parts.push(`Skills: ${profile.skills.slice(0, 8).join(", ")}`);
        if (profile.city || profile.country_full_name) {
          parts.push(`Location: ${[profile.city, profile.country_full_name].filter(Boolean).join(", ")}`);
        }
        return parts.join("\n");
      })
      .join("\n\n---\n\n");
  } catch {
    return "";
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { target, context, geography, research } = await req.json();

  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  // 1. Perplexity: find real ICP company examples
  const icpSearch = await perplexitySearch(
    `Give me 3-5 specific real company examples that match this ideal customer profile: ${target}${geography && geography !== "Global" ? ` in ${geography}` : ""}. Include company name, size, what they do, and why they'd need help with their outreach.`
  );

  // 2. Proxycurl: find real decision-maker profiles
  // Infer likely titles from research or target
  const likelyTitles = research?.icp?.target_titles ?? [
    "Managing Director",
    "CEO",
    "Founder",
    "Head of Sales",
    "VP Sales",
  ];
  const realPeopleData = await searchLinkedInPeople(likelyTitles, geography ?? "");

  const hasLiveData = !!(icpSearch || realPeopleData);

  const liveBlock = hasLiveData
    ? `
=== LIVE ICP INTELLIGENCE ===

${icpSearch ? `[REAL COMPANY EXAMPLES MATCHING THIS ICP]\n${icpSearch}` : ""}

${realPeopleData ? `[REAL DECISION-MAKER PROFILES FROM LINKEDIN]\nThese are real people in this role — use their language, background, and patterns to build the personas:\n${realPeopleData}` : ""}

=== END LIVE INTELLIGENCE ===
`
    : "";

  const researchSummary = research
    ? `
KEY RESEARCH FINDINGS (already gathered):
- Pain points: ${research.pain_points?.slice(0, 5).join("; ")}
- Buying triggers: ${research.buying_triggers?.slice(0, 4).join("; ")}
- Market maturity: ${research.market_overview?.maturity}
- Desires: ${research.desires?.slice(0, 4).join("; ")}
- Common objections: ${research.objections?.slice(0, 3).join("; ")}
`
    : "";

  const prompt = `You are a world-class B2B go-to-market strategist.

Build a precise Ideal Customer Profile (ICP) and 3 highly detailed buyer personas for cold outreach campaigns.

Target Market: "${target}"
${context ? `Seller Context: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
${researchSummary}
${liveBlock}

CRITICAL INSTRUCTIONS:
${hasLiveData ? "- USE the real LinkedIn profiles and company examples above to make the personas authentic and specific" : "- Use your best knowledge of this market to create realistic personas"}
- Persona quotes must sound like something a REAL person in this role would say on a call or LinkedIn post
- Pain points must be EMOTIONAL (how it feels) AND OPERATIONAL (what it costs)
- Decision process must be realistic — who else is involved, what triggers action
- Watering holes must be SPECIFIC (e.g. 'Recruitment Brainfood newsletter' not just 'newsletters')

Return ONLY valid JSON — no markdown, no explanation.

{
  "icp": {
    "industry": "Primary industry",
    "sub_niche": "Specific sub-niche",
    "company_size": "e.g. 10–50 employees",
    "revenue_range": "e.g. £1M–£5M revenue",
    "geography": "Target geography",
    "business_model": "e.g. B2B staffing agency / SaaS / Consultancy",
    "tech_stack": ["tool1", "tool2", "tool3"],
    "buying_readiness": [
      "Signal 1 — specific indicator they're ready to buy",
      "Signal 2"
    ],
    "who_not_to_target": [
      "Specific profile to avoid and exact reason why",
      "Another profile to avoid"
    ],
    "segments": [
      {
        "name": "Segment name",
        "description": "2 sentences on who this segment is",
        "size_estimate": "e.g. ~3,000 companies in UK",
        "priority": "high|medium|low"
      }
    ]
  },
  "personas": [
    {
      "id": "persona-1",
      "name": "Alex",
      "title": "Job title",
      "company_stage": "e.g. Established recruitment agency, 25 staff, £2M turnover",
      "goals": ["Specific goal 1", "Goal 2", "Goal 3"],
      "kpis": ["Exact KPI they're measured on", "KPI 2"],
      "pain_points": [
        "Emotional pain: how it makes them feel day-to-day",
        "Operational pain: specific business cost or consequence",
        "A third specific pain"
      ],
      "desires": [
        "What they secretly want beyond surface goals",
        "Deeper aspiration 2",
        "Aspiration 3"
      ],
      "objections": [
        "Real objection they'd raise in a sales call",
        "Second objection",
        "Third objection"
      ],
      "decision_process": "Detailed description: who else is involved, what they need to see, how long it takes, what triggers them to finally say yes",
      "platforms": ["LinkedIn", "specific platform they actually use"],
      "watering_holes": ["Specific community/newsletter/event name", "Another specific one"],
      "daily_frustration": "A paragraph describing what their Monday morning looks like — the specific frustrations that make them receptive to a good pitch",
      "quote": "Something they'd genuinely say on a sales call or post on LinkedIn — in their authentic voice, not corporate speak"
    }
  ]
}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(cleanJson(raw));

    return NextResponse.json({
      ...data,
      _meta: {
        live_research: hasLiveData,
        real_profiles_used: !!realPeopleData,
        sources: [
          hasLiveData ? "Perplexity Sonar Pro" : null,
          realPeopleData ? "Proxycurl LinkedIn People Search" : null,
          "Claude claude-sonnet-4-6 synthesis",
        ].filter(Boolean),
      },
    });
  } catch (err) {
    console.error("ICP generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate ICP and personas." },
      { status: 500 }
    );
  }
}
