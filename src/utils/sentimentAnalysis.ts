
// Simple sentiment analysis utility (browser-based)
export interface SentimentResult {
  score: number; // -1 to 1 range
  magnitude: number; // 0 to 1 range
  label: 'negative' | 'neutral' | 'positive';
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
