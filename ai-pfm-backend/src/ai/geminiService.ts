import {
  buildSpendingAnalysisPrompt,
  buildQuickSummaryPrompt,
  buildCategoryDeepDivePrompt,
  SpendingData,
  SpendingCategory,
} from "./prompts/spendingAnalysis.prompt";

export interface GeminiAnalysisResult {
  analysis: string;
  model: string;
  tokensUsed?: number;
  generatedAt: string;
}

export class GeminiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-1.5-pro";
    this.maxTokens = Number(process.env.GEMINI_MAX_TOKENS) || 1024;
    this.temperature = Number(process.env.GEMINI_TEMPERATURE) || 0.7;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    if (!this.apiKey) {
      throw new Error(
        "❌ GEMINI_API_KEY is missing from environment variables",
      );
    }
  }

  // ─── Core Request Handler ─────────────────────────────────────────────────

  private async sendRequest(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<GeminiAnalysisResult> {
    const body = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        topK: 40,
        topP: 0.95,
      },
    };

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API Error: ${error?.error?.message || response.statusText}`,
      );
    }

    const result = await response.json();

    return {
      analysis:
        result.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No analysis generated.",
      model: this.model,
      tokensUsed: result.usageMetadata?.totalTokenCount,
      generatedAt: new Date().toISOString(),
    };
  }

  // ─── Public Methods ───────────────────────────────────────────────────────

  /** Full spending analysis report */
  async analyzeSpending(data: SpendingData): Promise<GeminiAnalysisResult> {
    const { systemPrompt, userPrompt } = buildSpendingAnalysisPrompt(data);
    return this.sendRequest(systemPrompt, userPrompt);
  }

  /** Short 2-sentence summary for dashboard */
  async getQuickSummary(data: SpendingData): Promise<string> {
    const prompt = buildQuickSummaryPrompt(data);
    const result = await this.sendRequest(
      "You are a concise financial assistant.",
      prompt,
    );
    return result.analysis;
  }

  /** Deep dive into one specific category */
  async getCategoryInsight(
    category: SpendingCategory,
    data: SpendingData,
  ): Promise<string> {
    const prompt = buildCategoryDeepDivePrompt(category, data);
    const result = await this.sendRequest(
      "You are a concise financial assistant.",
      prompt,
    );
    return result.analysis;
  }
}
