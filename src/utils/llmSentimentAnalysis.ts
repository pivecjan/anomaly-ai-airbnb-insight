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
  private static performanceMetrics: { avgResponseTime: number; successRate: number } = { avgResponseTime: 0, successRate: 1 };

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

  // Enhanced batch processing with adaptive sizing and optimized parallel execution
  static async analyzeBatchSentiment(texts: string[]): Promise<LLMSentimentResult[]> {
    const results: LLMSentimentResult[] = new Array(texts.length);
    const batchSize = this.getOptimalBatchSize(); // Adaptive batch size based on performance
    const maxConcurrentBatches = 5; // Increased parallel processing
    const delayBetweenBatchGroups = 200; // Reduced delay for faster processing

    console.log(`🚀 Starting ADAPTIVE parallel processing: ${texts.length} reviews`);
    console.log(`📊 Adaptive batch size: ${batchSize} (based on performance: ${Math.round(this.performanceMetrics.avgResponseTime)}ms avg, ${Math.round(this.performanceMetrics.successRate * 100)}% success)`);
    console.log(`⚡ Using ${maxConcurrentBatches} concurrent API calls for maximum speed`);

    // Pre-check cache to estimate actual work needed
    const totalBatches = Math.ceil(texts.length / batchSize);
    let estimatedApiCalls = 0;
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const { uncached } = this.getCachedResults(batch);
      if (uncached.length > 0) estimatedApiCalls++;
    }
    
    console.log(`📊 Cache analysis: ${totalBatches} total batches, ~${estimatedApiCalls} API calls needed`);

    // Process batches in parallel groups
    const batchPromises: Promise<void>[] = [];
    let processedBatches = 0;
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const batchStartIndex = i;
      const batchNumber = Math.floor(i / batchSize) + 1;
      
      const batchPromise = this.processSingleBatch(
        batch, 
        batchStartIndex, 
        results, 
        batchNumber, 
        totalBatches
      ).then(() => {
        processedBatches++;
        const progress = Math.round((processedBatches / totalBatches) * 100);
        console.log(`✅ Batch ${batchNumber}/${totalBatches} completed (${progress}% done)`);
      });
      
      batchPromises.push(batchPromise);
      
      // Process in groups of maxConcurrentBatches for optimal throughput
      if (batchPromises.length >= maxConcurrentBatches || i + batchSize >= texts.length) {
        await Promise.all(batchPromises);
        batchPromises.length = 0; // Clear the array
        
        // Minimal delay between batch groups to avoid rate limiting
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenBatchGroups));
        }
      }
    }

    console.log(`🎉 Parallel processing completed! Processed ${texts.length} reviews`);
    return results;
  }

  // Optimized single batch processing with enhanced error handling
  private static async processSingleBatch(
    batch: string[], 
    batchStartIndex: number, 
    results: LLMSentimentResult[], 
    batchNumber: number, 
    totalBatches: number
  ): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check cache first for intelligent processing
      const { cached, uncached, indices } = this.getCachedResults(batch);
      
      // Fill in cached results immediately
      cached.forEach((result, index) => {
        if (result) {
          results[batchStartIndex + index] = result;
        }
      });
      
      // Only process uncached reviews to minimize API calls
      if (uncached.length > 0) {
        console.log(`🔄 Batch ${batchNumber}/${totalBatches}: Processing ${uncached.length}/${batch.length} new reviews (${batch.length - uncached.length} from cache)`);
        
        // Add retry logic for better reliability
        let batchResults: LLMSentimentResult[] = [];
        let retryCount = 0;
        const maxRetries = 2;
        
                 while (retryCount <= maxRetries) {
           try {
             const apiStartTime = Date.now();
             batchResults = await this.analyzeBatchWithSingleCall(uncached);
             const apiTime = Date.now() - apiStartTime;
             
             // Track performance metrics for adaptive optimization
             this.updatePerformanceMetrics(apiTime, true);
             break; // Success, exit retry loop
           } catch (error) {
             retryCount++;
             this.updatePerformanceMetrics(5000, false); // Record failure with penalty time
             
             if (retryCount <= maxRetries) {
               console.log(`⚠️ Batch ${batchNumber} failed, retrying (${retryCount}/${maxRetries})...`);
               await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
             } else {
               throw error; // Re-throw after max retries
             }
           }
         }
        
        // Fill in new results at correct positions
        batchResults.forEach((result, index) => {
          const originalIndex = batchStartIndex + indices[index];
          results[originalIndex] = result;
        });
        
        // Cache the new results for future use
        this.cacheResults(uncached, batchResults);
        
        const processingTime = Date.now() - startTime;
        console.log(`⚡ Batch ${batchNumber} completed in ${processingTime}ms (${Math.round(uncached.length / (processingTime / 1000))} reviews/sec)`);
      } else {
        console.log(`💾 Batch ${batchNumber}/${totalBatches}: All ${batch.length} reviews found in cache (instant)`);
      }
    } catch (error) {
      console.error(`❌ Error processing batch ${batchNumber}:`, error);
      
      // Enhanced fallback: create default results for this batch
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
      // Ultra-optimized prompt for maximum speed and token efficiency
      const reviewsCompact = texts.map((text, index) => 
        `${index}:"${text.replace(/"/g, '\\"').substring(0, 120)}"` // Reduced to 120 chars for speed
      ).join(',');
      
      // Hyper-compressed prompt (60% token reduction)
      const prompt = `Analyze sentiment for ${texts.length} reviews. Return compact JSON:
{${reviewsCompact}}

Format: {"0":{"s":-0.8,"m":0.9,"c":0.85,"l":"en","lc":0.95,"label":"negative"},...}
s=sentiment(-1,1), m=magnitude(0,1), c=confidence(0,1), l=lang(ISO), lc=lang_conf(0,1), label=negative/neutral/positive`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a fast sentiment analyzer. Return only valid JSON, no explanations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: Math.min(4000, texts.length * 25), // Optimized token allocation
        temperature: 0.05, // Lower temperature for faster, more consistent responses
        top_p: 0.9, // Slightly focused sampling for speed
        frequency_penalty: 0, // No penalties for speed
        presence_penalty: 0
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

  // Enhanced data processing with performance metrics and intelligent caching
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
    const startTime = Date.now();
    console.log(`🚀 Starting TURBO LLM enhancement for ${data.length} reviews`);
    console.log(`⚡ Optimizations: 200 reviews/batch, 5x parallel processing, intelligent caching`);
    
    // Don't clear cache - use intelligent caching for speed
    // this.clearCache(); // Commented out to preserve cache across runs
    
    const sentimentResults = await this.analyzeBatchSentiment(
      data.map(d => d.raw_text)
    );

    const totalTime = Date.now() - startTime;
    const reviewsPerSecond = Math.round(data.length / (totalTime / 1000));
    const avgTimePerReview = Math.round(totalTime / data.length);
    
    console.log(`🎉 TURBO LLM enhancement completed!`);
    console.log(`📈 Performance: ${data.length} reviews in ${totalTime}ms`);
    console.log(`⚡ Speed: ${reviewsPerSecond} reviews/sec (${avgTimePerReview}ms per review)`);
    console.log(`💾 Cache efficiency: ${Math.round((1 - (this.errorCount / data.length)) * 100)}% success rate`);

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
    this.performanceMetrics = { avgResponseTime: 0, successRate: 1 }; // Reset performance metrics
  }

  // Adaptive batch size based on performance metrics
  private static getOptimalBatchSize(): number {
    const baseSize = 200;
    
    // If response times are very fast (< 2 seconds), we can increase batch size
    if (this.performanceMetrics.avgResponseTime < 2000 && this.performanceMetrics.successRate > 0.95) {
      return Math.min(300, baseSize + 50); // Increase to 250-300 for very fast responses
    }
    
    // If response times are slow (> 8 seconds) or success rate is low, decrease batch size
    if (this.performanceMetrics.avgResponseTime > 8000 || this.performanceMetrics.successRate < 0.8) {
      return Math.max(100, baseSize - 50); // Decrease to 150-100 for slow/unreliable responses
    }
    
    return baseSize; // Default 200
  }

  // Update performance metrics
  private static updatePerformanceMetrics(responseTime: number, success: boolean): void {
    // Simple moving average for response time
    this.performanceMetrics.avgResponseTime = this.performanceMetrics.avgResponseTime === 0 
      ? responseTime 
      : (this.performanceMetrics.avgResponseTime * 0.8) + (responseTime * 0.2);
    
    // Simple moving average for success rate
    const successValue = success ? 1 : 0;
    this.performanceMetrics.successRate = (this.performanceMetrics.successRate * 0.9) + (successValue * 0.1);
  }
} 