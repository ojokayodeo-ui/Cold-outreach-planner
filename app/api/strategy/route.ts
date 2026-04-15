import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

function cleanJson(raw: string): string {
  let s = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  // Remove trailing commas before ] or }
  s = s.replace(/,(\s*[}\]])/g, "$1");
  // Replace literal newlines/carriage returns inside JSON string values with a space.
  // LLMs sometimes emit real \n inside string fields which breaks JSON.parse.
  s = s.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/\n/g, " ").replace(/\r/g, "")
  );
  return s;
}

async function claude(prompt: string, maxTokens = 14000): Promise<string> {
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
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

export async function POST(req: NextRequest) {
  let target: string, context: string, geography: string, research: any, icpPersonas: any;
  try {
    ({ target, context, geography, research, icpPersonas } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const icp = icpPersonas?.icp;
  const personas = icpPersonas?.personas ?? [];

  const context_block = `Target: "${target}"
${context ? `Seller: "${context}"` : ""}
${geography && geography !== "Global" ? `Geography: ${geography}` : ""}
ICP: ${icp?.industry ?? ""} / ${icp?.sub_niche ?? ""}, ${icp?.company_size ?? ""}
Top pain points: ${research?.pain_points?.slice(0, 4).join("; ") ?? ""}
Competitors in market: ${(research?.competitors ?? []).slice(0, 3).map((c: any) => c.name).join(", ")}
Overused messaging to avoid: ${research?.common_messaging?.slice(0, 3).join("; ") ?? ""}
Primary persona: ${personas[0]?.title ?? "decision-maker"} — pain: ${personas[0]?.pain_points?.[0] ?? ""}`;

  const jsonRules = `Return ONLY valid JSON — no markdown, no code fences, no explanation.
CRITICAL: Never use double-quote characters inside string values (use apostrophes instead). No trailing commas. No raw newlines inside strings.`;

  // Split into two parallel calls to keep each output small and reliable
  const prompt1 = `You are a world-class B2B cold outreach strategist.

${context_block}

${jsonRules}

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
      "recommended": true,
      "psychological_principle": "Loss Aversion|Social Proof|FOMO|Scarcity|Authority|Curiosity Gap|Reciprocity|Pain Amplification",
      "urgency_mechanism": "Why this prospect should act THIS month, not next quarter — specific market/competitive/personal reason"
    }
  ],
  "recommended_angles": ["Name 1", "Name 2"],
  "offers": [
    {
      "name": "Offer name",
      "type": "audit|report|tool|consultation|trial|checklist|assessment",
      "description": "What they get and why it is valuable — must be easy to say yes to",
      "friction_level": "low",
      "expected_conversion": "e.g. 8-12% reply rate",
      "cta": "The exact CTA sentence — soft, no-pressure ask"
    }
  ],
  "lead_magnets": [
    {
      "name": "Lead magnet name",
      "format": "PDF|spreadsheet|video|audit|calculator|template|checklist",
      "description": "What it contains and who it is for",
      "value_proposition": "Why this persona would want it",
      "delivery": "How to deliver it",
      "email_sequence": [
        {
          "step": 1,
          "timing": "Instant - on download",
          "subject": "Subject line for delivery email",
          "body": "Short 3-4 sentence delivery email. Deliver the resource, set expectation for follow-up."
        },
        {
          "step": 2,
          "timing": "Day 3",
          "subject": "Follow-up subject line",
          "body": "2-3 sentences. Ask if they reviewed it. Share one specific insight."
        },
        {
          "step": 3,
          "timing": "Day 7",
          "subject": "Value-add subject line",
          "body": "2-3 sentences. Share a related tip. Soft CTA to book a call or reply."
        }
      ]
    }
  ],
  "funnel": [
    {
      "stage": "Awareness",
      "objective": "Get on their radar with a relevant insight",
      "primary_message": "Core message for this stage",
      "cta": "Low-friction CTA",
      "channels": ["Cold email", "LinkedIn"],
      "content_ideas": ["Specific content that works here"],
      "offers_at_stage": ["Free resource"]
    },
    { "stage": "Interest", "objective": "...", "primary_message": "...", "cta": "...", "channels": ["..."], "content_ideas": ["..."], "offers_at_stage": ["..."] },
    { "stage": "Consideration", "objective": "...", "primary_message": "...", "cta": "...", "channels": ["..."], "content_ideas": ["..."], "offers_at_stage": ["..."] },
    { "stage": "Decision", "objective": "...", "primary_message": "...", "cta": "...", "channels": ["..."], "content_ideas": ["..."], "offers_at_stage": ["..."] },
    { "stage": "Fulfillment & Retention", "objective": "...", "primary_message": "...", "cta": "...", "channels": ["..."], "content_ideas": ["..."], "offers_at_stage": ["..."] }
  ]
}

Generate 10 angles (diverse: pain, opportunity, competitor, curiosity, data, authority — each with a DIFFERENT psychological_principle), 6 offers (ALL must be low friction — no discovery calls, no demos, no hard sells — think free audits, templates, assessments, quick wins, value-first consultations), 6 lead magnets each with a full 3-step email_sequence, all 5 funnel stages.
For outreach_math: use REALISTIC conversion rates for THIS market (${icp?.industry ?? "B2B"} / ${icp?.sub_niche ?? ""}).`;

  const prompt2 = `You are a world-class B2B cold outreach strategist.

${context_block}

${jsonRules}

{
  "competitor_offers": [
    {
      "competitor_type": "Type of competitor (e.g. Large generalist agency)",
      "typical_offer": "What they typically offer prospects",
      "pricing_model": "How they typically charge",
      "messaging_angle": "What angle they lead with",
      "weakness": "The gap you can exploit"
    }
  ],
  "competitor_messaging": [
    {
      "message_type": "Cold email / LinkedIn DM / Ad copy",
      "competitor_copy": "Realistic full example of what competitors send (3-5 sentences)",
      "why_it_underperforms": "What makes this ineffective or generic",
      "your_alternative": "A stronger version that stands out (3-5 sentences)"
    }
  ],
  "addon_services": [
    {
      "name": "Service name",
      "when_to_offer": "e.g. After first successful campaign / Month 3",
      "description": "What it includes",
      "value_prop": "Why existing clients want this",
      "revenue_potential": "e.g. +1500/mo per client"
    }
  ],
  "outreach_math": {
    "goal_calls_per_week": 10,
    "close_rate_pct": 20,
    "close_rate_note": "20% of positive responses convert to a booked call",
    "positive_responses_needed": 50,
    "channels": [
      {
        "name": "Cold Email",
        "open_rate_pct": 28,
        "reply_rate_pct": 4,
        "positive_reply_pct": 35,
        "effective_rate_pct": 0.28,
        "weekly_reach_needed": 3572,
        "daily_reach_needed": 510,
        "math_breakdown": "50 positive responses divided by 35% positive rate = 143 replies needed divided by 4% reply rate = 3572 emails/week"
      },
      {
        "name": "LinkedIn Outreach",
        "open_rate_pct": 60,
        "reply_rate_pct": 10,
        "positive_reply_pct": 45,
        "effective_rate_pct": 0.9,
        "weekly_reach_needed": 1111,
        "daily_reach_needed": 159,
        "math_breakdown": "50 positive responses divided by 45% positive rate = 112 replies needed divided by 10% reply rate = 1112 connection requests/week"
      }
    ],
    "recommended_mix": {
      "description": "Split effort across channels for best results",
      "allocation": [
        { "channel": "Cold Email", "weekly_volume": 2000, "expected_calls": 6 },
        { "channel": "LinkedIn", "weekly_volume": 500, "expected_calls": 4 }
      ],
      "total_weekly_reach": 2500,
      "total_calls_booked": 10
    },
    "assumptions": [
      "Personalised, research-backed outreach (not spray-and-pray)",
      "Targeted list with verified decision-maker contacts",
      "Follow-up sequence of 3-5 touches per prospect",
      "Compelling offer with clear value proposition"
    ]
  }
}

Generate 6 competitor offer profiles, 6 competitor messaging examples, 3 add-on services.
For outreach_math: use REALISTIC conversion rates for THIS market (${icp?.industry ?? "B2B"} / ${icp?.sub_niche ?? ""}). Recalculate all numbers accordingly.`;

  try {
    const [raw1, raw2] = await Promise.all([claude(prompt1), claude(prompt2)]);
    const data1 = JSON.parse(cleanJson(raw1));
    const data2 = JSON.parse(cleanJson(raw2));
    return NextResponse.json({ ...data1, ...data2 });
  } catch (err: any) {
    console.error("Strategy failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate strategy" }, { status: 500 });
  }
}
