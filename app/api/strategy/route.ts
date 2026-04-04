import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  return raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
}

async function claude(prompt: string, maxTokens = 4000): Promise<string> {
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
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

export async function POST(req: NextRequest) {
  const { target, context, geography, research, icpPersonas } = await req.json();
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const icp = icpPersonas?.icp;
  const personas = icpPersonas?.personas ?? [];

  const prompt = `You are a world-class cold outreach strategist.

Build a complete campaign strategy: 6 outreach angles (one per type), compelling offers, and lead magnets.

Target: "${target}"
${context ? `Seller: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
ICP: ${icp?.industry ?? ""} / ${icp?.sub_niche ?? ""}, ${icp?.company_size ?? ""}
Top pain points: ${research?.pain_points?.slice(0, 4).join("; ") ?? ""}
Overused messaging to avoid: ${research?.common_messaging?.slice(0, 3).join("; ") ?? ""}
Primary persona: ${personas[0]?.title ?? "decision-maker"} — pain: ${personas[0]?.pain_points?.[0] ?? ""}

Produce all 6 angle types: pain, opportunity, competitor, curiosity, data, authority.

Return ONLY valid JSON — no markdown.

{
  "angles": [
    {
      "name": "Angle name",
      "type": "pain|opportunity|competitor|curiosity|data|authority",
      "description": "What this angle does and why it resonates",
      "why_it_works": "Specific reason for THIS market and persona",
      "when_to_use": "Exact situation that makes this optimal",
      "effectiveness_score": 8,
      "sample_hook": "The actual hook line to use",
      "subject_line_example": "Email subject using this angle",
      "recommended": true
    }
  ],
  "recommended_angles": ["Name 1", "Name 2", "Name 3"],
  "offers": [
    {
      "name": "Offer name",
      "type": "service|audit|report|tool|consultation|trial",
      "description": "What they get and why it's valuable",
      "friction_level": "low|medium|high",
      "expected_conversion": "e.g. 8–12% reply rate",
      "cta": "The exact CTA sentence to use in email"
    }
  ],
  "lead_magnets": [
    {
      "name": "Lead magnet name",
      "format": "PDF|spreadsheet|video|audit|calculator|template|checklist",
      "description": "What it contains and who it's for",
      "value_proposition": "Why this persona would want it",
      "delivery": "How to deliver it"
    }
  ]
}`;

  try {
    const raw = await claude(prompt, 5000);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Strategy failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate strategy" }, { status: 500 });
  }
}
