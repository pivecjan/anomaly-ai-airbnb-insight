import OpenAI from 'openai';

// OpenAI configuration
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface LLMSentimentResult {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1
  label: 'negative' | 'neutral' | 'positive';
  confidence: number; // 0 to 1
  detectedLanguage: string;
  languageConfidence: number;
}

export class LLMSentimentAnalyzer {
  private static analysisCache: Map<string, LLMSentimentResult> = new Map();

  // Batch processing for efficiency
  static async analyzeBatchSentiment(texts: string[]): Promise<LLMSentimentResult[]> {
    const results: LLMSentimentResult[] = [];
    const batchSize = 500; // Very large batch size for maximum speed

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(text => this.analyzeSentimentWithLLM(text))
      );
      results.push(...batchResults);
    }

    return results;
  }

  private static async analyzeSentimentWithLLM(text: string): Promise<LLMSentimentResult> {
    // Check cache first
    const cacheKey = text.substring(0, 100);
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    try {
      const prompt = `Analyze this review and return JSON:
{
  "sentiment_score": <-1 to 1>,
  "magnitude": <0 to 1>,
  "confidence": <0 to 1>,
  "detected_language": "<ISO code>",
  "language_confidence": <0 to 1>,
  "label": "<negative|neutral|positive>"
}

Review: "${text}"

Focus on: accurate sentiment scoring and language detection.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.1
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const analysis = JSON.parse(content);
      
      const result: LLMSentimentResult = {
        score: analysis.sentiment_score,
        magnitude: analysis.magnitude,
        label: analysis.label,
        confidence: analysis.confidence,
        detectedLanguage: analysis.detected_language,
        languageConfidence: analysis.language_confidence
      };

      // Cache the result
      this.analysisCache.set(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('Error analyzing sentiment with LLM:', error);
      
      // Fallback to basic analysis
      return {
        score: 0,
        magnitude: 0.1,
        label: 'neutral',
        confidence: 0.1,
        detectedLanguage: 'en',
        languageConfidence: 0.5
      };
    }
  }

  // Enhance data with LLM analysis
  static async enhanceDataWithLLM(
    data: Array<{
      review_id: string;
      raw_text: string;
      neighbourhood: string;
      created_at: string;
      language?: string;
    }>
  ): Promise<Array<{
    review_id: string;
    raw_text: string;
    neighbourhood: string;
    created_at: string;
    language: string;
    llm_sentiment_score: number;
    llm_language: string;
    llm_confidence: number;
  }>> {
    // Clear cache for fresh analysis
    this.clearCache();
    
    const sentimentResults = await this.analyzeBatchSentiment(
      data.map(d => d.raw_text)
    );

    return data.map((row, index) => ({
      ...row,
      language: sentimentResults[index].detectedLanguage,
      llm_sentiment_score: sentimentResults[index].score,
      llm_language: sentimentResults[index].detectedLanguage,
      llm_confidence: sentimentResults[index].confidence
    }));
  }

  // Clear cache for memory management
  static clearCache(): void {
    this.analysisCache.clear();
  }
} 