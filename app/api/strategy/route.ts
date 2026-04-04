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
  const { target, context, geography, research, icpPersonas } = await req.json();

  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const icp = icpPersonas?.icp;
  const personas = icpPersonas?.personas ?? [];

  const contextBlock = `
Target Market: "${target}"
${context ? `Seller/Service Context: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}

ICP Summary:
- Industry: ${icp?.industry ?? "unknown"} / ${icp?.sub_niche ?? ""}
- Company size: ${icp?.company_size ?? ""}
- Business model: ${icp?.business_model ?? ""}
- Top pain points from research: ${research?.pain_points?.slice(0, 4).join("; ") ?? "not provided"}
- Buying triggers: ${research?.buying_triggers?.slice(0, 3).join("; ") ?? "not provided"}
- Common (overused) messaging to avoid: ${research?.common_messaging?.slice(0, 3).join("; ") ?? "not provided"}

Primary persona: ${personas[0]?.title ?? "decision-maker"} — main pain: ${personas[0]?.pain_points?.[0] ?? ""}
`;

  const prompt = `You are a world-class cold outreach strategist with a track record of booking meetings for B2B companies.

Build a complete campaign strategy including outreach angles, compelling offers, and lead magnets.

${contextBlock}

DELIVERABLES:

1. 6 CAMPAIGN ANGLES — one for each type: pain, opportunity, competitor, curiosity, data, authority.
   For each:
   - Explain WHY it works for this specific market (not generic theory)
   - WHEN to use it (what stage of awareness, what trigger)
   - Effectiveness score 1–10 based on this market
   - A specific sample hook (1–2 sentences) they could actually use
   - An example subject line for a cold email using this angle
   - Whether it's recommended as one of the top 2–3 angles

2. 3–4 COMPELLING OFFERS — what to offer in the outreach that gets replies.
   Each offer should be:
   - Specific to the ICP (not generic "free consultation")
   - Matched to a natural friction level (a "done-for-you audit" has lower friction than "6-month retainer")
   - Include the exact CTA line to use in the email

3. 2–3 LEAD MAGNETS — content assets that attract warm leads before the ask.
   Make them genuinely useful — something this persona would share with their team.

Return ONLY valid JSON — no markdown, no explanation.

{
  "angles": [
    {
      "name": "Angle name",
      "type": "pain|opportunity|competitor|curiosity|data|authority",
      "description": "What this angle does and why it resonates with the target",
      "why_it_works": "Specific reason this angle works for THIS market and persona",
      "when_to_use": "Exact situation or signal that makes this angle optimal",
      "effectiveness_score": 8,
      "sample_hook": "The actual hook line you'd use in an email or LinkedIn message",
      "subject_line_example": "An email subject line using this angle",
      "recommended": true
    }
  ],
  "recommended_angles": ["Angle name 1", "Angle name 2", "Angle name 3"],
  "offers": [
    {
      "name": "Offer name",
      "type": "service|audit|report|tool|consultation|trial",
      "description": "What they get and why it's valuable",
      "friction_level": "low|medium|high",
      "expected_conversion": "e.g. 8–12% reply rate as a CTA in cold email",
      "cta": "The exact CTA sentence to use — e.g. 'Would a 15-minute audit of your current outreach be useful?'"
    }
  ],
  "lead_magnets": [
    {
      "name": "Lead magnet name",
      "format": "PDF|spreadsheet|video|audit|calculator|template|checklist",
      "description": "What it contains and who it's for",
      "value_proposition": "Why this persona would want it — what problem it solves",
      "delivery": "How to deliver it — e.g. 'Link in LinkedIn DM follow-up after connection'"
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
    console.error("Strategy generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate campaign strategy." },
      { status: 500 }
    );
  }
}
