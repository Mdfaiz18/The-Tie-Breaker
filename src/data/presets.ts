import { DecisionPersona } from '../types/decision';

export interface DecisionPreset {
  id: string;
  category: string;
  title: string;
  context: string;
  options: string[];
  priorities: string[];
  persona: DecisionPersona;
  badge: string;
}

export const PRESET_DECISIONS: DecisionPreset[] = [
  {
    id: 'career_startup_vs_corp',
    category: 'Career & Wealth',
    badge: 'Popular',
    title: 'Should I join an early-stage Series A AI startup or stay as a Senior Engineer at a stable Big Tech company?',
    context: 'Current role pays $240k total comp, low stress, 35 hrs/week, but feeling stagnant. Startup offer is $170k base + 0.75% equity, fast-paced 50+ hrs/week. Have 8 months of emergency savings and partner works stably.',
    options: ['Join Series A AI Startup', 'Stay at Big Tech Company'],
    priorities: ['Exponential Career Growth', 'Financial Upside vs Stability', 'Work-Life Balance', 'Skill Relevance in AI Era'],
    persona: 'aggressive_growth',
  },
  {
    id: 'buy_vs_rent_invest',
    category: 'Personal Finance',
    badge: 'High Impact',
    title: 'Should I buy a 3-bedroom suburban home now or continue renting in the city and investing the difference?',
    context: 'Have $130,000 saved for 20% down payment + closing costs. Mortgage interest rate is 6.5%. Renting costs $2,600/mo while total homeowner cost (PITI + maintenance + HOA) would be $4,200/mo. Planning to stay in the area for at least 5-7 years.',
    options: ['Buy Suburban Home Now', 'Keep Renting & Invest Surplus in Index Funds'],
    priorities: ['Total Net Worth at 10 Years', 'Lifestyle Freedom & Mobility', 'Pride of Ownership & Stability', 'Cash Flow Buffer'],
    persona: 'financial_maximizer',
  },
  {
    id: 'build_vs_buy_software',
    category: 'Tech & Architecture',
    badge: 'Executive',
    title: 'Should we build our custom internal workflow automation platform or purchase an enterprise SaaS suite?',
    context: 'Company of 180 employees. Enterprise SaaS costs $75,000/yr and gets us 80% of what we want immediately. Building internal platform would require 2 senior engineers for 5 months (~$160k capitalized dev cost + maintenance) but gives 100% bespoke fit and proprietary competitive edge.',
    options: ['Build In-House Custom Platform', 'Procure Enterprise SaaS Suite'],
    priorities: ['Time-to-Value', 'Ongoing Maintenance Overhead', 'Workflow Customization', 'Total 3-Year TCO'],
    persona: 'balanced',
  },
  {
    id: 'relocate_overseas',
    category: 'Life & Family',
    badge: 'Life Changing',
    title: 'Should we accept a 3-year international transfer to Tokyo or stay in our home city near aging parents?',
    context: 'Offered an executive expat package with full housing stipend, tax equalization, and international school tuition for our 6-year-old. Both my partner and I love Japanese culture, but our parents in Denver are in their early 70s with mild health considerations.',
    options: ['Accept Tokyo Expat Transfer', 'Decline Transfer & Remain in Denver'],
    priorities: ['Family Closeness & Elder Care', 'Once-in-a-Lifetime Experience', 'Child Global Perspective', 'Career Trajectory'],
    persona: 'lifestyle_first',
  },
];
