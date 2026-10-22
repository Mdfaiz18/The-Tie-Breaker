import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

function parseJsonSafely(text: string | undefined): any {
  if (!text) return {};
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return JSON.parse(cleaned);
}

async function generateWithFallback(ai: GoogleGenAI, params: any) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt} on model ${model} failed: ${err.message || err}`);
        await new Promise((r) => setTimeout(r, 700 * attempt));
      }
    }
  }
  throw lastError;
}

// 1. Analyze Decision endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { title, context, options, priorities, persona } = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a decision question or title.' });
    }

    const ai = getGeminiClient();

    const personaDescriptions: Record<string, string> = {
      balanced: 'Balanced, prudent, and practical decision-making weighing both upside and downside proportionally.',
      aggressive_growth: 'High-growth, ambitious, maximizing long-term upside and career/wealth breakthroughs even with calculated risks.',
      risk_averse: 'Risk-averse, preserving capital, stability, downside protection, and mental bandwidth.',
      financial_maximizer: 'Focusing intensely on ROI, total wealth generation, cost-efficiency, and financial security.',
      lifestyle_first: 'Prioritizing work-life harmony, family, well-being, flexibility, and freedom above raw prestige or money.',
    };

    const personaContext = personaDescriptions[persona] || personaDescriptions.balanced;

    const prompt = `
You are "The Tiebreaker", a world-class strategic advisor, executive coach, and rational decision scientist.
Your job is to thoroughly dismantle, structure, and resolve the user's decision dilemma using rigorous analytical frameworks.

Decision Dilemma: "${title}"
User Context & Constraints: "${context || 'No specific background provided. Use reasonable realistic assumptions.'}"
Specific Options Proposed by User: ${options && options.length > 0 ? JSON.stringify(options) : 'None explicitly specified. Formulate the 2 to 3 most realistic and mutually exclusive options.'}
User Priorities: ${priorities && priorities.length > 0 ? JSON.stringify(priorities) : 'General long-term success, well-being, and risk mitigation.'}
Decision Mindset/Persona: "${personaContext}"

Perform an in-depth, multi-dimensional analysis with:
1. Formalized Options (2 to 3 options, each with a punchy title and 1-sentence tagline).
2. Comprehensive Pros & Cons List for EACH option:
   - 4 to 6 strong Pros and 4 to 6 authentic Cons per option.
   - For each item, indicate: text (concise summary), category (e.g. Financial, Career, Well-being, Operations, Risk, etc.), impact ('High' | 'Medium' | 'Low'), score (1 to 10 for pros, 1 to 10 severity for cons), and 1-2 sentence realistic explanation.
3. Criteria Comparison Matrix:
   - 5 to 7 sharp, relevant evaluation criteria (e.g., Financial ROI, Execution Effort, Peace of Mind, Career Velocity, Flexibility, Risk Profile).
   - Recommended initial weight (1 to 5) for each criterion based on user priorities.
   - For every criterion and every option, assign an objective rating from 1 to 10 with a concise 1-sentence rationale.
4. Complete SWOT Analysis for EACH option (Strengths, Weaknesses, Opportunities, Threats, plus a Strategic Summary).
5. The Tiebreaker Final Verdict:
   - Definitively pick the winning option (no waffling: declare a clear winner).
   - Confidence percentage (e.g., 68% to 92%).
   - Headline: Crisp, memorable verdict statement.
   - Executive Summary: 2-3 thoughtful paragraphs breaking down the core reasoning and why the trade-offs favor this path.
   - Core Deciding Factors: 3-4 bullet takeaways that tipped the scale.
   - Devil's Advocate / Inversion: What is the single biggest failure mode of this recommendation? What might you regret, and under what specific conditions would the runner-up option actually be the better choice?
   - Blind Spots: 3 critical overlooked risks or unasked questions the user should audit before pulling the trigger, each with a concrete mitigation strategy.
   - 48-Hour Action Plan: 3 immediate next steps to test or execute this decision smoothly.
   - Gut-Check Prompt: A psychological inquiry to test whether user's intuition aligns with this analysis.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            context: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  tagline: { type: Type.STRING },
                  icon: { type: Type.STRING },
                },
                required: ['id', 'name', 'tagline'],
              },
            },
            prosAndCons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  optionName: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        category: { type: Type.STRING },
                        impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        score: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                      },
                      required: ['id', 'text', 'category', 'impact', 'score', 'explanation'],
                    },
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        category: { type: Type.STRING },
                        impact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
                        score: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                      },
                      required: ['id', 'text', 'category', 'impact', 'score', 'explanation'],
                    },
                  },
                  rawNetScore: { type: Type.NUMBER },
                },
                required: ['optionId', 'optionName', 'summary', 'pros', 'cons'],
              },
            },
            comparisonMatrix: {
              type: Type.OBJECT,
              properties: {
                criteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      weight: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                    },
                    required: ['id', 'name', 'description', 'weight', 'category'],
                  },
                },
                scores: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      criteriaId: { type: Type.STRING },
                      ratings: {
                        type: Type.OBJECT,
                        description: 'Keyed by optionId, value is object with score (1-10) and rationale',
                      },
                    },
                    required: ['criteriaId', 'ratings'],
                  },
                },
              },
              required: ['criteria', 'scores'],
            },
            swot: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  optionId: { type: Type.STRING },
                  optionName: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                  strategicSummary: { type: Type.STRING },
                },
                required: ['optionId', 'optionName', 'strengths', 'weaknesses', 'opportunities', 'threats', 'strategicSummary'],
              },
            },
            verdict: {
              type: Type.OBJECT,
              properties: {
                winnerOptionId: { type: Type.STRING },
                winnerOptionName: { type: Type.STRING },
                headline: { type: Type.STRING },
                confidencePercentage: { type: Type.NUMBER },
                executiveSummary: { type: Type.STRING },
                coreDecidingFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                devilsAdvocate: {
                  type: Type.OBJECT,
                  properties: {
                    alternativeScenario: { type: Type.STRING },
                    potentialRegret: { type: Type.STRING },
                    whenToChooseTheOther: { type: Type.STRING },
                  },
                  required: ['alternativeScenario', 'potentialRegret', 'whenToChooseTheOther'],
                },
                blindSpots: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      warning: { type: Type.STRING },
                      mitigation: { type: Type.STRING },
                    },
                    required: ['title', 'warning', 'mitigation'],
                  },
                },
                actionPlan48h: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      step: { type: Type.STRING },
                      timeline: { type: Type.STRING },
                      detail: { type: Type.STRING },
                    },
                    required: ['step', 'timeline', 'detail'],
                  },
                },
                gutCheckPrompt: { type: Type.STRING },
              },
              required: [
                'winnerOptionId',
                'winnerOptionName',
                'headline',
                'confidencePercentage',
                'executiveSummary',
                'coreDecidingFactors',
                'devilsAdvocate',
                'blindSpots',
                'actionPlan48h',
                'gutCheckPrompt',
              ],
            },
          },
          required: ['title', 'options', 'prosAndCons', 'comparisonMatrix', 'swot', 'verdict'],
        },
      },
    });

    const parsedData = parseJsonSafely(response.text);

    // Ensure id and metadata exist
    const fullAnalysis = {
      id: `dec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      persona: persona || 'balanced',
      ...parsedData,
      title: parsedData.title || title,
      context: parsedData.context || context || '',
    };

    return res.json(fullAnalysis);
  } catch (error: any) {
    console.error('Error generating decision analysis:', error);
    return res.status(500).json({
      error: error.message || 'An error occurred while analyzing the decision.',
    });
  }
});

// 2. Pre-Mortem Stress Test endpoint
app.post('/api/pre-mortem', async (req, res) => {
  try {
    const { decisionTitle, optionName, context } = req.body;
    if (!decisionTitle || !optionName) {
      return res.status(400).json({ error: 'Missing decision or option name.' });
    }

    const ai = getGeminiClient();

    const prompt = `
Conduct a rigorous Pre-Mortem / Stress Test on this selected choice:
Decision: "${decisionTitle}"
Chosen Option to Stress Test: "${optionName}"
Context: "${context || 'Standard circumstances'}"

Assume we have traveled 12 months into the future, and this decision turned out to be an utter failure / major regret.
Break down:
1. A vivid narrative title describing the breakdown.
2. A chronological 3-stage failure timeline (Months 1-3, Months 4-7, Months 8-12) detailing the subtle early erosion, compounding mistakes, and ultimate breaking point.
3. 3-4 subtle Early Warning Signals that should alert the user within the first 60 days that things are going off the rails.
4. 3-4 concrete Preventative Shields (actions to take NOW to make this decision resilient and bulletproof against this failure).
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optionName: { type: Type.STRING },
            scenarioTitle: { type: Type.STRING },
            catastrophicTimeline: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  period: { type: Type.STRING },
                  event: { type: Type.STRING },
                  rootCause: { type: Type.STRING },
                },
                required: ['period', 'event', 'rootCause'],
              },
            },
            earlyWarningSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
            preventativeShields: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['optionName', 'scenarioTitle', 'catastrophicTimeline', 'earlyWarningSignals', 'preventativeShields'],
        },
      },
    });

    const parsed = parseJsonSafely(response.text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error conducting pre-mortem:', error);
    return res.status(500).json({ error: error.message || 'Failed to conduct pre-mortem.' });
  }
});

// 3. Follow-up Copilot Advice endpoint
app.post('/api/copilot-chat', async (req, res) => {
  try {
    const { decisionContext, userQuestion, history } = req.body;

    if (!userQuestion || typeof userQuestion !== 'string') {
      return res.status(400).json({ error: 'Please provide a question.' });
    }

    const ai = getGeminiClient();

    const formattedHistory = Array.isArray(history)
      ? history.map((h: any) => `${h.role === 'user' ? 'User' : 'The Tiebreaker'}: ${h.content}`).join('\n')
      : '';

    const prompt = `
You are "The Tiebreaker Copilot", providing razor-sharp, objective, empathetic strategic advice on the user's specific decision.

Decision Summary:
${JSON.stringify(decisionContext, null, 2)}

Conversation History:
${formattedHistory}

User's Latest Question / Scenario:
"${userQuestion}"

Provide a concise, direct, highly tactical response (max 3-4 paragraphs or crisp bullet points). Offer concrete scripts, mathematical framing, negotiation leverage, or psychological clarity where appropriate. Be decisive and candid.
`;

    const response = await generateWithFallback(ai, {
      contents: prompt,
    });

    return res.json({ reply: response.text?.trim() || 'No response generated.' });
  } catch (error: any) {
    console.error('Error in copilot chat:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate copilot reply.' });
  }
});

// Serve frontend in dev (via Vite middleware) or prod (via static)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`The Tiebreaker server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
