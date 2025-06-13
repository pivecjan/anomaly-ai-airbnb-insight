
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Eye, TrendingDown, Bot, MapPin, Clock } from "lucide-react";

const AnomalyDetection = () => {
  const anomalies = [
    {
      id: "1",
      type: "Fake Review Pattern",
      severity: "high",
      listing_id: "5648",
      reviewer: "bot_user_123",
      comment: "This is the best place ever! Amazing! Perfect! Incredible! Best host ever!",
      confidence: 0.94,
      reasons: ["Excessive positive adjectives", "Bot-like username", "Pattern matches known fake reviews"],
      timestamp: "2023-05-09 14:23"
    },
    {
      id: "2",
      type: "Sentiment Manipulation",
      severity: "medium",
      listing_id: "7291",
      reviewer: "happy_traveler_42",
      comment: "Outstanding experience! Five stars! Recommend to everyone! Perfect host!",
      confidence: 0.78,
      reasons: ["Unnaturally positive language", "Multiple exclamation marks", "Generic praise"],
      timestamp: "2023-05-08 09:15"
    },
    {
      id: "3",
      type: "Geographic Inconsistency",
      severity: "low",
      listing_id: "3842",
      reviewer: "John_NYC",
      comment: "Lovely place in downtown Manhattan, close to everything.",
      confidence: 0.65,
      reasons: ["Review mentions location details not matching listing", "Possible location spoofing"],
      timestamp: "2023-05-07 16:45"
    },
    {
      id: "4",
      type: "Temporal Anomaly",
      severity: "medium",
      listing_id: "9156",
      reviewer: "travel_enthusiast",
      comment: "Great stay! Host was responsive and place was clean.",
      confidence: 0.72,
      reasons: ["Review posted outside normal business hours", "Rapid succession of reviews"],
      timestamp: "2023-05-06 03:22"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <TrendingDown className="w-4 h-4" />;
      case 'low': return <Eye className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Fake')) return <Bot className="w-4 h-4" />;
    if (type.includes('Geographic')) return <MapPin className="w-4 h-4" />;
    if (type.includes('Temporal')) return <Clock className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const detectionMethods = [
    {
      name: "NLP Sentiment Analysis",
      description: "Analyzes text patterns and sentiment irregularities",
      accuracy: "94%",
      status: "active"
    },
    {
      name: "User Behavior Analysis",
      description: "Detects unusual posting patterns and user profiles",
      accuracy: "87%",
      status: "active"
    },
    {
      name: "Geographic Validation",
      description: "Cross-references review content with listing locations",
      accuracy: "78%",
      status: "active"
    },
    {
      name: "Temporal Pattern Detection",
      description: "Identifies suspicious timing patterns in reviews",
      accuracy: "82%",
      status: "active"
    }
  ];

  return (
    <div className="space-y-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <strong>137 anomalies detected</strong> in the current dataset. Review the flagged items below for potential fake reviews or suspicious patterns.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="anomalies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
          <TabsTrigger value="anomalies">Detected Anomalies</TabsTrigger>
          <TabsTrigger value="methods">Detection Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="anomalies" className="space-y-6">
          <div className="grid gap-6">
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(anomaly.type)}
                      {anomaly.type}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(anomaly.severity)} className="flex items-center gap-1">
                        {getSeverityIcon(anomaly.severity)}
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {Math.round(anomaly.confidence * 100)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Review Details</h4>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Listing:</strong> #{anomaly.listing_id} | <strong>Reviewer:</strong> {anomaly.reviewer}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        <strong>Posted:</strong> {anomaly.timestamp}
                      </p>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm italic">"{anomaly.comment}"</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Detection Reasons</h4>
                      <ul className="space-y-1">
                        {anomaly.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Full Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Mark as Reviewed
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {detectionMethods.map((method, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{method.name}</span>
                    <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                      {method.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">{method.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Accuracy:</span>
                    <Badge variant="outline">{method.accuracy}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Machine Learning Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">Data Preprocessing</h4>
                    <p className="text-sm text-blue-600 mt-1">Text cleaning & tokenization</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">Feature Extraction</h4>
                    <p className="text-sm text-green-600 mt-1">NLP embeddings & patterns</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-800">Model Inference</h4>
                    <p className="text-sm text-purple-600 mt-1">Anomaly classification</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-800">Post-processing</h4>
                    <p className="text-sm text-orange-600 mt-1">Confidence scoring</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnomalyDetection;
