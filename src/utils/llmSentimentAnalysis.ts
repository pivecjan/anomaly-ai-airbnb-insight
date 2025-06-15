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
  private static errorCount: number = 0;
  private static maxErrors: number = 5;

  // Check if LLM analysis should be skipped due to too many errors
  private static shouldSkipLLM(): boolean {
    return this.errorCount >= this.maxErrors;
  }

  // Reset error count on successful analysis
  private static resetErrorCount(): void {
    this.errorCount = 0;
  }

  // Increment error count
  private static incrementErrorCount(): void {
    this.errorCount++;
  }

  // Check cache for a batch of texts
  private static getCachedResults(texts: string[]): { cached: LLMSentimentResult[], uncached: string[], indices: number[] } {
    const cached: LLMSentimentResult[] = [];
    const uncached: string[] = [];
    const indices: number[] = [];
    
    texts.forEach((text, index) => {
      const cacheKey = text.substring(0, 100);
      if (this.analysisCache.has(cacheKey)) {
        cached[index] = this.analysisCache.get(cacheKey)!;
      } else {
        uncached.push(text);
        indices.push(index);
      }
    });
    
    return { cached, uncached, indices };
  }

  // Cache results for a batch
  private static cacheResults(texts: string[], results: LLMSentimentResult[]): void {
    texts.forEach((text, index) => {
      const cacheKey = text.substring(0, 100);
      if (results[index]) {
        this.analysisCache.set(cacheKey, results[index]);
      }
    });
  }

  // Batch processing for efficiency - process 200 reviews in a single API call
  static async analyzeBatchSentiment(texts: string[]): Promise<LLMSentimentResult[]> {
    const results: LLMSentimentResult[] = new Array(texts.length);
    const batchSize = 200; // Reduced batch size for faster responses
    const maxConcurrentBatches = 3; // Process up to 3 batches in parallel

    // Create all batch promises
    const batchPromises: Promise<void>[] = [];
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchStartIndex = i;
      
      const batchPromise = this.processSingleBatch(batch, batchStartIndex, results, i, batchSize, texts.length);
      batchPromises.push(batchPromise);
      
      // Process in groups of maxConcurrentBatches to avoid overwhelming the API
      if (batchPromises.length >= maxConcurrentBatches || i + batchSize >= texts.length) {
        await Promise.all(batchPromises);
        batchPromises.length = 0; // Clear the array
        
        // Small delay between batch groups
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    return results;
  }

  // Process a single batch (extracted for parallel processing)
  private static async processSingleBatch(
    batch: string[], 
    batchStartIndex: number, 
    results: LLMSentimentResult[], 
    i: number, 
    batchSize: number, 
    totalLength: number
  ): Promise<void> {
    try {
      // Check cache first
      const { cached, uncached, indices } = this.getCachedResults(batch);
      
      // Fill in cached results
      cached.forEach((result, index) => {
        if (result) {
          results[batchStartIndex + index] = result;
        }
      });
      
      // Only process uncached reviews
      if (uncached.length > 0) {
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(totalLength/batchSize)} (${uncached.length}/${batch.length} new reviews, ${batch.length - uncached.length} cached)`);
        
        const batchResults = await this.analyzeBatchWithSingleCall(uncached);
        
        // Fill in new results at correct positions
        batchResults.forEach((result, index) => {
          const originalIndex = batchStartIndex + indices[index];
          results[originalIndex] = result;
        });
        
        // Cache the new results
        this.cacheResults(uncached, batchResults);
      } else {
        console.log(`Batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(totalLength/batchSize)} - all ${batch.length} reviews found in cache`);
      }
    } catch (error) {
      console.error(`Error processing batch ${Math.floor(i/batchSize) + 1}:`, error);
      
      // Fallback: create default results for this batch
      batch.forEach((_, index) => {
        if (!results[batchStartIndex + index]) {
          results[batchStartIndex + index] = {
            score: 0,
            magnitude: 0.1,
            label: 'neutral',
            confidence: 0.1,
            detectedLanguage: 'en',
            languageConfidence: 0.5
          };
        }
      });
    }
  }

  // Process a batch of reviews in a single API call
  private static async analyzeBatchWithSingleCall(texts: string[]): Promise<LLMSentimentResult[]> {
    // Check if we should skip LLM
    if (this.shouldSkipLLM()) {
      console.warn('Skipping LLM analysis due to too many errors, using fallback');
      return texts.map(() => ({
        score: 0,
        magnitude: 0.1,
        label: 'neutral' as const,
        confidence: 0.1,
        detectedLanguage: 'en',
        languageConfidence: 0.5
      }));
    }

    try {
      // Create a more concise prompt for faster processing
      const reviewsJson = texts.map((text, index) => 
        `"${index}":"${text.replace(/"/g, '\\"').substring(0, 150)}"`
      ).join(',');
      
      const prompt = `Analyze ${texts.length} reviews. Return JSON:
{${reviewsJson}}

Output format:
{"0":{"s":-0.5,"m":0.8,"c":0.9,"l":"en","lc":0.95,"label":"negative"},"1":{"s":0.3,"m":0.6,"c":0.8,"l":"en","lc":0.9,"label":"positive"},...}

Where: s=sentiment(-1 to 1), m=magnitude(0-1), c=confidence(0-1), l=language(ISO), lc=lang_confidence(0-1), label=negative/neutral/positive`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: Math.min(3000, texts.length * 30), // Reduced token limit for faster response
        temperature: 0.1
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      // Clean and parse the response
      let cleanedContent = content.trim();
      cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      // Find the main JSON object
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      const analysis = JSON.parse(jsonMatch[0]);
      
      // Convert the response to our result format
      const results: LLMSentimentResult[] = [];
      
      for (let i = 0; i < texts.length; i++) {
        const reviewAnalysis = analysis[i.toString()];
        
        if (reviewAnalysis) {
          results.push({
            score: typeof reviewAnalysis.s === 'number' ? Math.max(-1, Math.min(1, reviewAnalysis.s)) : 0,
            magnitude: typeof reviewAnalysis.m === 'number' ? Math.max(0, Math.min(1, reviewAnalysis.m)) : 0.1,
            label: ['negative', 'neutral', 'positive'].includes(reviewAnalysis.label) ? reviewAnalysis.label : 'neutral',
            confidence: typeof reviewAnalysis.c === 'number' ? Math.max(0, Math.min(1, reviewAnalysis.c)) : 0.1,
            detectedLanguage: typeof reviewAnalysis.l === 'string' ? reviewAnalysis.l : 'en',
            languageConfidence: typeof reviewAnalysis.lc === 'number' ? Math.max(0, Math.min(1, reviewAnalysis.lc)) : 0.5
          });
        } else {
          // Fallback for missing analysis
          results.push({
            score: 0,
            magnitude: 0.1,
            label: 'neutral',
            confidence: 0.1,
            detectedLanguage: 'en',
            languageConfidence: 0.5
          });
        }
      }
      
      // Reset error count on success
      this.resetErrorCount();
      
      return results;
      
    } catch (error) {
      console.error('Error in batch analysis:', error);
      this.incrementErrorCount();
      
      // Return fallback results for all texts
      return texts.map(() => ({
        score: 0,
        magnitude: 0.1,
        label: 'neutral' as const,
        confidence: 0.1,
        detectedLanguage: 'en',
        languageConfidence: 0.5
      }));
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
    console.log(`🚀 Starting LLM enhancement for ${data.length} reviews`);
    console.log(`📊 Processing in batches of 200 reviews per API call for optimal speed`);
    
    // Clear cache for fresh analysis
    this.clearCache();
    
    const sentimentResults = await this.analyzeBatchSentiment(
      data.map(d => d.raw_text)
    );

    console.log(`✅ LLM enhancement completed for ${data.length} reviews`);

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
    this.errorCount = 0; // Reset error count when clearing cache
  }
} 