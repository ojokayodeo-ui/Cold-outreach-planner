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
  const { target, context, geography } = await req.json();

  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const prompt = `You are a world-class B2B market research analyst specializing in cold outreach intelligence.

Analyze this target market and produce a structured research report used to plan cold outreach campaigns.

Target Market / Industry: "${target}"
${context ? `Seller Context (what they're selling): "${context}"` : ""}
${geography && geography !== "Global" ? `Geography Focus: ${geography}` : ""}

Produce a comprehensive report covering:
1. Market overview — size, maturity, growth rate, 5 key trends shaping this space right now
2. 4 representative competitor/player examples (real companies if well-known, realistic examples if niche)
3. 8–10 specific pain points decision-makers in this market face daily
4. 6–8 core desires and aspirations they have
5. 5–7 common objections they raise when approached by vendors
6. 5–6 buying triggers — specific events or signals that make them open to buy NOW
7. 3–4 market opportunities — gaps or angles a new entrant could exploit
8. 4–5 messaging patterns that are overused/saturated in this market (so we can differentiate)

Be SPECIFIC and REALISTIC. Use industry language. Avoid generic filler.

Return ONLY valid JSON — no markdown fences, no comments, no explanation outside the JSON.

{
  "market_overview": {
    "size": "estimated market size with source or basis",
    "maturity": "emerging|growing|mature|declining",
    "growth_rate": "e.g. 18% YoY",
    "key_trends": ["trend1", "trend2", "trend3", "trend4", "trend5"]
  },
  "competitors": [
    {
      "name": "Company or player name",
      "positioning": "How they position and differentiate",
      "strengths": ["strength1", "strength2", "strength3"],
      "weaknesses": ["weakness1", "weakness2"],
      "common_offer": "Their typical offer or entry-point pitch"
    }
  ],
  "pain_points": [
    "Specific pain point 1",
    "Specific pain point 2"
  ],
  "desires": [
    "Core desire 1",
    "Core desire 2"
  ],
  "objections": [
    "Common objection 1",
    "Common objection 2"
  ],
  "buying_triggers": [
    "Specific trigger event 1",
    "Specific trigger event 2"
  ],
  "market_opportunities": [
    "Opportunity or gap 1",
    "Opportunity or gap 2"
  ],
  "common_messaging": [
    "Overused message pattern 1",
    "Overused message pattern 2"
  ]
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const raw =
      response.content[0].type === "text" ? response.content[0].text : "";
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json(data);
  } catch (err) {
    console.error("Research generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate research report. Check your ANTHROPIC_API_KEY." },
      { status: 500 }
    );
  }
}
