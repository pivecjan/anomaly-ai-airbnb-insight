import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, MessageSquare, Globe, PieChart } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import { SentimentAnalyzer, AnomalyMetadata } from "@/utils/sentimentAnalysis";

const AnomalyInsights = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();

  const anomalyAnalysis = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return null;
    }

    // Calculate anomaly scores for all reviews using the same logic as EnhancedAnomalyTable
    const reviewsWithScores = cleanedData.map(row => {
      const sentiment = SentimentAnalyzer.analyzeSentiment(row.raw_text);
      
      // Calculate enhanced anomaly score: (sentiment_deviation * 0.7) + (language_risk * 0.3)
      const avgSentiment = 0.6; // Average baseline sentiment
      const sentimentDeviation = Math.abs(sentiment.score - avgSentiment);
      const languageRisk = row.language !== 'en' ? 0.8 : 0.2;
      const anomaly_score = Math.min(1.0, (sentimentDeviation * 0.7) + (languageRisk * 0.3));

      return {
        ...row,
        anomaly_score,
        sentiment
      };
    });

    // Filter only reviews with anomaly score > 0.8
    const trueAnomalies = reviewsWithScores.filter(row => row.anomaly_score > 0.8);

    // Classify anomalies by type based on content analysis
    const classifiedAnomalies: AnomalyMetadata[] = trueAnomalies.map(row => {
      const text = row.raw_text.toLowerCase();
      
      // Determine anomaly type based on content
      let type: 'suspicious' | 'complaint' | 'language' = 'suspicious';
      let reason = 'High anomaly score';

      // Check for complaints first
      const complaintKeywords = ['dirty', 'clean', 'smell', 'noise', 'broken', 'uncomfortable', 'rude', 'terrible'];
      if (complaintKeywords.some(keyword => text.includes(keyword))) {
        type = 'complaint';
        reason = 'Contains complaint keywords';
      }
      // Check for language issues
      else if (row.language !== 'en') {
        type = 'language';
        reason = `Non-English content (${row.language})`;
      }
      // Check for suspicious patterns
      else if (text.length < 20 || /(.)\1{3,}/.test(text)) {
        type = 'suspicious';
        reason = 'Repetitive or too short';
      }

      return {
        review_id: row.review_id,
        type,
        reason,
        example: row.raw_text.substring(0, 50) + '...',
        neighbourhood: row.neighbourhood,
        created_at: row.created_at
      };
    });

    const typeGroups = classifiedAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || []).concat(anomaly);
      return acc;
    }, {} as Record<string, AnomalyMetadata[]>);

    const neighbourhoodGroups = classifiedAnomalies.reduce((acc, anomaly) => {
      acc[anomaly.neighbourhood] = (acc[anomaly.neighbourhood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topNeighbourhoods = Object.entries(neighbourhoodGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      totalAnomalies: classifiedAnomalies.length,
      typeGroups,
      topNeighbourhoods,
      percentage: ((classifiedAnomalies.length / cleanedData.length) * 100).toFixed(1)
    };
  }, [cleanedData, isDataReady]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suspicious': return AlertTriangle;
      case 'complaint': return MessageSquare;
      case 'language': return Globe;
      default: return PieChart;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'suspicious': return 'bg-red-100 text-red-600 border-red-200';
      case 'complaint': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'language': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getTypeDescription = (type: string, count: number) => {
    const percentage = anomalyAnalysis ? ((count / anomalyAnalysis.totalAnomalies) * 100).toFixed(0) : 0;
    
    switch (type) {
      case 'suspicious':
        return {
          title: 'Suspicious Patterns',
          description: `${percentage}% of anomalies show repetitive text or suspiciously short reviews`,
          impact: 'May indicate fake or bot-generated content'
        };
      case 'complaint':
        return {
          title: 'Customer Complaints',
          description: `${percentage}% of anomalies contain complaint keywords related to cleanliness, noise, or service`,
          impact: 'Potential guest retention issues and reputation risks'
        };
      case 'language':
        return {
          title: 'Language Issues',
          description: `${percentage}% of anomalies are non-English reviews without translation`,
          impact: 'May affect review comprehension and sentiment analysis accuracy'
        };
      default:
        return {
          title: 'Other Issues',
          description: `${percentage}% of anomalies fall into miscellaneous categories`,
          impact: 'Requires manual review for classification'
        };
    }
  };

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
          <p className="text-slate-600">Upload a CSV file to analyze anomalies</p>
        </CardContent>
      </Card>
    );
  }

  if (!anomalyAnalysis || anomalyAnalysis.totalAnomalies === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <PieChart className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <h3 className="text-lg font-semibold mb-2 text-green-600">No Anomalies Detected</h3>
          <p className="text-slate-600">Your review dataset appears to be clean and normal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomaly Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{anomalyAnalysis.totalAnomalies}</p>
              <p className="text-sm text-slate-600">Total Anomalies</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{anomalyAnalysis.percentage}%</p>
              <p className="text-sm text-slate-600">Of Total Reviews</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{Object.keys(anomalyAnalysis.typeGroups).length}</p>
              <p className="text-sm text-slate-600">Anomaly Types</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(anomalyAnalysis.typeGroups).map(([type, anomalies]) => {
          const TypeIcon = getTypeIcon(type);
          const typeInfo = getTypeDescription(type, anomalies.length);
          const percentage = (anomalies.length / anomalyAnalysis.totalAnomalies) * 100;

          return (
            <Card key={type} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TypeIcon className="w-5 h-5" />
                  {typeInfo.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getTypeColor(type)}>
                    {anomalies.length} cases
                  </Badge>
                  <span className="text-sm font-medium">{percentage.toFixed(0)}%</span>
                </div>
                
                <Progress value={percentage} className="h-2" />
                
                <div className="space-y-2">
                  <p className="text-sm text-slate-700">{typeInfo.description}</p>
                  <p className="text-xs text-slate-500 italic">{typeInfo.impact}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Recent Examples:</h4>
                  {anomalies.slice(0, 2).map((anomaly, index) => (
                    <div key={index} className="p-2 bg-slate-50 rounded text-xs">
                      <p className="font-medium">{anomaly.neighbourhood}</p>
                      <p className="text-slate-600 truncate">{anomaly.example}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Affected Neighbourhoods */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Most Affected Neighbourhoods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalyAnalysis.topNeighbourhoods.map(([neighbourhood, count], index) => (
              <div key={neighbourhood} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  <span className="font-medium">{neighbourhood}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">{count} anomalies</span>
                  <Progress 
                    value={(count / anomalyAnalysis.totalAnomalies) * 100} 
                    className="w-16 h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyInsights;
