export type DecisionPersona = 
  | 'balanced' 
  | 'aggressive_growth' 
  | 'risk_averse' 
  | 'financial_maximizer' 
  | 'lifestyle_first';

export interface DecisionOption {
  id: string;
  name: string;
  tagline: string;
  icon?: string;
}

export interface ProConItem {
  id: string;
  text: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  score: number; // 1 to 10
  explanation: string;
  userDisabled?: boolean;
}

export interface OptionProCon {
  optionId: string;
  optionName: string;
  summary: string;
  pros: ProConItem[];
  cons: ProConItem[];
  rawNetScore: number;
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // 1 to 5
  category: string;
}

export interface MatrixScoreRow {
  criteriaId: string;
  ratings: Record<string, {
    score: number; // 1 to 10
    rationale: string;
  }>;
}

export interface ComparisonMatrix {
  criteria: MatrixCriterion[];
  scores: MatrixScoreRow[];
}

export interface SWOTQuadrant {
  optionId: string;
  optionName: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicSummary: string;
}

export interface BlindSpot {
  title: string;
  warning: string;
  mitigation: string;
}

export interface ActionPlanStep {
  step: string;
  timeline: string;
  detail: string;
}

export interface TiebreakerVerdict {
  winnerOptionId: string;
  winnerOptionName: string;
  headline: string;
  confidencePercentage: number;
  executiveSummary: string;
  coreDecidingFactors: string[];
  devilsAdvocate: {
    alternativeScenario: string;
    potentialRegret: string;
    whenToChooseTheOther: string;
  };
  blindSpots: BlindSpot[];
  actionPlan48h: ActionPlanStep[];
  gutCheckPrompt: string;
}

export interface DecisionAnalysis {
  id: string;
  createdAt: string;
  title: string;
  context: string;
  persona: DecisionPersona;
  options: DecisionOption[];
  prosAndCons: OptionProCon[];
  comparisonMatrix: ComparisonMatrix;
  swot: SWOTQuadrant[];
  verdict: TiebreakerVerdict;
}

export interface PreMortemResult {
  optionName: string;
  scenarioTitle: string;
  catastrophicTimeline: Array<{
    period: string;
    event: string;
    rootCause: string;
  }>;
  earlyWarningSignals: string[];
  preventativeShields: string[];
}
