"use client";
import { useState } from "react";
import { Card, CopyButton, SectionHeader, Tag, PrimaryButton } from "./ui";

interface Props {
  data: any;
  personas: any[];
  angles: any[];
  offers: any[];
  selectedPersona: number;
  selectedAngle: number;
  selectedOffer: number;
  onSelectPersona: (i: number) => void;
  onSelectAngle: (i: number) => void;
  onSelectOffer: (i: number) => void;
  onRegenerate: () => void;
  onReset: () => void;
  loading: boolean;
}

export default function StepMessages({
  data, personas, angles, offers,
  selectedPersona, selectedAngle, selectedOffer,
  onSelectPersona, onSelectAngle, onSelectOffer,
  onRegenerate, onReset, loading,
}: Props) {
  const [activeEmail, setActiveEmail] = useState(0);
  if (!data) return null;

  const {
    cold_email_sequence = [],
    linkedin_connection_note = "",
    linkedin_follow_up = "",
    personalization_hooks = [],
  } = data;

  const email = cold_email_sequence[activeEmail];

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionHeader
        title="Outreach Sequences"
        subtitle={`${personas[selectedPersona]?.title ?? ""} · ${angles[selectedAngle]?.name ?? ""} angle`}
      />

      {/* Selectors + Regenerate */}
      <Card className="border-[#2a2a45]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Persona</label>
            <select value={selectedPersona} onChange={e => onSelectPersona(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {personas.map((p: any, i: number) => <option key={i} value={i}>{p.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Angle</label>
            <select value={selectedAngle} onChange={e => onSelectAngle(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {angles.map((a: any, i: number) => <option key={i} value={i}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[#6060a0] block mb-1">Offer</label>
            <select value={selectedOffer} onChange={e => onSelectOffer(+e.target.value)}
              className="w-full bg-[#080810] border border-[#2a2a45] rounded-lg px-3 py-2 text-sm text-[#e8e8f2] focus:outline-none focus:border-[#4f8ef7]">
              {offers.map((o: any, i: number) => <option key={i} value={i}>{o.name}</option>)}
            </select>
          </div>
        </div>
        <button onClick={onRegenerate} disabled={loading}
          className="w-full py-2 border border-[#2a2a45] rounded-lg text-sm text-[#6060a0] hover:text-[#e8e8f2] hover:border-[#4f8ef7] disabled:opacity-40 transition-colors">
          {loading ? "Regenerating..." : "↺ Regenerate with new selections"}
        </button>
      </Card>

      {/* Email Sequence */}
      {cold_email_sequence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Cold Email Sequence</h3>
          {/* Tab Bar */}
          <div className="flex gap-1 mb-4 bg-[#0f0f1a] border border-[#1e1e35] rounded-xl p-1 overflow-x-auto">
            {cold_email_sequence.map((e: any, i: number) => (
              <button key={i} onClick={() => setActiveEmail(i)}
                className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activeEmail === i
                    ? "bg-[#4f8ef7] text-white"
                    : "text-[#6060a0] hover:text-[#e8e8f2]"
                }`}>
                {e.label ?? `Email ${i + 1}`}
              </button>
            ))}
          </div>

          {/* Active Email */}
          {email && (
            <Card className="animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-[#080810] border border-[#2a2a45] rounded-full px-2 py-0.5 text-[#6060a0]">
                  {email.timing}
                </span>
                <span className="text-xs text-[#4a4a70]">{email.purpose}</span>
              </div>

              {/* Subject */}
              <div className="bg-[#080810] rounded-lg px-4 py-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#6060a0]">Subject Line</span>
                  <CopyButton text={email.subject} />
                </div>
                <p className="text-sm font-medium text-[#e8e8f2]">{email.subject}</p>
              </div>

              {/* Body */}
              <div className="bg-[#080810] rounded-lg px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#6060a0]">Email Body</span>
                  <CopyButton text={email.body} label="Copy Email" />
                </div>
                <pre className="text-sm text-[#c0c0e0] whitespace-pre-wrap font-sans leading-relaxed">
                  {email.body}
                </pre>
              </div>

              {/* Copy full email */}
              <div className="mt-3 flex justify-end">
                <CopyButton
                  text={`Subject: ${email.subject}\n\n${email.body}`}
                  label="Copy Full Email"
                />
              </div>
            </Card>
          )}
        </div>
      )}

      {/* LinkedIn */}
      <div>
        <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">LinkedIn Outreach</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {linkedin_connection_note && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#e8e8f2]">Connection Request Note</p>
                <CopyButton text={linkedin_connection_note} />
              </div>
              <p className="text-xs text-[#6060a0] mb-2">Under 300 characters — no hard sell</p>
              <p className="text-sm text-[#c0c0e0]">{linkedin_connection_note}</p>
              <p className="text-xs text-[#4a4a70] mt-2">{linkedin_connection_note.length} / 300 chars</p>
            </Card>
          )}
          {linkedin_follow_up && (
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-[#e8e8f2]">Follow-up Message</p>
                <CopyButton text={linkedin_follow_up} />
              </div>
              <p className="text-xs text-[#6060a0] mb-2">After connection accepted</p>
              <p className="text-sm text-[#c0c0e0]">{linkedin_follow_up}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Personalization Hooks */}
      {personalization_hooks.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#a0a0c0] uppercase tracking-wider mb-3">Personalization Hooks</h3>
          <div className="space-y-3">
            {personalization_hooks.map((h: any, i: number) => (
              <Card key={i}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-[#6060a0] mb-1">Look for</p>
                    <p className="text-[#c0c0e0]">{h.trigger}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6060a0] mb-1">Use it as</p>
                    <p className="text-[#c0c0e0]">{h.hook}</p>
                  </div>
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-[#6060a0] mb-1">Example opener</p>
                        <p className="text-[#a0a0c0] italic text-xs">"{h.example}"</p>
                      </div>
                      <CopyButton text={h.example} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#1e1e35]">
        <p className="text-xs text-[#4a4a70]">Analysis complete · {cold_email_sequence.length} emails · {personalization_hooks.length} hooks generated</p>
        <button onClick={onReset}
          className="px-4 py-2 rounded-lg border border-[#2a2a45] text-sm text-[#6060a0] hover:text-[#e8e8f2] hover:border-[#4f8ef7] transition-colors">
          ← Start New Analysis
        </button>
      </div>
    </div>
  );
}
