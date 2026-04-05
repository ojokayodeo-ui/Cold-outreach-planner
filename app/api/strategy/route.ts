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

export async function POST(req: NextRequest) {
  const { target, context, geography, research, icpPersonas } = await req.json();
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const icp = icpPersonas?.icp;
  const personas = icpPersonas?.personas ?? [];

  const prompt = `You are a world-class B2B cold outreach and customer acquisition strategist.

Build a complete go-to-market strategy covering: outreach angles, offers, acquisition funnel, competitor intelligence, and add-on services.

Target: "${target}"
${context ? `Seller: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
ICP: ${icp?.industry ?? ""} / ${icp?.sub_niche ?? ""}, ${icp?.company_size ?? ""}
Top pain points: ${research?.pain_points?.slice(0, 4).join("; ") ?? ""}
Competitors in market: ${(research?.competitors ?? []).slice(0, 3).map((c: any) => c.name).join(", ")}
Overused messaging to avoid: ${research?.common_messaging?.slice(0, 3).join("; ") ?? ""}
Primary persona: ${personas[0]?.title ?? "decision-maker"} — pain: ${personas[0]?.pain_points?.[0] ?? ""}

Return ONLY valid JSON — no markdown, no explanation.

{
  "angles": [
    {
      "name": "Angle name",
      "type": "pain|opportunity|competitor|curiosity|data|authority",
      "description": "What this angle does and why it resonates",
      "why_it_works": "Specific reason for THIS market",
      "when_to_use": "Exact situation that makes this optimal",
      "effectiveness_score": 8,
      "sample_hook": "The actual hook line to use",
      "subject_line_example": "Email subject using this angle",
      "recommended": true
    }
  ],
  "recommended_angles": ["Name 1", "Name 2"],
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
  ],
  "funnel": [
    {
      "stage": "Awareness",
      "objective": "Get on their radar with a relevant insight",
      "primary_message": "The core message/angle for this stage",
      "cta": "Low-friction CTA for this stage",
      "channels": ["Cold email", "LinkedIn"],
      "content_ideas": ["Specific content that works here"],
      "offers_at_stage": ["Free resource", "Value-first content"]
    },
    {
      "stage": "Interest",
      "objective": "...",
      "primary_message": "...",
      "cta": "...",
      "channels": ["..."],
      "content_ideas": ["..."],
      "offers_at_stage": ["..."]
    },
    {
      "stage": "Consideration",
      "objective": "...",
      "primary_message": "...",
      "cta": "...",
      "channels": ["..."],
      "content_ideas": ["..."],
      "offers_at_stage": ["..."]
    },
    {
      "stage": "Decision",
      "objective": "...",
      "primary_message": "...",
      "cta": "...",
      "channels": ["..."],
      "content_ideas": ["..."],
      "offers_at_stage": ["..."]
    },
    {
      "stage": "Fulfillment & Retention",
      "objective": "...",
      "primary_message": "...",
      "cta": "...",
      "channels": ["..."],
      "content_ideas": ["..."],
      "offers_at_stage": ["..."]
    }
  ],
  "competitor_offers": [
    {
      "competitor_type": "Type of competitor (e.g. 'Large generalist agency')",
      "typical_offer": "What they typically offer prospects",
      "pricing_model": "How they typically charge",
      "messaging_angle": "What angle they lead with",
      "weakness": "The gap you can exploit"
    }
  ],
  "competitor_messaging": [
    {
      "message_type": "Cold email / LinkedIn DM / Ad copy",
      "competitor_copy": "Realistic example of what competitors send — actual words they use",
      "why_it_underperforms": "What makes this ineffective or generic",
      "your_alternative": "A stronger version that stands out"
    }
  ],
  "addon_services": [
    {
      "name": "Service name",
      "when_to_offer": "e.g. After first successful campaign / Month 3",
      "description": "What it includes",
      "value_prop": "Why existing clients want this",
      "revenue_potential": "e.g. +£1,500/mo per client"
    }
  ]
}

Generate 5 angles (mix of types), 3 offers, 2 lead magnets, all 5 funnel stages, 3 competitor offer profiles, 3 competitor messaging examples, 3 add-on services.`;

  try {
    const raw = await claude(prompt);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Strategy failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate strategy" }, { status: 500 });
  }
}
