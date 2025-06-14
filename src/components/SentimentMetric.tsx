import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { SentimentAnalyzer } from "@/utils/sentimentAnalysis";
import { CleanedRow } from "@/utils/dataPreprocessing";

interface SentimentMetricProps {
  filteredData: CleanedRow[];
}

const SentimentMetric = ({ filteredData }: SentimentMetricProps) => {
  const sentimentData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return null;
    }

    const texts = filteredData.map(row => row.raw_text);
    const avgSentiment = SentimentAnalyzer.calculateAverageSentiment(texts);
    
    // Convert to 0-1 scale for display
    const displayScore = ((avgSentiment.score + 1) / 2);
    
    return {
      score: displayScore,
      label: avgSentiment.label,
      magnitude: avgSentiment.magnitude,
      rawScore: avgSentiment.score
    };
  }, [filteredData]);

  if (!sentimentData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Average Sentiment</p>
              <p className="text-2xl font-bold text-slate-400">--</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Minus className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getColor = (score: number) => {
    if (score > 0.6) return { bg: "bg-green-500", text: "text-green-600", icon: "bg-green-100" };
    if (score > 0.4) return { bg: "bg-yellow-500", text: "text-yellow-600", icon: "bg-yellow-100" };
    return { bg: "bg-red-500", text: "text-red-600", icon: "bg-red-100" };
  };

  const getTrendIcon = (label: string) => {
    switch (label) {
      case 'positive': return TrendingUp;
      case 'negative': return TrendingDown;
      default: return Minus;
    }
  };

  const colors = getColor(sentimentData.score);
  const TrendIcon = getTrendIcon(sentimentData.label);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">Average Sentiment</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${colors.text}`}>
                {sentimentData.score.toFixed(2)}/1
              </p>
              <Badge variant={sentimentData.label === 'positive' ? 'default' : sentimentData.label === 'negative' ? 'destructive' : 'secondary'}>
                {sentimentData.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Confidence: {(sentimentData.magnitude * 100).toFixed(0)}%
            </p>
          </div>
          <div className={`w-10 h-10 ${colors.icon} rounded-lg flex items-center justify-center`}>
            <TrendIcon className={`w-5 h-5 ${colors.text}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentMetric;
