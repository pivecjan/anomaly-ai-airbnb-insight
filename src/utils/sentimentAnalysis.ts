// Simple sentiment analysis utility (browser-based)
export interface SentimentResult {
  score: number; // -1 to 1 range
  magnitude: number; // 0 to 1 range
  label: 'negative' | 'neutral' | 'positive';
}

export interface TimelineSentiment {
  month: string;
  averageSentiment: number;
  reviewCount: number;
  change?: number;
}

export interface AnomalyMetadata {
  review_id: string;
  type: 'suspicious' | 'complaint' | 'language' | 'sentiment_negative' | 'sentiment_positive' | 'sentiment_neutral';
  reason: string;
  example: string;
  neighbourhood: string;
  created_at: string;
  sentiment_score?: number;
  anomaly_score?: number;
}

export class SentimentAnalyzer {
  private static positiveWords = [
    'amazing', 'awesome', 'excellent', 'fantastic', 'great', 'wonderful', 
    'perfect', 'beautiful', 'clean', 'comfortable', 'friendly', 'helpful',
    'lovely', 'nice', 'good', 'best', 'enjoyed', 'recommend', 'love',
    'convenient', 'spacious', 'cozy', 'stunning', 'incredible', 'superb'
  ];

  private static negativeWords = [
    'terrible', 'awful', 'horrible', 'bad', 'worst', 'dirty', 'noisy',
    'uncomfortable', 'rude', 'broken', 'disappointing', 'poor', 'ugly',
    'expensive', 'cramped', 'cold', 'hot', 'smelly', 'disgusting',
    'unclean', 'outdated', 'overpriced', 'unfriendly', 'unreliable'
  ];

  private static intensifiers = [
    'very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely',
    'quite', 'really', 'so', 'too', 'highly'
  ];

  private static negations = [
    'not', 'no', 'never', 'nothing', 'nowhere', 'nobody', 'none',
    'neither', 'nor', 'hardly', 'barely', 'scarcely'
  ];

  static analyzeSentiment(text: string): SentimentResult {
    if (!text || text.trim().length === 0) {
      return { score: 0, magnitude: 0, label: 'neutral' };
    }

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);

    let score = 0;
    let wordCount = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      let sentiment = 0;
      let intensity = 1;

      // Check for sentiment words
      if (this.positiveWords.includes(word)) {
        sentiment = 1;
      } else if (this.negativeWords.includes(word)) {
        sentiment = -1;
      }

      if (sentiment !== 0) {
        // Check for intensifiers before this word
        if (i > 0 && this.intensifiers.includes(words[i - 1])) {
          intensity = 1.5;
        }

        // Check for negations before this word
        let negated = false;
        for (let j = Math.max(0, i - 3); j < i; j++) {
          if (this.negations.includes(words[j])) {
            negated = true;
            break;
          }
        }

        if (negated) {
          sentiment *= -1;
        }

        score += sentiment * intensity;
        wordCount++;
      }
    }

    // Normalize score
    const normalizedScore = wordCount > 0 ? score / wordCount : 0;
    const clampedScore = Math.max(-1, Math.min(1, normalizedScore));
    
    // Calculate magnitude (how strong the sentiment is)
    const magnitude = Math.abs(clampedScore);

    // Determine label
    let label: 'negative' | 'neutral' | 'positive';
    if (clampedScore > 0.1) {
      label = 'positive';
    } else if (clampedScore < -0.1) {
      label = 'negative';
    } else {
      label = 'neutral';
    }

    return {
      score: clampedScore,
      magnitude,
      label
    };
  }

  static validateDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    
    // Discard dates outside plausible Airbnb history (pre-2008 or future dates)
    return !isNaN(date.getTime()) && year >= 2008 && year <= new Date().getFullYear();
  }

  static calculateTimelineSentiment(data: Array<{created_at: string, raw_text: string}>): TimelineSentiment[] {
    // Filter out invalid dates
    const validData = data.filter(row => this.validateDate(row.created_at));
    
    if (validData.length === 0) return [];

    const monthlyGroups = validData.reduce((acc, row) => {
      const date = new Date(row.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(row.raw_text);
      return acc;
    }, {} as Record<string, string[]>);

    const timeline = Object.entries(monthlyGroups)
      .map(([month, texts]) => {
        const avgSentiment = this.calculateAverageSentiment(texts);
        const date = new Date(month + '-01');
        const formattedMonth = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
        return {
          month: formattedMonth,
          averageSentiment: Number(((avgSentiment.score + 1) / 2).toFixed(3)),
          reviewCount: texts.length
        };
      })
      .sort((a, b) => {
        // Parse MM/YY format for proper sorting
        const [monthA, yearA] = a.month.split('/');
        const [monthB, yearB] = b.month.split('/');
        const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1);
        const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1);
        return dateA.getTime() - dateB.getTime();
      });

    // Calculate month-to-month changes
    return timeline.map((item, index) => {
      if (index > 0) {
        const change = ((item.averageSentiment - timeline[index - 1].averageSentiment) / timeline[index - 1].averageSentiment) * 100;
        return { ...item, change: Number(change.toFixed(1)) };
      }
      return item;
    });
  }

  static detectAnomalies(data: Array<{review_id: string, raw_text: string, neighbourhood: string, created_at: string, language: string, sentiment_score?: number, anomaly_score?: number}>): AnomalyMetadata[] {
    // Filter out invalid dates first
    const validData = data.filter(row => this.validateDate(row.created_at));
    const anomalies: AnomalyMetadata[] = [];

    if (validData.length === 0) return anomalies;

    // Calculate sentiment for each review if not already provided
    const dataWithSentiment = validData.map(row => ({
      ...row,
      sentiment: row.sentiment_score !== undefined ? 
        { score: row.sentiment_score, magnitude: Math.abs(row.sentiment_score), label: row.sentiment_score > 0.1 ? 'positive' : row.sentiment_score < -0.1 ? 'negative' : 'neutral' as const } :
        this.analyzeSentiment(row.raw_text)
    }));

    // Group by neighbourhood to calculate baselines
    const neighbourhoodGroups = dataWithSentiment.reduce((acc, row) => {
      if (!acc[row.neighbourhood]) {
        acc[row.neighbourhood] = [];
      }
      acc[row.neighbourhood].push(row);
      return acc;
    }, {} as Record<string, typeof dataWithSentiment>);

    // Calculate neighbourhood sentiment baselines
    const neighbourhoodBaselines = Object.entries(neighbourhoodGroups).reduce((acc, [neighbourhood, reviews]) => {
      const sentiments = reviews.map(r => r.sentiment.score);
      const mean = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
      const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;
      const stdDev = Math.sqrt(variance);
      
      acc[neighbourhood] = {
        mean,
        stdDev: Math.max(stdDev, 0.2), // Minimum threshold to avoid over-sensitivity
        count: reviews.length
      };
      return acc;
    }, {} as Record<string, { mean: number, stdDev: number, count: number }>);

    // Calculate overall baseline for neighbourhoods with few reviews
    const allSentiments = dataWithSentiment.map(r => r.sentiment.score);
    const overallMean = allSentiments.reduce((sum, s) => sum + s, 0) / allSentiments.length;
    const overallVariance = allSentiments.reduce((sum, s) => sum + Math.pow(s - overallMean, 2), 0) / allSentiments.length;
    const overallStdDev = Math.sqrt(overallVariance);

    // Detect sentiment-based anomalies
    dataWithSentiment.forEach(row => {
      const baseline = neighbourhoodGroups[row.neighbourhood].length >= 5 ? 
        neighbourhoodBaselines[row.neighbourhood] : 
        { mean: overallMean, stdDev: overallStdDev, count: validData.length };

      const sentimentDeviation = Math.abs(row.sentiment.score - baseline.mean);
      const zScore = sentimentDeviation / baseline.stdDev;
      
      // Use anomaly_score from ChatGPT if available, otherwise use z-score
      const anomalyScore = row.anomaly_score !== undefined ? row.anomaly_score : zScore;
      
      // Flag as anomaly if significantly deviates from neighbourhood baseline
      if (anomalyScore > 2.0) { // 2 standard deviations
        let anomalyType: 'sentiment_negative' | 'sentiment_positive' | 'sentiment_neutral';
        let reason: string;
        
        if (row.sentiment.score < baseline.mean - (1.5 * baseline.stdDev)) {
          anomalyType = 'sentiment_negative';
          reason = `Unusually negative sentiment for ${row.neighbourhood}. Score: ${row.sentiment.score.toFixed(2)}, Neighbourhood avg: ${baseline.mean.toFixed(2)}`;
        } else if (row.sentiment.score > baseline.mean + (1.5 * baseline.stdDev)) {
          anomalyType = 'sentiment_positive';
          reason = `Unusually positive sentiment for ${row.neighbourhood}. Score: ${row.sentiment.score.toFixed(2)}, Neighbourhood avg: ${baseline.mean.toFixed(2)}`;
        } else {
          anomalyType = 'sentiment_neutral';
          reason = `Neutral sentiment with low emotional engagement, potentially indicating generic or template content. Anomaly score: ${anomalyScore.toFixed(2)}`;
        }

        anomalies.push({
          review_id: row.review_id,
          type: anomalyType,
          reason,
          example: row.raw_text.substring(0, 100) + (row.raw_text.length > 100 ? '...' : ''),
          neighbourhood: row.neighbourhood,
          created_at: row.created_at,
          sentiment_score: row.sentiment.score,
          anomaly_score: anomalyScore
        });
      }
      
      // Still flag extremely short reviews as they're likely not genuine
      else if (row.raw_text.length < 15) {
        anomalies.push({
          review_id: row.review_id,
          type: 'suspicious',
          reason: 'Extremely short review (likely spam or low-effort)',
          example: row.raw_text,
          neighbourhood: row.neighbourhood,
          created_at: row.created_at,
          sentiment_score: row.sentiment.score,
          anomaly_score: anomalyScore
        });
      }
      
      // Flag non-English reviews only if they're also sentiment anomalies
      else if (row.language !== 'en' && anomalyScore > 1.5) {
        anomalies.push({
          review_id: row.review_id,
          type: 'language',
          reason: `Non-English content (${row.language}) with unusual sentiment pattern`,
          example: row.raw_text.substring(0, 100) + (row.raw_text.length > 100 ? '...' : ''),
          neighbourhood: row.neighbourhood,
          created_at: row.created_at,
          sentiment_score: row.sentiment.score,
          anomaly_score: anomalyScore
        });
      }
    });

    return anomalies;
  }

  static calculateAverageSentiment(texts: string[]): SentimentResult {
    if (texts.length === 0) {
      return { score: 0, magnitude: 0, label: 'neutral' };
    }

    const sentiments = texts.map(text => this.analyzeSentiment(text));
    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const avgMagnitude = sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length;

    let label: 'negative' | 'neutral' | 'positive';
    if (avgScore > 0.1) {
      label = 'positive';
    } else if (avgScore < -0.1) {
      label = 'negative';
    } else {
      label = 'neutral';
    }

    return {
      score: avgScore,
      magnitude: avgMagnitude,
      label
    };
  }
}
