"use client";

import { useEffect, useState } from "react";
import StepInput from "./components/StepInput";
import StepResearch from "./components/StepResearch";
import StepICP from "./components/StepICP";
import StepStrategy from "./components/StepStrategy";
import StepMessages from "./components/StepMessages";
import { Loader, ErrorBox } from "./components/ui";
import GoogleDriveExport from "./components/GoogleDriveExport";
import ProspectReport from "./components/ProspectReport";

const STEPS = ["Input", "Research", "ICP & Personas", "Strategy", "Messages"];

const LOADING_TEXT: Record<number, string> = {
  0: "Analyzing market...",
  1: "Building ICP & personas...",
  2: "Crafting campaign strategy...",
  3: "Writing outreach sequences...",
};

const STORAGE_KEY = "cold-outreach-session";

function loadSession() {
  if (typeof window === "undefined") return {} as Record<string, any>;
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, any>;
  } catch {
    return {} as Record<string, any>;
  }
}

export default function ColdOutreachApp() {
  const [step, setStep] = useState<number>(() => loadSession().step ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProspect, setShowProspect] = useState(false);

  // Input
  const [input, setInput] = useState<{ target: string; context: string; geography: string; websiteUrl: string }>(
    () => loadSession().input ?? { target: "", context: "", geography: "Global", websiteUrl: "" }
  );

  // Generated data
  const [research, setResearch] = useState<any>(() => loadSession().research ?? null);
  const [icpData, setIcpData] = useState<any>(() => loadSession().icpData ?? null);
  const [strategy, setStrategy] = useState<any>(() => loadSession().strategy ?? null);
  const [messages, setMessages] = useState<any>(() => loadSession().messages ?? null);

  // Selections for messages
  const [selectedPersona, setSelectedPersona] = useState<number>(() => loadSession().selectedPersona ?? 0);
  const [selectedAngle, setSelectedAngle] = useState<number>(() => loadSession().selectedAngle ?? 0);
  const [selectedOffer, setSelectedOffer] = useState<number>(() => loadSession().selectedOffer ?? 0);

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step, input, research, icpData, strategy, messages, selectedPersona, selectedAngle, selectedOffer })
    );
  }, [step, input, research, icpData, strategy, messages, selectedPersona, selectedAngle, selectedOffer]);


  const handleInputChange = (k: string, v: string) =>
    setInput(prev => ({ ...prev, [k]: v }));

  async function callAPI(path: string, body: object) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      // Server returned non-JSON (HTML error/timeout page)
      if (res.status === 504 || res.status === 502) throw new Error("Request timed out — please try again.");
      throw new Error(`Server error (${res.status}) — please try again.`);
    }
    if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
    return data;
  }

  async function generateResearch() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAPI("/api/research", {
        target: input.target,
        context: input.context,
        geography: input.geography,
        websiteUrl: input.websiteUrl,
      });
      setResearch(data);
      setStep(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateICP() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAPI("/api/icp", {
        target: input.target,
        context: input.context,
        geography: input.geography,
        research,
      });
      setIcpData(data);
      setStep(2);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateStrategy() {
    setLoading(true);
    setError(null);
    try {
      const data = await callAPI("/api/strategy", {
        target: input.target,
        context: input.context,
        geography: input.geography,
        research,
        icpPersonas: icpData,
      });
      setStrategy(data);
      setStep(3);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateMessages(pIdx = selectedPersona, aIdx = selectedAngle, oIdx = selectedOffer) {
    setLoading(true);
    setError(null);
    try {
      const data = await callAPI("/api/messages", {
        target: input.target,
        context: input.context,
        icp: icpData?.icp,
        persona: icpData?.personas?.[pIdx],
        angle: strategy?.angles?.[aIdx],
        offer: strategy?.offers?.[oIdx],
        companyName: research?.website_analysis?.company_name ?? "",
        websiteUrl: input.websiteUrl ?? "",
      });
      setMessages(data);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setStep(0);
    setResearch(null);
    setIcpData(null);
    setStrategy(null);
    setMessages(null);
    setError(null);
    setInput({ target: "", context: "", geography: "Global", websiteUrl: "" });
    setSelectedPersona(0);
    setSelectedAngle(0);
    setSelectedOffer(0);
  }

  const personas = icpData?.personas ?? [];
  const angles = strategy?.angles ?? [];
  const offers = strategy?.offers ?? [];
  const companyName: string = research?.website_analysis?.company_name ?? "";

  return (
    <div className="min-h-screen bg-[#000000]">
      {showProspect && (
        <ProspectReport
          sellerContext={input.context}
          geography={input.geography}
          onClose={() => setShowProspect(false)}
        />
      )}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#080810]/90 backdrop-blur border-b border-[#1e1e35]">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[#4f8ef7] text-lg">◆</span>
            <span className="font-semibold text-[#e8e8f2] text-sm">Cold Outreach Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            {step === 4 && messages && (
              <GoogleDriveExport
                input={input}
                research={research}
                icpData={icpData}
                strategy={strategy}
                messages={messages}
                selectedPersona={selectedPersona}
                selectedAngle={selectedAngle}
                selectedOffer={selectedOffer}
              />
            )}
            <button
              onClick={() => setShowProspect(true)}
              className="text-xs text-[#a0a0c0] hover:text-white border border-[#1a1a1a] hover:border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              🔍 Prospect Report
            </button>
            {step > 0 && (
              <button
                onClick={handleReset}
                className="text-xs text-[#6060a0] hover:text-[#e8e8f2] border border-[#2a2a45] hover:border-[#4f8ef7] px-3 py-1.5 rounded-lg transition-colors"
              >
                + New Analysis
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Step Progress (hidden on input step) */}
      {step > 0 && (
        <div className="border-b border-[#1e1e35] bg-[#0a0a14]">
          <div className="max-w-5xl mx-auto px-4 py-3">
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                const hasData = [
                  true,
                  research !== null,
                  icpData !== null,
                  strategy !== null,
                  messages !== null,
                ][i];
                const clickable = hasData && !active && !loading;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => clickable && setStep(i)}
                        disabled={!clickable}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                          done
                            ? clickable
                              ? "bg-[#4f8ef7] border-[#4f8ef7] text-white hover:bg-[#3a7ae0] cursor-pointer"
                              : "bg-[#4f8ef7] border-[#4f8ef7] text-white"
                            : active
                            ? "border-[#4f8ef7] text-[#4f8ef7]"
                            : "border-[#2a2a45] text-[#4a4a70]"
                        }`}
                      >
                        {done ? "✓" : i + 1}
                      </button>
                      <button
                        onClick={() => clickable && setStep(i)}
                        disabled={!clickable}
                        className={`text-xs font-medium hidden sm:block transition-colors ${
                          active
                            ? "text-[#e8e8f2]"
                            : done
                            ? clickable
                              ? "text-[#6060a0] hover:text-[#a0a0c0] cursor-pointer"
                              : "text-[#6060a0]"
                            : "text-[#4a4a70]"
                        }`}
                      >
                        {s}
                      </button>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-3 ${done ? "bg-[#4f8ef7]/50" : "bg-[#1e1e35]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6">
            <ErrorBox message={error} onRetry={() => setError(null)} />
          </div>
        )}

        {loading && step < 4 && (
          <Loader text={LOADING_TEXT[step] ?? "Generating..."} />
        )}

        {!loading && (
          <>
            {step === 0 && (
              <StepInput
                input={input}
                onChange={handleInputChange}
                onSubmit={generateResearch}
                loading={loading}
              />
            )}
            {step === 1 && research && (
              <StepResearch
                data={research}
                target={input.target}
                onNext={generateICP}
                loading={loading}
              />
            )}
            {step === 2 && icpData && (
              <StepICP
                data={icpData}
                onNext={generateStrategy}
                loading={loading}
              />
            )}
            {step === 3 && strategy && (
              <StepStrategy
                data={strategy}
                personas={personas}
                selectedPersona={selectedPersona}
                selectedAngle={selectedAngle}
                selectedOffer={selectedOffer}
                onSelectPersona={setSelectedPersona}
                onSelectAngle={setSelectedAngle}
                onSelectOffer={setSelectedOffer}
                onNext={() => generateMessages()}
                loading={loading}
              />
            )}
            {step === 4 && messages && (
              <StepMessages
                data={messages}
                personas={personas}
                angles={angles}
                offers={offers}
                selectedPersona={selectedPersona}
                selectedAngle={selectedAngle}
                selectedOffer={selectedOffer}
                onSelectPersona={i => { setSelectedPersona(i); }}
                onSelectAngle={i => { setSelectedAngle(i); }}
                onSelectOffer={i => { setSelectedOffer(i); }}
                onRegenerate={() => generateMessages(selectedPersona, selectedAngle, selectedOffer)}
                onReset={handleReset}
                loading={loading}
                research={research}
                icpData={icpData}
                strategy={strategy}
                input={input}
                companyName={companyName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
