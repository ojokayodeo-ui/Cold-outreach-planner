import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  let s = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  // Remove trailing commas before ] or }
  s = s.replace(/,(\s*[}\]])/g, "$1");
  return s;
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

// Fetch LinkedIn people by job titles and extract rich profile data
async function searchLinkedInPeople(titles: string[], industry: string, geography: string, count = 5): Promise<string> {
  const key = process.env.PROXYCURL_API_KEY;
  if (!key) return "";
  try {
    const country = /uk|united kingdom/i.test(geography) ? "GB"
      : /australia|aus/i.test(geography) ? "AU"
      : /canada/i.test(geography) ? "CA"
      : "US";

    const params = new URLSearchParams({
      country,
      current_role_title: titles.slice(0, 3).join(" OR "),
      ...(industry ? { current_role_after_fuzz_title: industry } : {}),
      enrich_profile: "enrich",
      page_size: String(count),
    });

    const res = await fetch(`https://nubela.co/proxycurl/api/search/person?${params}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return "";
    const data: any = await res.json();

    return (data.results ?? []).slice(0, count).map((p: any) => {
      const pr = p.profile ?? {};
      const recentExp = (pr.experiences ?? []).slice(0, 2).map((e: any) =>
        [e.title, e.company, e.description && String(e.description).slice(0, 150)].filter(Boolean).join(" @ ")
      );
      const certifications = (pr.certifications ?? []).slice(0, 3).map((c: any) => c.name).filter(Boolean);
      const groups = (pr.groups ?? []).slice(0, 4).map((g: any) => g.name).filter(Boolean);
      const languages = (pr.languages ?? []).slice(0, 3).filter(Boolean);

      return [
        pr.full_name      && `Name: ${pr.full_name}`,
        pr.occupation     && `Role: ${pr.occupation}`,
        pr.headline       && `Headline: ${pr.headline}`,
        pr.summary        && `Summary: ${String(pr.summary).slice(0, 300)}`,
        pr.city           && `Location: ${[pr.city, pr.country_full_name].filter(Boolean).join(", ")}`,
        pr.skills?.length && `Skills: ${pr.skills.slice(0, 8).join(", ")}`,
        recentExp.length  && `Recent experience: ${recentExp.join(" | ")}`,
        certifications.length && `Certifications: ${certifications.join(", ")}`,
        groups.length     && `LinkedIn groups: ${groups.join(", ")}`,
        languages.length  && `Languages: ${languages.join(", ")}`,
        pr.recommendations_count && `Recommendations: ${pr.recommendations_count}`,
      ].filter(Boolean).join("\n");
    }).join("\n\n---\n\n");
  } catch { return ""; }
}

export async function POST(req: NextRequest) {
  let target: string, context: string, geography: string, research: any;
  try {
    ({ target, context, geography, research } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const geo = geography && geography !== "Global" ? geography : "";

  // Single Perplexity call covering both ICP examples AND job titles
  const icpSearch = await perplexitySearch(
    `For the market: "${target}"${geo ? ` in ${geo}` : ""}:
1. Give 3-4 specific real company examples with company name, size, and revenue range.
2. List 6-8 exact LinkedIn job titles of decision-makers who buy this type of service (comma-separated).`
  );

  // Parse job titles from combined response
  let titles: string[] = [];
  if (icpSearch) {
    const titleLine = icpSearch.match(/\d\.\s.*?titles?[^:]*:\s*([^\n]+)/i)?.[1] ?? "";
    titles = (titleLine || icpSearch)
      .split(/,|\n/)
      .map((t: string) => t.replace(/^[\d.\-*•\s"]+|["]+$/g, "").trim())
      .filter((t: string) => t.length > 4 && t.length < 60 && !/^\d/.test(t))
      .slice(0, 6);
  }
  if (titles.length < 3) {
    titles = ["Managing Director", "CEO", "Founder", "Head of Sales", "VP Sales", "Commercial Director"];
  }

  // ONE LinkedIn search with top titles
  const realPeopleData = await searchLinkedInPeople(titles.slice(0, 4), "", geo, 4);

  const hasLiveData = !!(icpSearch || realPeopleData);

  const liveBlock = hasLiveData ? `
=== LIVE ICP INTELLIGENCE ===
${icpSearch ? `[COMPANY EXAMPLES & DECISION-MAKER TITLES]\n${icpSearch}` : ""}
${realPeopleData ? `\n[REAL LINKEDIN PROFILES — mirror their language and patterns in personas]\n${realPeopleData}` : ""}
=== END LIVE INTELLIGENCE ===
` : "";

  const researchSummary = research ? `
KEY RESEARCH:
- Pain points: ${research.pain_points?.slice(0, 4).join("; ")}
- Buying triggers: ${research.buying_triggers?.slice(0, 3).join("; ")}
- Desires: ${research.desires?.slice(0, 3).join("; ")}
- Objections: ${research.objections?.slice(0, 2).join("; ")}
` : "";

  const prompt = `You are a world-class B2B go-to-market strategist.
Build a precise ICP and 3 detailed buyer personas for cold outreach.

Target: "${target}"
${context ? `Seller: "${context}"` : ""}
${geo ? `Geography: ${geo}` : ""}
${researchSummary}
${liveBlock}

INSTRUCTIONS:
${realPeopleData
    ? `- Use the REAL LinkedIn profiles above. Mirror their job titles, language, skills, and career patterns in personas.
- Their listed groups/certifications = their watering holes. Use them.`
    : "- No live LinkedIn data. Use best knowledge to build authentic personas."}
- Quotes must sound like something said on a real discovery call.
- Pain points = EMOTIONAL (how it feels) + OPERATIONAL (what it costs).
- Watering holes must be SPECIFIC named communities, newsletters, or events.

Return ONLY valid JSON — no markdown, no code fences.
CRITICAL JSON RULES:
- Never use double-quote characters (") inside string values. Use apostrophes (') instead.
- Never include raw newlines inside string values.
- No trailing commas after the last item in any array or object.

{
  "icp": {
    "industry": "Primary industry",
    "sub_niche": "Specific sub-niche",
    "company_size": "e.g. 10–50 employees",
    "revenue_range": "e.g. £1M–£5M",
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
      "linkedin_titles_matched": ["Real title if matched"],
      "company_stage": "e.g. Established recruitment agency, 25 staff",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "kpis": ["KPI 1", "KPI 2"],
      "pain_points": ["Emotional pain", "Operational pain", "Third pain"],
      "desires": ["Desire 1", "Aspiration 2", "Aspiration 3"],
      "objections": ["Objection 1", "Objection 2", "Objection 3"],
      "decision_process": "Who else is involved, timeline, what triggers yes",
      "platforms": ["LinkedIn", "platform2"],
      "watering_holes": ["Specific newsletter or community", "Specific event or podcast"],
      "daily_frustration": "One sentence frustration that makes them receptive",
      "quote": "Something they'd say on a sales call — authentic voice",
      "skills_profile": ["Skill 1", "Skill 2"]
    }
  ]
}`;

  try {
    const raw = await claude(prompt);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json({
      ...data,
      _meta: {
        live_research: hasLiveData,
        real_profiles_used: !!realPeopleData,
        linkedin_titles_searched: titles,
        sources: [
          icpSearch ? "Perplexity Sonar Pro" : null,
          realPeopleData ? "Proxycurl LinkedIn" : null,
          "Claude claude-sonnet-4-6",
        ].filter(Boolean),
      },
    });
  } catch (err: any) {
    console.error("ICP failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate ICP" }, { status: 500 });
  }
}
