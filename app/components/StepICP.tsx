"use client";
import { Card, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props { data: any; onNext: () => void; loading: boolean; }

const priorityColor: Record<string, string> = { high: "green", medium: "yellow", low: "gray" };

export default function StepICP({ data, onNext, loading }: Props) {
  if (!data) return null;
  const { icp, personas = [] } = data;

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader title="Ideal Customer Profile & Buyer Personas" />

      {/* ICP */}
      <Card>
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-4">Ideal Customer Profile</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Industry", value: `${icp?.industry} / ${icp?.sub_niche}` },
            { label: "Company Size", value: icp?.company_size },
            { label: "Revenue Range", value: icp?.revenue_range },
            { label: "Geography", value: icp?.geography },
            { label: "Business Model", value: icp?.business_model },
          ].map(({ label, value }) => (
            <div key={label} className="bg-[#080810] rounded-lg p-3">
              <p className="text-xs text-[#6060a0]">{label}</p>
              <p className="text-sm text-[#e8e8f2] mt-0.5 font-medium">{value}</p>
            </div>
          ))}
        </div>
        {icp?.tech_stack?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-[#6060a0] mb-2">Tech Stack</p>
            <div className="flex flex-wrap gap-1.5">
              {icp.tech_stack.map((t: string, i: number) => <Tag key={i} color="purple">{t}</Tag>)}
            </div>
          </div>
        )}
        {icp?.buying_readiness?.length > 0 && (
          <div>
            <p className="text-xs text-[#6060a0] mb-2">Buying Readiness Signals</p>
            <ul className="space-y-1">
              {icp.buying_readiness.map((s: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                  <span className="text-green-400">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* Who NOT to target */}
      {icp?.who_not_to_target?.length > 0 && (
        <Card className="border border-red-500/30 bg-red-500/5">
          <h3 className="text-sm font-semibold text-red-400 mb-3">⛔ Who NOT to Target</h3>
          <ul className="space-y-2">
            {icp.who_not_to_target.map((w: string, i: number) => (
              <li key={i} className="flex gap-2 text-sm text-[#c0c0e0]">
                <span className="text-red-400 shrink-0">✕</span>{w}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ICP Segments */}
      {icp?.segments?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Market Segments</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {icp.segments.map((s: any, i: number) => (
              <Card key={i}>
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-[#e8e8f2] text-sm">{s.name}</p>
                  <Tag color={priorityColor[s.priority] ?? "gray"}>{s.priority}</Tag>
                </div>
                <p className="text-xs text-[#a0a0c0] mb-2">{s.description}</p>
                <p className="text-xs text-[#6060a0]">{s.size_estimate}</p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Personas */}
      {personas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Buyer Personas</h3>
          <div className="space-y-4">
            {personas.map((p: any, i: number) => (
              <Card key={i}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-blue-500/20 flex items-center justify-center text-lg font-bold text-blue-300 shrink-0">
                    {p.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-[#e8e8f2]">{p.name} — {p.title}</p>
                    <p className="text-xs text-[#6060a0]">{p.company_stage}</p>
                  </div>
                </div>

                {/* Quote */}
                {p.quote && (
                  <div className="bg-[#080810] border-l-2 border-blue-500/50 rounded-r-lg px-4 py-3 mb-4">
                    <p className="text-sm text-[#a0a0c0] italic">"{p.quote}"</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {/* Goals & KPIs */}
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Goals</p>
                    <ul className="space-y-1">
                      {(p.goals ?? []).map((g: string, j: number) => (
                        <li key={j} className="flex gap-2 text-[#c0c0e0]"><span className="text-green-400">→</span>{g}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">KPIs They're Measured On</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(p.kpis ?? []).map((k: string, j: number) => <Tag key={j} color="blue">{k}</Tag>)}
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Pain Points</p>
                    <ul className="space-y-1">
                      {(p.pain_points ?? []).map((pp: string, j: number) => (
                        <li key={j} className="flex gap-2 text-[#c0c0e0]"><span className="text-red-400 shrink-0">•</span>{pp}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Desires */}
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Desires</p>
                    <ul className="space-y-1">
                      {(p.desires ?? []).map((d: string, j: number) => (
                        <li key={j} className="flex gap-2 text-[#c0c0e0]"><span className="text-purple-400 shrink-0">✦</span>{d}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Objections */}
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Objections</p>
                    <ul className="space-y-1">
                      {(p.objections ?? []).map((o: string, j: number) => (
                        <li key={j} className="flex gap-2 text-[#c0c0e0]"><span className="text-orange-400 shrink-0">!</span>{o}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Decision Process */}
                  <div>
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Decision Process</p>
                    <p className="text-[#c0c0e0]">{p.decision_process}</p>
                  </div>

                  {/* Platforms & Watering Holes */}
                  <div className="md:col-span-2">
                    <p className="text-xs text-[#6060a0] uppercase tracking-wider mb-2">Where They Hang Out</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[...(p.platforms ?? []), ...(p.watering_holes ?? [])].map((w: string, j: number) => (
                        <Tag key={j} color="gray">{w}</Tag>
                      ))}
                    </div>
                  </div>

                  {/* Daily Frustration */}
                  {p.daily_frustration && (
                    <div className="md:col-span-2 bg-[#080810] rounded-lg p-3">
                      <p className="text-xs text-[#6060a0] mb-1">Their Monday Morning Feeling</p>
                      <p className="text-sm text-[#a0a0c0]">{p.daily_frustration}</p>
                    </div>
                  )}

                  {/* Psychological Profile */}
                  {p.psychological_profile && (
                    <div className="md:col-span-2 border border-[#2a1a4a] bg-purple-500/5 rounded-xl p-4">
                      <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Psychological Profile</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {p.psychological_profile.fear_of_inaction && (
                          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                            <p className="text-red-400 font-semibold mb-1">Fear of Inaction</p>
                            <p className="text-[#c0c0e0]">{p.psychological_profile.fear_of_inaction}</p>
                          </div>
                        )}
                        {p.psychological_profile.identity_aspiration && (
                          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                            <p className="text-blue-400 font-semibold mb-1">Identity Aspiration</p>
                            <p className="text-[#c0c0e0]">{p.psychological_profile.identity_aspiration}</p>
                          </div>
                        )}
                        {p.psychological_profile.status_threat && (
                          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                            <p className="text-orange-400 font-semibold mb-1">Status Threat</p>
                            <p className="text-[#c0c0e0]">{p.psychological_profile.status_threat}</p>
                          </div>
                        )}
                        {p.psychological_profile.buying_psychology && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                            <p className="text-green-400 font-semibold mb-1">Buying Psychology</p>
                            <p className="text-[#c0c0e0]">{p.psychological_profile.buying_psychology}</p>
                          </div>
                        )}
                        {p.psychological_profile.urgency_triggers?.length > 0 && (
                          <div className="md:col-span-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <p className="text-yellow-400 font-semibold mb-2">Urgency Triggers</p>
                            <ul className="space-y-1">
                              {p.psychological_profile.urgency_triggers.map((t: string, k: number) => (
                                <li key={k} className="flex gap-2 text-[#c0c0e0]"><span className="text-yellow-400 shrink-0">⚡</span>{t}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <PrimaryButton onClick={onNext} disabled={loading}>
          {loading ? "Building Strategy..." : "Build Campaign Strategy →"}
        </PrimaryButton>
      </div>
    </div>
  );
}
