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
  type: 'suspicious' | 'complaint' | 'language';
  reason: string;
  example: string;
  neighbourhood: string;
  created_at: string;
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

  static detectAnomalies(data: Array<{review_id: string, raw_text: string, neighbourhood: string, created_at: string, language: string}>): AnomalyMetadata[] {
    // Filter out invalid dates first
    const validData = data.filter(row => this.validateDate(row.created_at));
    const anomalies: AnomalyMetadata[] = [];

    validData.forEach(row => {
      const text = row.raw_text.toLowerCase();
      
      // Detect complaints
      const complaintKeywords = ['dirty', 'clean', 'smell', 'noise', 'broken', 'uncomfortable', 'rude', 'terrible'];
      if (complaintKeywords.some(keyword => text.includes(keyword))) {
        anomalies.push({
          review_id: row.review_id,
          type: 'complaint',
          reason: 'Contains complaint keywords',
          example: row.raw_text.substring(0, 50) + '...',
          neighbourhood: row.neighbourhood,
          created_at: row.created_at
        });
      }

      // Detect suspicious patterns
      if (text.length < 20 || /(.)\1{3,}/.test(text)) {
        anomalies.push({
          review_id: row.review_id,
          type: 'suspicious',
          reason: 'Repetitive or too short',
          example: row.raw_text.substring(0, 50) + '...',
          neighbourhood: row.neighbourhood,
          created_at: row.created_at
        });
      }

      // Detect language issues
      if (row.language !== 'en') {
        anomalies.push({
          review_id: row.review_id,
          type: 'language',
          reason: `Non-English content (${row.language})`,
          example: row.raw_text.substring(0, 50) + '...',
          neighbourhood: row.neighbourhood,
          created_at: row.created_at
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
