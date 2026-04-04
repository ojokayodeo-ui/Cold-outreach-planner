import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
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
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

async function perplexitySearch(query: string): Promise<string> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) return "";
  try {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "You are a B2B sales intelligence analyst. Return specific, factual data." },
          { role: "user", content: query },
        ],
        max_tokens: 1000,
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  } catch { return ""; }
}

async function searchLinkedInPeople(titles: string[], geography: string): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key) return "";
  try {
    const country = /uk|united kingdom/i.test(geography) ? "GB" : "US";
    const params = new URLSearchParams({
      country,
      current_role_title: titles.slice(0, 2).join(" OR "),
      enrich_profile: "enrich",
      page_size: "3",
    });
    const res = await fetch(`https://nubela.co/proxycurl/api/search/person?${params}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();
    return (data.results ?? []).slice(0, 3).map((p: any) => {
      const pr = p.profile ?? {};
      return [
        pr.full_name && `Name: ${pr.full_name}`,
        pr.occupation && `Role: ${pr.occupation}`,
        pr.headline && `Headline: ${pr.headline}`,
        pr.summary && `Summary: ${String(pr.summary).slice(0, 250)}`,
        pr.skills?.length && `Skills: ${pr.skills.slice(0, 6).join(", ")}`,
      ].filter(Boolean).join("\n");
    }).join("\n\n---\n\n");
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const { target, context, geography, research } = await req.json();
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const likelyTitles = ["Managing Director", "CEO", "Founder", "Head of Sales", "VP Sales"];

  const [icpSearch, realPeopleData] = await Promise.all([
    perplexitySearch(`Give 3-5 specific real company examples matching this ICP: ${target}${geography && geography !== "Global" ? ` in ${geography}` : ""}. Include company name, size, what they do.`),
    searchLinkedInPeople(likelyTitles, geography ?? ""),
  ]);

  const hasLiveData = !!(icpSearch || realPeopleData);

  const liveBlock = hasLiveData ? `
=== LIVE ICP INTELLIGENCE ===
${icpSearch ? `[REAL COMPANY EXAMPLES]\n${icpSearch}` : ""}
${realPeopleData ? `[REAL LINKEDIN DECISION-MAKER PROFILES — use their language and patterns for personas]\n${realPeopleData}` : ""}
=== END LIVE INTELLIGENCE ===
` : "";

  const researchSummary = research ? `
KEY RESEARCH FINDINGS:
- Pain points: ${research.pain_points?.slice(0, 5).join("; ")}
- Buying triggers: ${research.buying_triggers?.slice(0, 4).join("; ")}
- Desires: ${research.desires?.slice(0, 4).join("; ")}
- Objections: ${research.objections?.slice(0, 3).join("; ")}
` : "";

  const prompt = `You are a world-class B2B go-to-market strategist.

Build a precise ICP and 3 detailed buyer personas for cold outreach.

Target: "${target}"
${context ? `Seller: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
${researchSummary}
${liveBlock}

${hasLiveData ? "USE the real LinkedIn profiles and company examples to make personas authentic." : ""}
Persona quotes must sound like something a real person would say on a sales call.
Pain points = EMOTIONAL (how it feels) + OPERATIONAL (what it costs).
Watering holes must be SPECIFIC (e.g. 'Recruitment Brainfood newsletter').

Return ONLY valid JSON — no markdown.

{
  "icp": {
    "industry": "Primary industry",
    "sub_niche": "Specific sub-niche",
    "company_size": "e.g. 10–50 employees",
    "revenue_range": "e.g. £1M–£5M revenue",
    "geography": "Target geography",
    "business_model": "e.g. B2B staffing agency",
    "tech_stack": ["tool1", "tool2", "tool3"],
    "buying_readiness": ["Signal 1", "Signal 2"],
    "who_not_to_target": ["Avoid profile 1 and why", "Avoid profile 2"],
    "segments": [
      { "name": "Segment", "description": "2 sentences", "size_estimate": "~3,000 companies in UK", "priority": "high|medium|low" }
    ]
  },
  "personas": [
    {
      "id": "persona-1",
      "name": "Alex",
      "title": "Job title",
      "company_stage": "e.g. Established recruitment agency, 25 staff",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "kpis": ["KPI 1", "KPI 2"],
      "pain_points": ["Emotional pain: how it feels", "Operational pain: what it costs", "Third pain"],
      "desires": ["Deeper desire 1", "Aspiration 2", "Aspiration 3"],
      "objections": ["Real objection 1", "Objection 2", "Objection 3"],
      "decision_process": "Detailed: who else involved, timeline, what triggers yes",
      "platforms": ["LinkedIn", "platform2"],
      "watering_holes": ["Specific community or newsletter", "Specific event or podcast"],
      "daily_frustration": "A paragraph: what their Monday morning feels like — specific frustrations that make them receptive",
      "quote": "Something they'd genuinely say on a sales call — in their authentic voice"
    }
  ]
}`;

  try {
    const raw = await claude(prompt, 5000);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json({
      ...data,
      _meta: {
        live_research: hasLiveData,
        real_profiles_used: !!realPeopleData,
        sources: [
          hasLiveData ? "Perplexity Sonar Pro" : null,
          realPeopleData ? "Proxycurl LinkedIn People" : null,
          "Claude claude-sonnet-4-6",
        ].filter(Boolean),
      },
    });
  } catch (err: any) {
    console.error("ICP failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate ICP" }, { status: 500 });
  }
}
