// ─── Step 1: Research ────────────────────────────────────────────────────────

export interface Competitor {
  name: string;
  positioning: string;
  strengths: string[];
  weaknesses: string[];
  common_offer: string;
}

export interface MarketOverview {
  size: string;
  maturity: "emerging" | "growing" | "mature" | "declining";
  growth_rate: string;
  key_trends: string[];
}

export interface ResearchData {
  market_overview: MarketOverview;
  competitors: Competitor[];
  pain_points: string[];
  desires: string[];
  objections: string[];
  buying_triggers: string[];
  market_opportunities: string[];
  common_messaging: string[];
}

// ─── Step 2: ICP + Personas ──────────────────────────────────────────────────

export interface ICPSegment {
  name: string;
  description: string;
  size_estimate: string;
  priority: "high" | "medium" | "low";
}

export interface ICP {
  industry: string;
  sub_niche: string;
  company_size: string;
  revenue_range: string;
  geography: string;
  business_model: string;
  tech_stack: string[];
  buying_readiness: string[];
  who_not_to_target: string[];
  segments: ICPSegment[];
}

export interface Persona {
  id: string;
  name: string; // fictional first name for the persona
  title: string;
  company_stage: string;
  goals: string[];
  kpis: string[];
  pain_points: string[];
  desires: string[];
  objections: string[];
  decision_process: string;
  platforms: string[];
  watering_holes: string[];
  daily_frustration: string;
  quote: string;
}

export interface ICPPersonasData {
  icp: ICP;
  personas: Persona[];
}

// ─── Step 3: Campaign Strategy + Offers ──────────────────────────────────────

export type AngleType =
  | "pain"
  | "opportunity"
  | "competitor"
  | "curiosity"
  | "data"
  | "authority";

export interface CampaignAngle {
  name: string;
  type: AngleType;
  description: string;
  why_it_works: string;
  when_to_use: string;
  effectiveness_score: number; // 1–10
  sample_hook: string;
  subject_line_example: string;
  recommended: boolean;
}

export interface Offer {
  name: string;
  type: "service" | "audit" | "report" | "tool" | "consultation" | "trial";
  description: string;
  friction_level: "low" | "medium" | "high";
  expected_conversion: string;
  cta: string;
}

export interface LeadMagnet {
  name: string;
  format: "PDF" | "spreadsheet" | "video" | "audit" | "calculator" | "template" | "checklist";
  description: string;
  value_proposition: string;
  delivery: string;
}

export interface StrategyData {
  angles: CampaignAngle[];
  recommended_angles: string[];
  offers: Offer[];
  lead_magnets: LeadMagnet[];
}

// ─── Step 4: Outreach Messages ───────────────────────────────────────────────

export interface EmailStep {
  step: number;
  label: string;
  subject: string;
  body: string;
  purpose: string;
  timing: string;
}

export interface PersonalizationHook {
  trigger: string;
  hook: string;
  example: string;
}

export interface MessagesData {
  cold_email_sequence: EmailStep[];
  linkedin_connection_note: string;
  linkedin_follow_up: string;
  personalization_hooks: PersonalizationHook[];
}

// ─── App state ───────────────────────────────────────────────────────────────

export interface AppInput {
  target: string;
  context: string;
  geography: string;
}
