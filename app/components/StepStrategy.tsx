"use client";
import { Card, CopyButton, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props {
  data: any;
  personas: any[];
  selectedPersona: number;
  selectedAngle: number;
  selectedOffer: number;
  onSelectPersona: (i: number) => void;
  onSelectAngle: (i: number) => void;
  onSelectOffer: (i: number) => void;
  onNext: () => void;
  loading: boolean;
}

const angleColors: Record<string, { border: string; badge: string; text: string }> = {
  pain:         { border: "border-l-red-500/70",    badge: "red",    text: "text-red-400" },
  opportunity:  { border: "border-l-green-500/70",  badge: "green",  text: "text-green-400" },
  competitor:   { border: "border-l-purple-500/70", badge: "purple", text: "text-purple-400" },
  curiosity:    { border: "border-l-orange-500/70", badge: "orange", text: "text-orange-400" },
  data:         { border: "border-l-blue-500/70",   badge: "blue",   text: "text-blue-400" },
  authority:    { border: "border-l-yellow-500/70", badge: "yellow", text: "text-yellow-400" },
  "social proof":{ border: "border-l-teal-500/70",  badge: "blue",   text: "text-teal-400" },
  urgency:      { border: "border-l-red-400/70",    badge: "red",    text: "text-red-300" },
  outcome:      { border: "border-l-green-400/70",  badge: "green",  text: "text-green-300" },
  reframe:      { border: "border-l-violet-500/70", badge: "purple", text: "text-violet-400" },
};

const frictionBadge: Record<string, string> = {
  low: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  high: "text-red-400 bg-red-500/10 border-red-500/30",
};

const funnelStageColors: Record<string, { bg: string; text: string; border: string; num: string }> = {
  awareness:    { bg: "bg-blue-500/10",   text: "text-blue-300",   border: "border-blue-500/30",   num: "bg-blue-500/20 text-blue-300" },
  interest:     { bg: "bg-purple-500/10", text: "text-purple-300", border: "border-purple-500/30", num: "bg-purple-500/20 text-purple-300" },
  consideration:{ bg: "bg-yellow-500/10", text: "text-yellow-300", border: "border-yellow-500/30", num: "bg-yellow-500/20 text-yellow-300" },
  intent:       { bg: "bg-orange-500/10", text: "text-orange-300", border: "border-orange-500/30", num: "bg-orange-500/20 text-orange-300" },
  conversion:   { bg: "bg-green-500/10",  text: "text-green-300",  border: "border-green-500/30",  num: "bg-green-500/20 text-green-300" },
};

const whenToOfferBadge: Record<string, string> = {
  "after close":     "text-green-400 bg-green-500/10 border-green-500/30",
  "during discovery":"text-blue-400 bg-blue-500/10 border-blue-500/30",
  "at renewal":      "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "mid-project":     "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
};

export default function StepStrategy({
  data, personas, selectedPersona, selectedAngle, selectedOffer,
  onSelectPersona, onSelectAngle, onSelectOffer, onNext, loading,
}: Props) {
  if (!data) return null;
  const {
    angles = [],
    recommended_angles = [],
    offers: allOffers = [],
    lead_magnets = [],
    funnel = [],
    competitor_offers = [],
    competitor_messaging = [],
    addon_services = [],
    outreach_math = null,
  } = data;
  const offers = allOffers.filter((o: any) => o.friction_level === "low" || o.friction_level === "soft");

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Campaign Strategy & Offers" />

      {/* Recommended banner */}
      {recommended_angles.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-blue-300 mb-1">Recommended Angles for This Market</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {recommended_angles.map((a: string, i: number) => (
              <span key={i} className="bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-3 py-0.5 text-sm">
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Angle Cards */}
      <div>
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">10 Campaign Angles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {angles.map((a: any, i: number) => {
            const colors = angleColors[a.type] ?? angleColors.data;
            return (
              <Card key={i} className={`border-l-4 ${colors.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tag color={colors.badge}>{a.type}</Tag>
                    {a.recommended && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full px-2 py-0.5">
                        ★ Recommended
                      </span>
                    )}
                  </div>
                  <span className={`text-lg font-bold ${colors.text}`}>{a.effectiveness_score}<span className="text-xs text-[#4a4a70">/10</span></span>
                </div>
                <p className="font-semibold text-[#e8e8f2] mb-1">{a.name}</p>
                <p className="text-xs text-[#6060a0] mb-3">{a.description}</p>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#4a4a70]">Why it works: </span>
                    <span className="text-[#a0a0c0]">{a.why_it_works}</span>
                  </div>
                  <div>
                    <span className="text-[#4a4a70]">Best used when: </span>
                    <span className="text-[#a0a0c0]">{a.when_to_use}</span>
                  </div>
                </div>
                {a.sample_hook && (
                  <div className="mt-3 bg-[#080810] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#4a4a70]">Sample Hook</span>
                      <CopyButton text={a.sample_hook} />
                    </div>
                    <p className="text-sm text-[#c0c0e0] italic">"{a.sample_hook}"</p>
                  </div>
                )}
                {a.subject_line_example && (
                  <div className="mt-2 flex items-center justify-between bg-[#080810] rounded-lg px-3 py-2">
                    <span className="text-xs text-[#6060a0]">Subject: <span className="text-[#a0a0c0] not-italic">{a.subject_line_example}</span></span>
                    <CopyButton text={a.subject_line_example} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Offers */}
      {offers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Compelling Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offers.map((o: any, i: number) => (
              <Card key={i}>
                <div className="flex items-center justify-between mb-2">
                  <Tag color="purple">{o.type}</Tag>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${frictionBadge[o.friction_level] ?? frictionBadge.medium}`}>
                    {o.friction_level} friction
                  </span>
                </div>
                <p className="font-semibold text-[#e8e8f2] mt-2 mb-1">{o.name}</p>
                <p className="text-xs text-[#a0a0c0] mb-3">{o.description}</p>
                <p className="text-xs text-[#6060a0] mb-3">Expected: {o.expected_conversion}</p>
                {o.cta && (
                  <div className="bg-[#080810] rounded-lg px-3 py-2 flex items-start justify-between gap-2">
                    <p className="text-xs text-green-300 italic flex-1">"{o.cta}"</p>
                    <CopyButton text={o.cta} />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Lead Magnets */}
      {lead_magnets.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Lead Magnets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lead_magnets.map((lm: any, i: number) => (
              <Card key={i}>
                <Tag color="orange">{lm.format}</Tag>
                <p className="font-semibold text-[#e8e8f2] mt-2 mb-1">{lm.name}</p>
                <p className="text-xs text-[#a0a0c0] mb-2">{lm.description}</p>
                <p className="text-xs text-[#6060a0] mb-1">{lm.value_proposition}</p>
                <p className="text-xs text-blue-400 mt-2 mb-3">↳ {lm.delivery}</p>
                {lm.email_sequence?.length > 0 && (
                  <div className="border-t border-[#1e1e35] pt-3">
                    <p className="text-xs font-semibold text-[#6060a0] uppercase tracking-wider mb-2">Follow-up Sequence</p>
                    <div className="space-y-2">
                      {lm.email_sequence.map((step: any, j: number) => (
                        <div key={j} className="bg-[#080810] rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#4f8ef7]">Step {step.step}</span>
                            <span className="text-xs text-[#4a4a70]">{step.timing}</span>
                          </div>
                          {step.subject && (
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs text-[#a0a0c0] flex-1">
                                <span className="text-[#4a4a70]">Subject: </span>{step.subject}
                              </p>
                              <CopyButton text={step.subject} />
                            </div>
                          )}
                          {step.body && (
                            <div className="flex items-start justify-between gap-1 mt-1">
                              <p className="text-xs text-[#6060a0] italic flex-1">{step.body}</p>
                              <CopyButton text={step.body} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Acquisition Funnel */}
      {funnel.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Acquisition Funnel</h3>
          <div className="flex flex-col gap-3">
            {funnel.map((stage: any, i: number) => {
              const stageKey = (stage.stage ?? "").toLowerCase();
              const colors = funnelStageColors[stageKey] ?? funnelStageColors.awareness;
              return (
                <div
                  key={i}
                  className={`flex gap-4 items-start rounded-xl border ${colors.border} ${colors.bg} p-4`}
                >
                  {/* Step number */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${colors.num}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.border} ${colors.bg} ${colors.text} uppercase tracking-wide`}>
                        {stage.stage}
                      </span>
                      {stage.objective && (
                        <span className="text-xs text-[#6060a0]">{stage.objective}</span>
                      )}
                    </div>
                    {stage.primary_message && (
                      <p className="text-sm text-[#c0c0e0] mb-2">{stage.primary_message}</p>
                    )}
                    {stage.cta && (
                      <p className="text-xs text-[#a0a0c0] mb-2">
                        <span className="text-[#4a4a70]">CTA: </span>{stage.cta}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {stage.channels?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs text-[#4a4a70] mr-1">Channels:</span>
                          {stage.channels.map((ch: string, j: number) => (
                            <Tag key={j} color="blue">{ch}</Tag>
                          ))}
                        </div>
                      )}
                      {stage.offers_at_stage?.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-xs text-[#4a4a70] mr-1">Offers:</span>
                          {stage.offers_at_stage.map((of: string, j: number) => (
                            <Tag key={j} color="purple">{of}</Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Competitor Offers */}
      {competitor_offers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Competitor Offers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitor_offers.map((co: any, i: number) => (
              <Card key={i} className="border-l-4 border-l-purple-500/50">
                <p className="font-semibold text-[#e8e8f2] mb-3">{co.competitor_type}</p>
                <div className="space-y-2 text-xs">
                  {co.typical_offer && (
                    <div>
                      <span className="text-[#4a4a70]">Typical Offer: </span>
                      <span className="text-[#a0a0c0]">{co.typical_offer}</span>
                    </div>
                  )}
                  {co.pricing_model && (
                    <div>
                      <span className="text-[#4a4a70]">Pricing Model: </span>
                      <span className="text-[#a0a0c0]">{co.pricing_model}</span>
                    </div>
                  )}
                  {co.messaging_angle && (
                    <div>
                      <span className="text-[#4a4a70]">Messaging Angle: </span>
                      <span className="text-[#a0a0c0]">{co.messaging_angle}</span>
                    </div>
                  )}
                  {co.weakness && (
                    <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <span className="text-green-400 font-semibold">Opportunity: </span>
                      <span className="text-green-300">{co.weakness}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Competitor Messaging */}
      {competitor_messaging.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Competitor Messaging</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitor_messaging.map((cm: any, i: number) => (
              <Card key={i}>
                {cm.message_type && (
                  <div className="mb-3">
                    <Tag color="red">{cm.message_type}</Tag>
                  </div>
                )}
                {cm.competitor_copy && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
                    <p className="text-xs text-red-300 italic">"{cm.competitor_copy}"</p>
                  </div>
                )}
                {cm.why_it_underperforms && (
                  <div className="mb-3 text-xs">
                    <span className="text-[#4a4a70]">Why it underperforms: </span>
                    <span className="text-[#a0a0c0]">{cm.why_it_underperforms}</span>
                  </div>
                )}
                {cm.your_alternative && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-green-400 font-semibold mb-1">Your Alternative</p>
                        <p className="text-xs text-green-300 italic">"{cm.your_alternative}"</p>
                      </div>
                      <CopyButton text={cm.your_alternative} />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add-on Services */}
      {addon_services.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Add-on Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {addon_services.map((as: any, i: number) => {
              const whenKey = (as.when_to_offer ?? "").toLowerCase();
              const whenStyle = whenToOfferBadge[whenKey] ?? "text-blue-400 bg-blue-500/10 border-blue-500/30";
              return (
                <Card key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-[#e8e8f2]">{as.name}</p>
                  </div>
                  {as.when_to_offer && (
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border mb-3 ${whenStyle}`}>
                      {as.when_to_offer}
                    </span>
                  )}
                  {as.description && (
                    <p className="text-xs text-[#a0a0c0] mb-2">{as.description}</p>
                  )}
                  {as.value_prop && (
                    <p className="text-xs text-[#6060a0] mb-3">{as.value_prop}</p>
                  )}
                  {as.revenue_potential && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                      <span className="text-xs text-green-400 font-semibold">Revenue Potential: </span>
                      <span className="text-xs text-green-300">{as.revenue_potential}</span>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Outreach Math */}
      {outreach_math && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Outreach Volume Calculator</h3>

          {/* Goal banner */}
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 mb-4">
            <div className="flex flex-wrap gap-6 items-center justify-between">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{outreach_math.goal_calls_per_week ?? 10}</div>
                <div className="text-xs text-[#555555] mt-1">Calls / Week Goal</div>
              </div>
              <div className="text-[#333333] text-2xl font-light hidden md:block">÷</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{outreach_math.close_rate_pct ?? 20}%</div>
                <div className="text-xs text-[#555555] mt-1">Close Rate</div>
              </div>
              <div className="text-[#333333] text-2xl font-light hidden md:block">=</div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{outreach_math.positive_responses_needed ?? 50}</div>
                <div className="text-xs text-[#555555] mt-1">Positive Responses Needed</div>
              </div>
              {outreach_math.close_rate_note && (
                <p className="w-full text-xs text-[#555555] border-t border-[#1a1a1a] pt-3 mt-1">{outreach_math.close_rate_note}</p>
              )}
            </div>
          </div>

          {/* Per-channel breakdown */}
          {outreach_math.channels?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {outreach_math.channels.map((ch: any, i: number) => (
                <Card key={i} className="border-l-4 border-l-blue-500/40">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-[#f0f0f0]">{ch.name}</p>
                    <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full px-3 py-0.5">
                      {ch.weekly_reach_needed?.toLocaleString()} / week
                    </span>
                  </div>
                  {/* Conversion rate mini-funnel */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {ch.open_rate_pct != null && (
                      <div className="bg-[#111111] rounded-lg p-2 text-center">
                        <div className="text-base font-bold text-yellow-400">{ch.open_rate_pct}%</div>
                        <div className="text-xs text-[#555555]">Open rate</div>
                      </div>
                    )}
                    <div className="bg-[#111111] rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-orange-400">{ch.reply_rate_pct}%</div>
                      <div className="text-xs text-[#555555]">Reply rate</div>
                    </div>
                    <div className="bg-[#111111] rounded-lg p-2 text-center">
                      <div className="text-base font-bold text-green-400">{ch.positive_reply_pct}%</div>
                      <div className="text-xs text-[#555555]">Positive</div>
                    </div>
                  </div>
                  {ch.daily_reach_needed != null && (
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-[#555555]">Daily volume needed</span>
                      <span className="font-semibold text-[#f0f0f0]">{ch.daily_reach_needed?.toLocaleString()} contacts/day</span>
                    </div>
                  )}
                  {ch.math_breakdown && (
                    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg px-3 py-2">
                      <p className="text-xs text-[#555555]">↳ {ch.math_breakdown}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Recommended mix */}
          {outreach_math.recommended_mix && (
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Recommended Weekly Mix</span>
                <span className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded-full px-2 py-0.5">
                  {outreach_math.recommended_mix.total_calls_booked} calls from {outreach_math.recommended_mix.total_weekly_reach?.toLocaleString()} contacts
                </span>
              </div>
              {outreach_math.recommended_mix.description && (
                <p className="text-xs text-[#555555] mb-3">{outreach_math.recommended_mix.description}</p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {outreach_math.recommended_mix.allocation?.map((a: any, i: number) => (
                  <div key={i} className="flex items-center justify-between bg-[#0a0a0a] rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-[#f0f0f0]">{a.channel}</p>
                      <p className="text-xs text-[#555555]">{a.weekly_volume?.toLocaleString()} contacts/week</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">{a.expected_calls}</p>
                      <p className="text-xs text-[#555555]">calls/week</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {outreach_math.assumptions?.length > 0 && (
            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-[#555555] uppercase tracking-wider mb-2">Assumptions</p>
              <ul className="space-y-1">
                {outreach_math.assumptions.map((a: string, i: number) => (
                  <li key={i} className="text-xs text-[#555555] flex items-start gap-2">
                    <span className="text-[#333333] mt-0.5">✓</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Selectors + CTA */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <p className="text-sm font-semibold text-blue-300 mb-4">Configure Your Outreach Sequence</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Write for persona</label>
            <select value={selectedPersona} onChange={e => onSelectPersona(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {personas.map((p: any, i: number) => <option key={i} value={i}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Campaign angle</label>
            <select value={selectedAngle} onChange={e => onSelectAngle(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {angles.map((a: any, i: number) => <option key={i} value={i}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Lead with offer</label>
            <select value={selectedOffer} onChange={e => onSelectOffer(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {offers.map((o: any, i: number) => <option key={i} value={i}>{o.name}</option>)}
            </select>
          </div>
        </div>
        <PrimaryButton onClick={onNext} disabled={loading} className="w-full">
          {loading ? "Writing Messages..." : "Generate Outreach Messages →"}
        </PrimaryButton>
      </Card>
    </div>
  );
}
