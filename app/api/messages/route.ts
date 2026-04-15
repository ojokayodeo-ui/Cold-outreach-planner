import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

// system and user are split so the large stable systemText gets cached by Anthropic
// after the first call — subsequent calls skip reprocessing it (40-60% faster)
async function claude(systemText: string, userText: string, maxTokens = 8000): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "prompt-caching-2024-07-31",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system: [
        {
          type: "text",
          text: systemText,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userText }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error ${res.status}`);
  const data: any = await res.json();
  return data.content[0].text ?? "";
}

function cleanJson(raw: string): string {
  let s = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  s = s.replace(/,(\s*[}\]])/g, "$1");
  s = s.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/\n/g, " ").replace(/\r/g, "")
  );
  return s;
}

export async function POST(req: NextRequest) {
  let target: string, context: string, persona: any, angle: any, offer: any, icp: any, companyName: string, websiteUrl: string;
  try {
    ({ target, context, persona, angle, offer, icp, companyName, websiteUrl } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!target?.trim()) {
    return NextResponse.json({ error: "Target is required" }, { status: 400 });
  }

  const psychProfile = persona?.psychological_profile;

  // STABLE — cached by Anthropic after first call (~1500 tokens, reused across all users)
  const systemText = `You are a world-class direct response copywriter and behavioural psychologist. You have personally written campaigns that generated $50M+ in B2B pipeline. You understand human decision-making at a deep level.

You know these principles cold:
- LOSS AVERSION: Losses feel 2x more painful than equivalent gains. Lead with what they risk losing, not what they could gain.
- SOCIAL PROOF: People follow peers. Name-drop relevant companies or roles (not brands they aspire to — brands like them).
- FOMO: Fear of being left behind is more motivating than desire to get ahead.
- RECIPROCITY: Give something genuinely useful before asking for anything.
- CURIOSITY GAP: The brain craves closure. Open loops they must close.
- IDENTITY: People act consistently with how they see themselves. Speak to who they WANT to be.
- SCARCITY/URGENCY: Real urgency (market timing, competitor moves, capacity) converts. Fake urgency destroys trust.
- PATTERN INTERRUPT: Break their email-scanning autopilot with an unexpected opener.

NEVER WRITE:
- 'I hope this email finds you well'
- 'I wanted to reach out because...'
- 'We help companies like yours...'
- 'Would you be open to a quick 15-minute call?'
- 'I came across your profile and...'
- 'I know you are busy...'
- Buzzwords: synergy, leverage, solutions, ecosystem, journey, scalable, robust
- Vague claims without specifics

ALWAYS:
- Open with THEIR world, not yours (their situation, their pain, their context)
- Specificity > generality: real numbers, real situations, real consequences
- Pain before solution — they must feel the problem before they want the fix
- One CTA per email — make it embarrassingly easy to say yes
- Write to ONE human, not a department
- Sound like someone who actually researched them and gives a damn
- Use {{first_name}} as personalisation placeholder

EMAIL SEQUENCE STRUCTURE — use DELIBERATE psychological frameworks:

EMAIL 1 — Day 1 — HOOK + LOSS AVERSION
Framework: Open in their world (specific situation they recognise). Name what they are currently LOSING or RISKING. One proof point. Low-friction CTA.
Psychological trigger: Loss aversion — make the cost of inaction concrete and personal.
Length: 5-7 lines. Subject: 3-5 words, curiosity or specificity, no spam triggers.

EMAIL 2 — Day 5 — SOCIAL PROOF + FOMO
Framework: Open with what similar-sized peers are doing. Create mild FOMO — they are moving while your prospect stands still. Reframe the offer as the obvious next step.
Psychological trigger: Social proof + loss of competitive position.
Length: 5-6 lines. Different subject angle from email 1.

EMAIL 3 — Day 10 — RECIPROCITY + CURIOSITY GAP
Framework: Lead with a GENUINELY useful insight, stat, or framework. Give it freely. Then open a curiosity gap that only resolves if they reply.
Psychological trigger: Reciprocity + Curiosity Gap.
Length: 6-8 lines. No hard sell.

EMAIL 4 — Day 16 — PATTERN INTERRUPT + SCARCITY
Framework: Unexpected, slightly disarming opener. Real scarcity or urgency (capacity, timing, market window — never fake deadlines). Ultra-short.
Psychological trigger: Pattern interrupt + scarcity/urgency.
Length: 3-4 lines MAX.

EMAIL 5 — Day 23 — IDENTITY + OPEN DOOR
Framework: Speak to their professional identity. Acknowledge this may not be the right time. Leave the door open with grace and zero pressure.
Psychological trigger: Identity-based challenge + reciprocity.
Length: 4-5 lines. No hard sell.

ADDITIONAL DELIVERABLES:
- LINKEDIN CONNECTION NOTE: Under 280 chars. Reference something specific. Zero pitch.
- LINKEDIN FOLLOW-UP: 3 sentences. Their world first. Useful observation. Curiosity question.
- OBJECTION HANDLING: 3 objections with psychological_reason + 2-3 sentence response each.
- PERSONALISATION HOOKS: 4 specific LinkedIn/website triggers with psychological_angle + fully written example opener.

Return ONLY valid JSON — no markdown, no code fences.
CRITICAL: Never use double-quote characters inside string values (use apostrophes). No trailing commas. No raw newlines in strings.

Output this exact structure:
{
  "cold_email_sequence": [
    {
      "step": 1,
      "label": "Loss Aversion Hook",
      "subject": "Subject line",
      "body": "Full email body with {{first_name}}",
      "psychological_trigger": "Loss Aversion",
      "framework": "Open in their world → name the loss → proof → CTA",
      "purpose": "Make cost of inaction real",
      "timing": "Day 1"
    }
  ],
  "linkedin_connection_note": "Under 280 chars.",
  "linkedin_follow_up": "3 sentences.",
  "objection_handling": [
    {
      "objection": "Exact objection",
      "psychological_reason": "Why they are really saying this",
      "response": "2-3 sentence reply"
    }
  ],
  "personalization_hooks": [
    {
      "trigger": "Signal to look for",
      "psychological_angle": "Which principle this activates",
      "hook": "How to use it as an opener",
      "example": "Hi {{first_name}}, noticed you [specific thing] — [observation bridging to their pain]"
    }
  ]
}`;

  // VARIABLE — changes per campaign (persona, angle, offer, prospect)
  const userText = `${companyName ? `PROSPECT COMPANY: "${companyName}"${websiteUrl ? ` (${websiteUrl})` : ""} — weave their company name and situation into every message naturally.\n\n` : ""}CAMPAIGN CONTEXT:
- Target market: "${target}"
${context ? `- What we sell: "${context}"` : ""}
- ICP: ${icp?.industry ?? ""} / ${icp?.sub_niche ?? ""}, ${icp?.company_size ?? ""}

PERSONA — ${persona?.title ?? "decision-maker"}:
- Primary pain: ${persona?.pain_points?.[0] ?? "scaling efficiently"}
- Second pain: ${persona?.pain_points?.[1] ?? ""}
- Core desire: ${persona?.desires?.[0] ?? "predictable results"}
- Main objection: ${persona?.objections?.[0] ?? "already tried it"}
- Their voice: '${persona?.quote ?? "we need more qualified leads"}'
- Daily frustration: ${persona?.daily_frustration ?? ""}
${psychProfile ? `- Fear of inaction: ${psychProfile.fear_of_inaction ?? ""}
- Identity they want: ${psychProfile.identity_aspiration ?? ""}
- Emotional state: ${psychProfile.emotional_state ?? ""}
- Urgency triggers: ${(psychProfile.urgency_triggers ?? []).join("; ")}
- Status threat: ${psychProfile.status_threat ?? ""}
- Buying psychology: ${psychProfile.buying_psychology ?? ""}` : ""}

CAMPAIGN ANGLE: "${angle?.name ?? "pain-based"}" (${angle?.type ?? "pain"})
- Hook: ${angle?.sample_hook ?? ""}
- Psychological principle: ${angle?.psychological_principle ?? "Loss Aversion"}
- Urgency mechanism: ${angle?.urgency_mechanism ?? ""}

OFFER: "${offer?.name ?? "free strategy call"}"
- CTA: ${offer?.cta ?? "Worth a 20-min call to explore this?"}

Write the full 5-email sequence and all additional deliverables now.`;

  try {
    const raw = await claude(systemText, userText, 6000);
    const data = JSON.parse(cleanJson(raw));
    return NextResponse.json(data);
  } catch (err) {
    console.error("Message generation failed:", err);
    return NextResponse.json(
      { error: "Failed to generate outreach messages." },
      { status: 500 }
    );
  }
}
