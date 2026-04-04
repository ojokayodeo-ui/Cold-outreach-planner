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
  pain:       { border: "border-l-red-500/70",    badge: "red",    text: "text-red-400" },
  opportunity:{ border: "border-l-green-500/70",  badge: "green",  text: "text-green-400" },
  competitor: { border: "border-l-purple-500/70", badge: "purple", text: "text-purple-400" },
  curiosity:  { border: "border-l-orange-500/70", badge: "orange", text: "text-orange-400" },
  data:       { border: "border-l-blue-500/70",   badge: "blue",   text: "text-blue-400" },
  authority:  { border: "border-l-yellow-500/70", badge: "yellow", text: "text-yellow-400" },
};

const frictionBadge: Record<string, string> = {
  low: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  high: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function StepStrategy({
  data, personas, selectedPersona, selectedAngle, selectedOffer,
  onSelectPersona, onSelectAngle, onSelectOffer, onNext, loading,
}: Props) {
  if (!data) return null;
  const { angles = [], recommended_angles = [], offers = [], lead_magnets = [] } = data;

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
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">6 Campaign Angles</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {lead_magnets.map((lm: any, i: number) => (
              <Card key={i}>
                <Tag color="orange">{lm.format}</Tag>
                <p className="font-semibold text-[#e8e8f2] mt-2 mb-1">{lm.name}</p>
                <p className="text-xs text-[#a0a0c0] mb-2">{lm.description}</p>
                <p className="text-xs text-[#6060a0] mb-1">{lm.value_proposition}</p>
                <p className="text-xs text-blue-400 mt-2">↳ {lm.delivery}</p>
              </Card>
            ))}
          </div>
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
