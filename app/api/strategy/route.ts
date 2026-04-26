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
  const prompt1 = `You are a world-class B2B cold outreach strategist and direct response copywriter. You understand offer psychology at a deep level.

${context_block}

OFFER PSYCHOLOGY — MANDATORY RULES:
A YES-driven offer has ALL of these:
1. SPECIFICITY: "Free 100-prospect lead list for [industry] in [city]" beats "free resources". Name exact numbers, deliverables, timeframes.
2. IMMEDIATE TANGIBLE VALUE: They can use it TODAY without scheduling a call. A list, a doc, a report, a done-for-them asset.
3. ZERO RISK: No credit card, no commitment, no obligation. Remove ALL friction.
4. PROVES YOUR CAPABILITY: The freebie demonstrates exactly what you do — getting it makes them want the paid version.
5. CURIOSITY + LOSS AVERSION: It reveals something they are currently MISSING or LOSING. Not just useful — revealing.
6. DONE-FOR-THEM > TEMPLATES: A pre-built asset tailored to them ("I built this for you") beats a generic template they have to fill in.

LEAD MAGNET EXCELLENCE — MANDATORY RULES:
Great lead magnets are SPECIFIC, TANGIBLE, and IMMEDIATELY USABLE:
- "100 verified decision-maker contacts in [niche] with LinkedIn URLs" (done-for-them list)
- "5 cold email sequences written for your exact offer, ready to send" (done-for-them copy)
- "Your competitor [X]'s exact acquisition strategy — reverse-engineered" (intelligence they can not get elsewhere)
- "Live audit of your current outreach: I will record a Loom showing exactly what is broken and how to fix it"
- "The 7 objections [persona title]s give and the exact word-for-word responses that close them"
- NOT: "Cold outreach guide", "Lead gen checklist", "Strategy template" — these are boring and generic

${jsonRules}

{
  "angles": [
    {
      "name": "Angle name",
      "type": "pain|opportunity",
      "description": "What this angle does and why it resonates with this specific market",
      "why_it_works": "Specific reason for THIS market — name the exact pain or opportunity being exploited",
      "when_to_use": "Exact situation that makes this the strongest possible angle",
      "effectiveness_score": 9,
      "sample_hook": "The actual hook line to use — specific, sharp, no fluff, written for THIS persona",
      "subject_line_example": "Email subject using this angle — curiosity or specificity, no spam triggers",
      "recommended": true,
      "psychological_principle": "Loss Aversion|Social Proof|FOMO|Scarcity|Pain Amplification|Reciprocity|Curiosity Gap|Identity",
      "urgency_mechanism": "Why this prospect should act THIS month, not next quarter — specific market/competitive/seasonal reason"
    }
  ],
  "recommended_angles": ["Name 1", "Name 2"],
  "offers": [
    {
      "name": "Offer name — be specific (e.g. '15-Minute Cold Email Teardown' not 'Free Audit')",
      "type": "done-for-you|audit|live-review|list|report|assessment|quick-win",
      "description": "Exactly what they receive, in concrete terms. Name the deliverable, the format, the timeframe.",
      "yes_driver": "The ONE psychological reason this gets a YES instantly — what do they lose by saying no?",
      "friction_level": "low",
      "expected_conversion": "Realistic reply rate for this market",
      "cta": "The exact CTA sentence — make it feel like a no-brainer, not a commitment"
    }
  ],
  "lead_magnets": [
    {
      "name": "Lead magnet name — specific and exciting (e.g. '100 Verified [Niche] Decision-Maker Contacts')",
      "format": "done-for-you list|live audit|recorded teardown|custom report|ready-to-send sequences|intelligence brief",
      "description": "Exactly what is inside — be specific. Numbers, names, deliverables.",
      "why_they_want_it_now": "The urgency/loss reason they want this immediately, not next week",
      "value_proposition": "What problem this solves and what result they get from using it",
      "delivery": "How and how fast they receive it",
      "email_sequence": [
        {
          "step": 1,
          "timing": "Instant delivery",
          "subject": "Punchy delivery subject — reference the specific thing they requested",
          "body": "3-4 sentences. Deliver the resource. Name one specific thing inside that will surprise them. Tell them what to do with it right now."
        },
        {
          "step": 2,
          "timing": "Day 3",
          "subject": "Follow-up — reference what they got",
          "body": "2-3 sentences. Ask one specific question about what they found. Share a surprising stat or insight related to what they received."
        },
        {
          "step": 3,
          "timing": "Day 7",
          "subject": "Add more value — give something else useful",
          "body": "2-3 sentences. Share one actionable tip they can use today. Soft CTA — reply or book — zero pressure."
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

Generate 10 angles — ALL must be type "pain" or "opportunity" ONLY (no curiosity, no authority, no competitor, no data angles). ALL must have effectiveness_score of 9 or 10 — if an angle is not at least a 9/10 for this specific market, do not include it, replace it with one that is. Each angle must use a DIFFERENT psychological_principle. Make every sample_hook and subject_line_example razor-sharp and written specifically for the persona and market above.

Generate 6 offers (ALL low friction, ALL specific and tangible, ALL YES-driven — apply the offer psychology rules above strictly), 6 lead magnets (ALL specific and exciting — done-for-you assets, intelligence briefs, verified lists, live teardowns — NOT generic PDFs or checklists), all 5 funnel stages.`;

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

  const prompt3 = `You are a world-class full-stack marketing strategist who builds complete go-to-market systems across every distribution channel.

${context_block}

${jsonRules}

Generate a comprehensive multi-channel marketing strategy tailored specifically to this market and ICP — not generic advice.

{
  "channel_strategy": [
    {
      "channel": "e.g. LinkedIn Organic",
      "tier": "primary|secondary|experimental",
      "goal": "The specific business outcome this channel drives for this market",
      "best_for": "What this channel does better than any other for this ICP",
      "content_types": ["Specific content type 1 for this market", "Specific content type 2"],
      "frequency": "e.g. 5x per week",
      "kpis": ["KPI 1", "KPI 2", "KPI 3"],
      "example_content": "A fully written example post, ad headline, or message for THIS specific market — not generic",
      "estimated_monthly_budget": "e.g. Time only | $500-1,500/mo | $2,000-5,000/mo",
      "time_to_results": "e.g. 30 days | 60-90 days | 6+ months"
    }
  ],
  "content_pillars": [
    {
      "pillar": "Pillar name",
      "purpose": "Why this content builds authority and trust with this specific ICP",
      "sample_topics": ["Specific topic written for this market 1", "Specific topic 2", "Specific topic 3", "Specific topic 4"],
      "best_channels": ["Channel 1", "Channel 2"],
      "content_format": "e.g. Long-form LinkedIn posts + short-form video",
      "posting_frequency": "e.g. 2x per week"
    }
  ],
  "paid_ads": [
    {
      "platform": "e.g. Meta Ads | Google Search | LinkedIn Ads | YouTube Ads | Twitter/X Ads",
      "ad_type": "e.g. Lead gen form | Retargeting | Search intent | Video awareness",
      "targeting_approach": "Specific targeting parameters for this ICP — job titles, interests, behaviours, keywords",
      "creative_angle": "The core message and emotion the ad triggers — written for this persona",
      "cta_offer": "Which specific offer or lead magnet to pair with this ad and why",
      "budget_recommendation": "Daily or monthly budget to test viably",
      "expected_cpl": "Realistic cost per lead estimate for this market",
      "timeline": "When to expect meaningful data and results"
    }
  ],
  "partnership_channels": [
    {
      "type": "e.g. Referral partners | Podcast appearances | Newsletter sponsorships | Co-marketing | Affiliate | Strategic alliances",
      "target_partners": "Specific types of businesses, creators, or people to partner with in this market",
      "value_exchange": "What each side gets — be specific",
      "outreach_approach": "The pitch angle — how to approach them and make it a no-brainer for them to say yes",
      "expected_outcome": "Leads, brand exposure, or revenue this channel realistically generates"
    }
  ],
  "marketing_roadmap": [
    {
      "phase": "Phase 1 — Foundation (Days 1-30)",
      "focus": "What to build, set up, and launch in the first 30 days",
      "channels_active": ["Channel 1", "Channel 2"],
      "key_actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "success_metric": "The number or signal that tells you this phase worked"
    },
    {
      "phase": "Phase 2 — Momentum (Days 31-60)",
      "focus": "What to add, optimise, and double down on",
      "channels_active": ["Channel 1", "Channel 2", "Channel 3"],
      "key_actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "success_metric": "The number or signal that tells you this phase worked"
    },
    {
      "phase": "Phase 3 — Scale (Days 61-90)",
      "focus": "What to scale, automate, and systemise",
      "channels_active": ["Channel 1", "Channel 2", "Channel 3", "Channel 4"],
      "key_actions": ["Specific action 1", "Specific action 2", "Specific action 3"],
      "success_metric": "The number or signal that tells you this phase worked"
    }
  ]
}

Generate: 7 channels covering the full mix (organic social, cold outreach, paid, content/SEO, community, partnerships, events/webinars — pick the 7 most relevant for this specific market and ICP), 4 content pillars with specific topics written for this market, 4 paid ad strategies on the most effective platforms for this ICP, 4 partnership channel types, and the full 3-phase 90-day roadmap. Every piece of output must be specific to the market and ICP above — no generic marketing advice.`;

  try {
    const [raw1, raw2, raw3] = await Promise.all([claude(prompt1), claude(prompt2), claude(prompt3)]);
    const data1 = JSON.parse(cleanJson(raw1));
    const data2 = JSON.parse(cleanJson(raw2));
    const data3 = JSON.parse(cleanJson(raw3));
    return NextResponse.json({ ...data1, ...data2, ...data3 });
  } catch (err: any) {
    console.error("Strategy failed:", err);
    return NextResponse.json({ error: err.message ?? "Failed to generate strategy" }, { status: 500 });
  }
}
