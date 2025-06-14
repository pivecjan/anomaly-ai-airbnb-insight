
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, MapPin, Clock, FileText } from "lucide-react";

interface AnomalyDetectionProps {
  csvData?: any[];
}

const AnomalyDetection = ({ csvData }: AnomalyDetectionProps) => {
  // Use csvData if available, otherwise use mock data
  const sampleData = csvData?.slice(0, 20) || [
    { review_id: "1", listing_id: "2539", neighbourhood: "Manhattan", created_at: "2023-05-14", language: "en", raw_text: "Amazing place!" },
    { review_id: "2", listing_id: "2539", neighbourhood: "Manhattan", created_at: "2023-05-12", language: "en", raw_text: "Perfect stay!" },
    { review_id: "3", listing_id: "3831", neighbourhood: "Brooklyn", created_at: "2023-05-10", language: "en", raw_text: "Good location" },
    { review_id: "4", listing_id: "5648", neighbourhood: "Queens", created_at: "2023-05-09", language: "en", raw_text: "This is the best place ever! Amazing! Perfect! Incredible! Best host ever!" },
    { review_id: "5", listing_id: "7291", neighbourhood: "Brooklyn", created_at: "2023-05-08", language: "es", raw_text: "Apartamento agradable" }
  ];

  // Mock anomaly detection results
  const anomalies = [
    {
      id: 1,
      type: "Fake Review Cluster",
      severity: "high",
      description: "5 suspiciously similar reviews for listing #2539 in Manhattan",
      affected_reviews: 5,
      confidence: 0.89,
      listing_id: "2539",
      neighbourhood: "Manhattan"
    },
    {
      id: 2,
      type: "Review Burst",
      severity: "medium",
      description: "Unusual spike of 15 reviews in Brooklyn on 2023-05-10",
      affected_reviews: 15,
      confidence: 0.74,
      listing_id: "multiple",
      neighbourhood: "Brooklyn"
    },
    {
      id: 3,
      type: "Sentiment Anomaly",
      severity: "low",
      description: "Negative sentiment cluster in Queens luxury listings",
      affected_reviews: 8,
      confidence: 0.65,
      listing_id: "multiple",
      neighbourhood: "Queens"
    }
  ];

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
