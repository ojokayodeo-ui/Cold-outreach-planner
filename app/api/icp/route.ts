import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

const client = new Anthropic();

function cleanJson(raw: string): string {
  return raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  const { target, context, geography, research } = await req.json();

  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const researchSummary = research
    ? `
KEY RESEARCH INSIGHTS (use these to inform the ICP):
- Pain points: ${research.pain_points?.slice(0, 5).join("; ")}
- Buying triggers: ${research.buying_triggers?.slice(0, 4).join("; ")}
- Market maturity: ${research.market_overview?.maturity}
- Desires: ${research.desires?.slice(0, 4).join("; ")}
`
    : "";

  const prompt = `You are a world-class B2B go-to-market strategist.

Build a precise Ideal Customer Profile (ICP) and 3 detailed buyer personas for cold outreach campaigns targeting this market.

Target Market: "${target}"
${context ? `Seller Context: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
${researchSummary}

DELIVERABLES:

1. ICP — The exact company profile to target. Be specific on size, revenue, model, tech stack.
2. WHO NOT TO TARGET — Explicitly define companies/profiles to avoid (saves wasted outreach).
3. 3 Buyer Personas — Each a different decision-maker archetype with full psychological profile.

Persona guidelines:
- Give each a realistic first name (use it as their "persona name")
- Make each MEANINGFULLY DIFFERENT from the others (different title, company stage, psychology)
- Pain points must be EMOTIONAL + OPERATIONAL (how it feels + what it costs them)
- Desires should reveal what they secretly want (beyond surface-level goals)
- Decision process should describe HOW they actually buy (who else is involved, timeline)
- Watering holes = real communities, events, LinkedIn groups, podcasts they hang out in
- Quote = something they'd say in a sales call or LinkedIn post (in their own voice)

Return ONLY valid JSON — no markdown, no explanation.

{
  "icp": {
    "industry": "Primary industry",
    "sub_niche": "Specific sub-niche within the industry",
    "company_size": "e.g. 10–50 employees",
    "revenue_range": "e.g. $1M–$10M ARR",
    "geography": "Target geography",
    "business_model": "e.g. B2B SaaS / Agency / Professional Services",
    "tech_stack": ["tool1", "tool2", "tool3"],
    "buying_readiness": ["signal1 — what it looks like when they're ready to buy", "signal2"],
    "who_not_to_target": [
      "Company type or profile to avoid and why",
      "Another type to avoid"
    ],
    "segments": [
      {
        "name": "Segment name",
        "description": "2 sentences on who they are",
        "size_estimate": "e.g. ~5,000 companies in US",
        "priority": "high|medium|low"
      }
    ]
  },
  "personas": [
    {
      "id": "persona-1",
      "name": "Alex",
      "title": "Job title",
      "company_stage": "e.g. Series A SaaS, 30 employees",
      "goals": ["Goal 1", "Goal 2", "Goal 3"],
      "kpis": ["KPI they're measured on 1", "KPI 2"],
      "pain_points": [
        "Emotional pain: what they feel / how it affects them personally",
        "Operational pain: what it costs the business",
        "Another specific pain point"
      ],
      "desires": [
        "What they secretly want (beyond surface goals)",
        "Aspiration 2",
        "Aspiration 3"
      ],
      "objections": [
        "Objection they'd raise to a cold outreach",
        "Another objection",
        "Third objection"
      ],
      "decision_process": "How they actually decide — who else is involved, how long it takes, what triggers action",
      "platforms": ["LinkedIn", "Slack", "..."],
      "watering_holes": ["Specific community or event", "Podcast or newsletter they follow", "LinkedIn group"],
      "daily_frustration": "One-paragraph description of what their Monday morning feels like — the specific frustration that makes them receptive to a good pitch",
      "quote": "Something they'd genuinely say — in their voice — about their biggest problem or goal"
    }
  ]
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 5000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json(data);
  } catch (err) {
    console.error("ICP generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate ICP and personas." },
      { status: 500 }
    );
  }
}
