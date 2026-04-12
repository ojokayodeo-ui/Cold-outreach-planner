import os
import json
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def build_company_context(company_data: dict | None) -> str:
    if not company_data or not company_data.get("scraped"):
        return "No company website provided."

    parts = [f"Company URL: {company_data.get('url', '')}"]
    if company_data.get("title"):
        parts.append(f"Site title: {company_data['title']}")
    if company_data.get("meta_description"):
        parts.append(f"Description: {company_data['meta_description']}")
    if company_data.get("h1"):
        parts.append(f"Main headlines: {' | '.join(company_data['h1'])}")
    if company_data.get("h2"):
        parts.append(f"Sub-headlines: {' | '.join(company_data['h2'])}")
    if company_data.get("key_paragraphs"):
        parts.append("Key content:\n" + "\n".join(f"- {p}" for p in company_data["key_paragraphs"][:6]))

    return "\n".join(parts)


async def generate_report_stream(
    industry: str,
    what_selling: str,
    geography: str,
    company_data: dict | None,
):
    """Yields report sections as JSON strings via async generator."""
    company_ctx = build_company_context(company_data)
    has_company = bool(company_data and company_data.get("scraped"))

    personalization_note = (
        f"""
The sender's company has been analysed from their website. Use this context to:
- Name the sender company naturally in the outreach messages
- Reflect their tone, positioning, and offering
- Make the messages sound authentic to their brand

SENDER COMPANY CONTEXT:
{company_ctx}
"""
        if has_company
        else ""
    )

    prompt = f"""You are an elite B2B cold outreach strategist. Generate a comprehensive, highly detailed outreach intelligence report.

TARGET MARKET: {industry}
GEOGRAPHY: {geography}
WHAT THEY ARE SELLING: {what_selling or "Not specified — infer from industry context"}
{personalization_note}

Return a single valid JSON object with exactly these keys. Be extremely detailed and specific — this is a premium intelligence report.

{{
  "company_analysis": {{
    "company_name": "extracted or inferred company name (or 'Your Company' if none)",
    "what_they_do": "1-2 sentence summary of what the sender company does",
    "tone": "professional | casual | technical | consultative",
    "usp": "their apparent unique selling proposition",
    "positioning": "how they position themselves in the market"
  }},
  "market_research": {{
    "industry_overview": {{
      "summary": "comprehensive 3-4 sentence market overview",
      "maturity_stage": "emerging | growing | mature | declining",
      "market_size_estimate": "rough estimate with context",
      "key_dynamics": ["dynamic 1", "dynamic 2", "dynamic 3"]
    }},
    "pain_points": [
      {{"pain": "specific pain", "severity": "high|medium|low", "emotional_weight": "how it feels", "trigger": "what causes it"}}
    ],
    "buying_triggers": [
      {{"trigger": "event/situation", "example": "concrete example", "urgency": "high|medium|low"}}
    ],
    "objections": [
      {{"objection": "common objection", "root_cause": "why they say it", "counter": "how to handle it"}}
    ],
    "competitors": [
      {{"name": "competitor name", "positioning": "how they position", "weakness": "their weakness to exploit"}}
    ]
  }},
  "icp": {{
    "segment_name": "named segment",
    "segment_description": "detailed 2-3 sentence description",
    "firmographics": {{
      "employee_range": {{"min": 10, "max": 200}},
      "revenue_range": {{"min": "\u00a31M", "max": "\u00a350M", "currency": "GBP"}},
      "industries": ["industry 1", "industry 2"],
      "geographies": ["{geography}"],
      "business_models": ["model 1", "model 2"],
      "ownership": ["Private", "Owner-managed"]
    }},
    "buying_readiness_signals": [
      {{"signal": "signal name", "where_to_find": "LinkedIn / website / news", "strength": "strong|medium|weak"}}
    ],
    "exclusions": {{
      "who_not_to_target": ["exclusion 1", "exclusion 2"],
      "red_flags": ["flag 1", "flag 2"],
      "reasoning": "why these are excluded"
    }}
  }},
  "personas": [
    {{
      "persona_name": "The [Archetype]",
      "avatar_initials": "AB",
      "role": {{"titles": ["Title 1", "Title 2"], "seniority": "C-suite | Director | Manager"}},
      "day_in_their_life": "detailed paragraph about their typical day and pressures",
      "goals": {{"primary": "main goal", "secondary": ["goal 2", "goal 3"], "career_ambition": "what they want to achieve"}},
      "kpis": ["kpi 1", "kpi 2", "kpi 3"],
      "pain_points": {{"operational": ["pain 1", "pain 2"], "emotional": ["fear 1", "fear 2"]}},
      "desires": {{"immediate": "what they want now", "aspirational": "where they want to be"}},
      "objections": [{{"objection": "objection text", "real_reason": "underlying concern"}}],
      "language": {{"words_they_use": ["word 1", "word 2"], "resonant_phrases": ["phrase 1", "phrase 2"]}},
      "buying_trigger": "the specific moment/event that makes them ready to buy"
    }}
  ],
  "campaign": {{
    "recommended_angles": [
      {{
        "angle_type": "pain-based",
        "angle_name": "specific angle name",
        "core_premise": "what the angle is about",
        "why_it_works": "psychological reason",
        "hook_example": "example opening hook",
        "expected_reply_rate": "3-8%",
        "performance_rank": 1,
        "risk": "potential downside"
      }}
    ],
    "top_recommendation": {{"primary_angle": "angle name", "secondary_angle": "angle name", "reasoning": "why this combo"}},
    "offer_suggestions": [
      {{"offer_name": "offer", "offer_type": "audit|call|demo|report", "description": "what it is", "friction_level": "low|medium|high", "cta_text": "CTA wording"}}
    ],
    "lead_magnets": [
      {{"name": "magnet name", "format": "PDF|Video|Template", "topic": "topic", "why_they_want_it": "reason"}}
    ],
    "campaign_calendar": {{"best_send_days": ["Tuesday", "Wednesday", "Thursday"], "best_send_times": "8-10am or 4-6pm local time", "sequence_spacing": "3-4 days between emails"}}
  }},
  "messages": {{
    "email_sequence": [
      {{
        "position": 1,
        "send_day": 1,
        "email_type": "Cold opener",
        "subject_line": "compelling subject",
        "preview_text": "preview text (40 chars)",
        "body": "full email body — personalised, natural, no fluff",
        "personalisation_hook": "what to research per prospect",
        "cta": "specific call to action",
        "word_count": 120,
        "tone_notes": "tone guidance"
      }}
    ],
    "linkedin_messages": [
      {{"type": "Connection request | Follow-up | InMail", "body": "full message", "when_to_send": "timing guidance"}}
    ],
    "personalisation_guide": {{
      "research_time_per_prospect": "5-7 minutes",
      "key_signals_to_find": ["signal 1", "signal 2"],
      "hook_templates": [{{"trigger": "trigger event", "hook": "hook template text"}}]
    }},
    "spam_check": {{"spam_trigger_words_avoided": ["word 1"], "estimated_spam_score": "low", "deliverability_notes": "guidance"}}
  }}
}}

Include at least 5 pain points, 3 buying triggers, 3 objections, 2 personas, 3 campaign angles, 4 email sequence emails (days 1, 3, 7, 14), 3 LinkedIn messages.
{"Make ALL outreach messages sound authentically like they come from the sender company — reference their actual positioning and tone." if has_company else ""}
Return ONLY the JSON object, no markdown, no commentary."""

    with client.messages.stream(
        model="claude-opus-4-5",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    ) as stream:
        full_text = ""
        for text_chunk in stream.text_stream:
            full_text += text_chunk
            yield text_chunk

    return full_text
