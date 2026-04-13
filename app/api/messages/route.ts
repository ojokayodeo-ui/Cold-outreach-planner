import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 120;

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

function cleanJson(raw: string): string {
  return raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
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

  const prospectLine = companyName
    ? `\nPROSPECT COMPANY: "${companyName}"${websiteUrl ? ` (${websiteUrl})` : ""} — personalise every message to this specific company. Replace generic references with their company name, industry, or known details.`
    : "";

  const prompt = `You are a master cold email copywriter who has generated $10M+ in pipeline for B2B companies.

Write a complete outreach sequence for the following campaign. Every message must feel human, specific, and non-spammy. No corporate buzzwords. No "I hope this email finds you well."
${prospectLine}

CAMPAIGN BRIEF:
- Target market: "${target}"
${context ? `- Seller/service: "${context}"` : ""}
- ICP: ${icp?.industry ?? ""} / ${icp?.sub_niche ?? ""}, company size ${icp?.company_size ?? ""}

TARGET PERSONA:
- Name/role: ${persona?.title ?? "decision-maker"}
- Key pain point: ${persona?.pain_points?.[0] ?? "scaling their business"}
- Core desire: ${persona?.desires?.[0] ?? "predictable revenue growth"}
- Main objection: ${persona?.objections?.[0] ?? "already tried it"}
- Their quote (voice): "${persona?.quote ?? "we need more qualified leads"}"

CAMPAIGN ANGLE: "${angle?.name ?? "pain-based"}"
- Hook to use: ${angle?.sample_hook ?? ""}

OFFER/CTA: "${offer?.name ?? "free strategy call"}"
- CTA line: ${offer?.cta ?? "Would a quick call to discuss this make sense?"}

DELIVERABLES:

1. COLD EMAIL SEQUENCE (5 emails)
   - Email 1: Initial cold outreach (Day 1). 4–6 lines. Lead with the angle hook. One clear CTA.
   - Email 2: Follow-up (Day 4). Different angle/hook. Reference the first email subtly. No guilt-tripping.
   - Email 3: Value add (Day 8). Include a genuine insight, stat, or resource. Soft CTA.
   - Email 4: Pattern interrupt (Day 14). Short, direct, slightly cheeky. 2–3 lines max.
   - Email 5: Break-up email (Day 21). Professional close. Leave the door open.

   Rules for all emails:
   - Subject lines: 3–6 words, no spam triggers, no ALL CAPS, test curiosity or specificity
   - Bodies: under 150 words each
   - One CTA per email max
   - Write AS the seller (first person)
   - No attachments mentioned in early emails
   - Use {{first_name}} as the personalization placeholder
   ${companyName ? `- Replace {{company_name}} with "${companyName}" where relevant` : ""}

2. LINKEDIN CONNECTION REQUEST NOTE (under 300 characters, no hard sell)

3. LINKEDIN FOLLOW-UP MESSAGE (after connection accepted, 2–3 sentences, value-first)

4. 3–4 PERSONALIZATION HOOKS — specific triggers to look for on a prospect's LinkedIn/website that justify personalizing an outreach
   - Trigger: what to look for
   - Hook: how to open the email using that trigger
   - Example: a real-sounding personalized opener

Return ONLY valid JSON — no markdown, no explanation.

{
  "cold_email_sequence": [
    {
      "step": 1,
      "label": "Initial outreach",
      "subject": "Subject line",
      "body": "Full email body with {{first_name}} placeholder",
      "purpose": "What this email is trying to achieve",
      "timing": "Day 1"
    }
  ],
  "linkedin_connection_note": "Under 300 chars. No pitch.",
  "linkedin_follow_up": "2–3 sentences after they accept the connection.",
  "personalization_hooks": [
    {
      "trigger": "What to look for on their profile or company page",
      "hook": "How to use it as an opener",
      "example": "Hi {{first_name}}, saw you just [specific thing] — [relevant observation that bridges to your offer]"
    }
  ]
}`;

  try {
    const raw = await claude(prompt, 5000);
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
