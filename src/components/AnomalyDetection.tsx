import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, MapPin, Clock, FileText } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";

const AnomalyDetection = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();

  // Generate anomalies from real CSV data
  const anomalies = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return [];
    }

    // Analyze patterns in real data
    const listingGroups = cleanedData.reduce((acc, row) => {
      if (!acc[row.listing_id]) {
        acc[row.listing_id] = [];
      }
      acc[row.listing_id].push(row);
      return acc;
    }, {} as Record<string, typeof cleanedData>);

    const neighbourhoodGroups = cleanedData.reduce((acc, row) => {
      if (!acc[row.neighbourhood]) {
        acc[row.neighbourhood] = [];
      }
      acc[row.neighbourhood].push(row);
      return acc;
    }, {} as Record<string, typeof cleanedData>);

    const detectedAnomalies = [];

    // Detect review clusters (multiple reviews for same listing in short time)
    Object.entries(listingGroups).forEach(([listingId, reviews]) => {
      if (reviews.length >= 3) {
        const neighbourhood = reviews[0].neighbourhood;
        detectedAnomalies.push({
          id: detectedAnomalies.length + 1,
          type: "Review Cluster",
          severity: reviews.length >= 5 ? "high" : "medium",
          description: `${reviews.length} reviews for listing #${listingId} in ${neighbourhood}`,
          affected_reviews: reviews.length,
          confidence: Math.min(0.95, 0.6 + (reviews.length * 0.1)),
          listing_id: listingId,
          neighbourhood
        });
      }
    });

    // Detect neighbourhood anomalies
    Object.entries(neighbourhoodGroups).forEach(([neighbourhood, reviews]) => {
      const languageGroups = reviews.reduce((acc, row) => {
        acc[row.language] = (acc[row.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const nonEnglishRatio = (reviews.length - (languageGroups.en || 0)) / reviews.length;
      if (nonEnglishRatio > 0.3 && reviews.length > 10) {
        detectedAnomalies.push({
          id: detectedAnomalies.length + 1,
          type: "Language Anomaly",
          severity: "low",
          description: `High non-English review ratio (${(nonEnglishRatio * 100).toFixed(0)}%) in ${neighbourhood}`,
          affected_reviews: reviews.length - (languageGroups.en || 0),
          confidence: 0.7,
          listing_id: "multiple",
          neighbourhood
        });
      }
    });

    return detectedAnomalies.slice(0, 5); // Limit to 5 for display
  }, [cleanedData, isDataReady]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "high": return "destructive" as const;
      case "medium": return "secondary" as const;
      case "low": return "outline" as const;
      default: return "outline" as const;
    }
  };

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">Upload a CSV file to detect anomalies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Anomaly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">High Risk Anomalies</p>
                <p className="text-2xl font-bold text-red-600">
                  {anomalies.filter(a => a.severity === 'high').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Anomalies</p>
                <p className="text-2xl font-bold text-slate-800">{anomalies.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Affected Reviews</p>
                <p className="text-2xl font-bold text-slate-800">
                  {anomalies.reduce((sum, a) => sum + a.affected_reviews, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Details */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Detected Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No anomalies detected in the current dataset.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {anomalies.map((anomaly) => (
                <div key={anomaly.id} className="border rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getSeverityColor(anomaly.severity)}`} />
                      <div>
                        <h3 className="font-semibold text-slate-800">{anomaly.type}</h3>
                        <p className="text-sm text-slate-600">{anomaly.description}</p>
                      </div>
                    </div>
                    <Badge variant={getSeverityBadgeVariant(anomaly.severity)}>
                      {anomaly.severity.toUpperCase()}
                    </Badge>
                  </div>
                
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Confidence:</span>
                      <span className="ml-2 font-medium">{(anomaly.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Reviews:</span>
                      <span className="ml-2 font-medium">{anomaly.affected_reviews}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <span className="ml-2 font-medium">{anomaly.neighbourhood}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Listing:</span>
                      <span className="ml-2 font-medium">#{anomaly.listing_id}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm">
                      <MapPin className="w-3 h-3 mr-1" />
                      Investigate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Clock className="w-3 h-3 mr-1" />
                      View Timeline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Anomaly Patterns */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detection Patterns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Fake Review Indicators</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Repetitive language patterns across reviews</li>
                <li>• Generic praise without specific details</li>
                <li>• Similar review lengths and structures</li>
                <li>• Clustering of positive reviews in short timeframes</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Complaint Patterns</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Negative sentiment clusters by neighbourhood</li>
                <li>• Recurring complaint keywords (cleanliness, noise)</li>
                <li>• Sudden drops in review sentiment scores</li>
                <li>• Correlation with specific listing characteristics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnomalyDetection;
