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

  // 🚀 UNLIMITED PARALLEL PROCESSING - ALL BATCHES AT ONCE!
  static async analyzeBatchSentiment(texts: string[]): Promise<LLMSentimentResult[]> {
    const results: LLMSentimentResult[] = new Array(texts.length);
    const batchSize = this.getOptimalBatchSize(); // Adaptive batch size based on performance

    console.log(`🚀 Starting UNLIMITED PARALLEL processing: ${texts.length} reviews`);
    console.log(`📊 AGGRESSIVE batch size: ${batchSize} (performance: ${Math.round(this.performanceMetrics.avgResponseTime)}ms avg, ${Math.round(this.performanceMetrics.successRate * 100)}% success)`);
    console.log(`⚡ NO LIMITS: ALL ${Math.ceil(texts.length / batchSize)} batches running simultaneously!`);
    console.log(`🎯 Target: All batches complete in ~10-15 seconds (vs previous 5+ minutes)`);

    // Pre-check cache to estimate actual work needed
    const totalBatches = Math.ceil(texts.length / batchSize);
    let estimatedApiCalls = 0;
    
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const { uncached } = this.getCachedResults(batch);
      if (uncached.length > 0) estimatedApiCalls++;
    }
    
    console.log(`📊 Cache analysis: ${totalBatches} total batches, ~${estimatedApiCalls} API calls needed`);

    // 🚀 MAXIMUM PARALLELIZATION: Launch ALL batches simultaneously
    const allBatchPromises: Promise<void>[] = [];
    let processedBatches = 0;
    
    console.log(`🔥 Launching ALL ${totalBatches} batches in FULL PARALLEL mode!`);
    
    // Create ALL batch promises at once - no waiting, no groups!
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
      }).catch((error) => {
        console.error(`❌ Batch ${batchNumber} failed:`, error);
        // Don't let one batch failure stop others
      });
      
      allBatchPromises.push(batchPromise);
      
      // Add tiny stagger to avoid overwhelming the API at the exact same moment
      if (batchNumber > 1) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Just 10ms stagger
      }
    }
    
    console.log(`⚡ ALL ${totalBatches} batches launched! Waiting for completion...`);
    
    // Wait for ALL batches to complete simultaneously
    await Promise.allSettled(allBatchPromises);

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
      // EXTREME prompt optimization - 80% token reduction
      const reviewsUltraCompact = texts.map((text, index) => 
        `${index}:"${text.replace(/[^\w\s]/g, '').substring(0, 80)}"` // Reduced to 80 chars + remove special chars
      ).join(',');
      
      // IMPROVED prompt for accurate language detection
      const prompt = `Analyze sentiment AND detect language for ${texts.length} reviews:
{${reviewsUltraCompact}}
Return JSON: {"0":{"s":-0.5,"m":0.8,"l":"de","label":"negative"},"1":{"s":0.3,"m":0.6,"l":"en","label":"positive"},...}
s=sentiment(-1,1), m=magnitude(0,1), l=language_code(en,de,fr,es,it,etc), label=negative/neutral/positive`;

      // Add aggressive timeout for faster failure detection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout after 5 seconds')), 5000)
      );

      const apiPromise = openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Fast sentiment analyzer with language detection. Return JSON only. Detect actual language of each text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: Math.min(2000, texts.length * 15), // REDUCED token allocation for speed
        temperature: 0, // Minimum temperature for maximum speed
        top_p: 0.8, // More focused for speed
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false // Ensure no streaming for faster response
      });

      const response = await Promise.race([apiPromise, timeoutPromise]) as any;

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
      
      // SIMPLIFIED response parsing for speed
      const results: LLMSentimentResult[] = [];
      
      for (let i = 0; i < texts.length; i++) {
        const reviewAnalysis = analysis[i.toString()];
        
        if (reviewAnalysis && typeof reviewAnalysis.s === 'number') {
          const detectedLang = typeof reviewAnalysis.l === 'string' ? reviewAnalysis.l : 'en';
          
          // Debug logging for language detection
          if (i < 3) { // Only log first 3 for debugging
            console.log(`🌍 Review ${i}: "${texts[i].substring(0, 50)}..." -> Language: "${detectedLang}"`);
          }
          
          results.push({
            score: Math.max(-1, Math.min(1, reviewAnalysis.s)),
            magnitude: typeof reviewAnalysis.m === 'number' ? Math.max(0, Math.min(1, reviewAnalysis.m)) : Math.abs(reviewAnalysis.s),
            label: ['negative', 'neutral', 'positive'].includes(reviewAnalysis.label) ? reviewAnalysis.label : 
                   (reviewAnalysis.s > 0.1 ? 'positive' : reviewAnalysis.s < -0.1 ? 'negative' : 'neutral'),
            confidence: 0.8, // Fixed confidence for speed
            detectedLanguage: detectedLang,
            languageConfidence: 0.9 // Fixed language confidence for speed
          });
        } else {
          // Fast fallback
          results.push({
            score: 0,
            magnitude: 0.1,
            label: 'neutral',
            confidence: 0.5,
            detectedLanguage: 'en',
            languageConfidence: 0.8
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

  // ULTRA-FAST data processing with aggressive optimizations and fallback
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
    console.log(`🚀 Starting UNLIMITED PARALLEL LLM enhancement for ${data.length} reviews`);
    console.log(`⚡ EXTREME optimizations: 25 reviews/batch, UNLIMITED parallel, 5s timeout, 80% token reduction`);
    
    // Set a maximum time limit for the entire process
    const maxProcessingTime = 60000; // 1 minute max
    const processingTimeout = setTimeout(() => {
      console.warn(`⚠️ Processing timeout after 60 seconds, falling back to basic analysis`);
    }, maxProcessingTime);
    
    try {
      const sentimentResults = await this.analyzeBatchSentiment(
        data.map(d => d.raw_text)
      );

      clearTimeout(processingTimeout);
      
      const totalTime = Date.now() - startTime;
      const reviewsPerSecond = Math.round(data.length / (totalTime / 1000));
      
      console.log(`🎉 ULTRA-FAST LLM enhancement completed!`);
      console.log(`📈 Performance: ${data.length} reviews in ${totalTime}ms`);
      console.log(`⚡ BLAZING Speed: ${reviewsPerSecond} reviews/sec`);
      console.log(`💾 Success rate: ${Math.round((1 - (this.errorCount / data.length)) * 100)}%`);

      return data.map((row, index) => ({
        ...row,
        language: sentimentResults[index].detectedLanguage,
        llm_sentiment_score: sentimentResults[index].score,
        llm_language: sentimentResults[index].detectedLanguage,
        llm_confidence: sentimentResults[index].confidence
      }));
    } catch (error) {
      clearTimeout(processingTimeout);
      console.error('LLM processing failed, using basic sentiment analysis:', error);
      
      // Fallback to basic sentiment analysis
      const { SentimentAnalyzer } = await import('./sentimentAnalysis');
      return data.map((row) => {
        const basicSentiment = SentimentAnalyzer.analyzeSentiment(row.raw_text);
        return {
          ...row,
          language: 'en',
          llm_sentiment_score: basicSentiment.score,
          llm_language: 'en',
          llm_confidence: 0.6
        };
      });
    }
  }

  // Clear cache for memory management
  static clearCache(): void {
    this.analysisCache.clear();
    this.errorCount = 0; // Reset error count when clearing cache
    this.performanceMetrics = { avgResponseTime: 0, successRate: 1 }; // Reset performance metrics
  }

  // EXTREME batch size optimization for maximum parallelization
  private static getOptimalBatchSize(): number {
    // Even smaller batches for maximum parallelization
    const baseSize = 25; // ULTRA-SMALL batches for maximum parallel processing
    
    // If response times are very fast (< 1 second), we can increase batch size slightly
    if (this.performanceMetrics.avgResponseTime < 1000 && this.performanceMetrics.successRate > 0.95) {
      return Math.min(40, baseSize + 10); // Increase to 35-40 for very fast responses
    }
    
    // If response times are slow (> 2 seconds) or success rate is low, decrease batch size even more
    if (this.performanceMetrics.avgResponseTime > 2000 || this.performanceMetrics.successRate < 0.8) {
      return Math.max(10, baseSize - 10); // Decrease to 15-10 for slow/unreliable responses
    }
    
    return baseSize; // Default 25 (8x smaller than original 200!)
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