
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, MapPin, MessageSquare, AlertTriangle, Languages } from "lucide-react";

interface StorytellerInsightsProps {
  csvData?: any[];
}

const StorytellerInsights = ({ csvData }: StorytellerInsightsProps) => {
  // Mock insights - in real implementation, these would be generated from actual CSV data
  const insights = [
    {
      id: 1,
      type: "Anomaly Cluster",
      icon: AlertTriangle,
      color: "bg-red-500",
      title: "Suspicious Review Burst Detected",
      story: "3 listings in Manhattan received 20+ suspiciously similar 5-star reviews within 48 hours in July 2024. All reviews contain identical phrases like 'perfect location' and 'amazing host' with minimal variation.",
      impact: "High",
      confidence: 94,
      details: {
        listings: ["5648", "7291", "3842"],
        timeframe: "July 15-17, 2024",
        patterns: ["Identical phrases", "Same time window", "Generic praise"]
      }
    },
    {
      id: 2,
      type: "Language Analysis",
      icon: Languages,
      color: "bg-blue-500",
      title: "Multi-language Anomaly Patterns",
      story: "Reviews in Spanish (15% of total dataset) show 30% higher anomaly rates than English ones. Most Spanish anomalies cluster around luxury listings in SoHo, suggesting targeted fake review campaigns.",
      impact: "Medium",
      confidence: 87,
      details: {
        languages: ["Spanish: 15%", "English: 78%", "French: 4%", "Other: 3%"],
        anomalyRates: "Spanish: 8.2%, English: 6.1%",
        hotspots: ["SoHo", "Tribeca", "West Village"]
      }
    },
    {
      id: 3,
      type: "Complaint Analysis",
      icon: MessageSquare,
      color: "bg-orange-500",
      title: "Cleanliness Complaints Concentrated",
      story: "45% of negative reviews mention 'cleanliness' issues, with 80% originating from luxury listings ($200+/night) in Upper East Side. This pattern suggests either maintenance issues or inflated expectations.",
      impact: "Medium",
      confidence: 78,
      details: {
        complaintTypes: ["Cleanliness: 45%", "Location: 23%", "Communication: 18%", "Amenities: 14%"],
        priceRange: "$200+ per night",
        neighbourhood: "Upper East Side"
      }
    },
    {
      id: 4,
      type: "Temporal Pattern",
      icon: TrendingUp,
      color: "bg-green-500",
      title: "Seasonal Review Manipulation",
      story: "Tourist season (June-August) shows 40% increase in fake reviews compared to off-season. Peak manipulation occurs 2 weeks before major events like NYC Marathon and Fashion Week.",
      impact: "High",
      confidence: 91,
      details: {
        seasons: ["Summer: +40% fake reviews", "Winter: Baseline", "Spring: +15%", "Fall: +25%"],
        events: ["NYC Marathon", "Fashion Week", "New Year's Eve"],
        leadTime: "2 weeks before events"
      }
    },
    {
      id: 5,
      type: "Geographic Analysis",
      icon: MapPin,
      color: "bg-purple-500",
      title: "Neighbourhood Trust Variance",
      story: "Brooklyn listings have 50% fewer anomalies than Manhattan, but when anomalies occur, they're 60% more likely to be coordinated campaigns affecting multiple listings in the same building.",
      impact: "Low",
      confidence: 72,
      details: {
        boroughs: ["Manhattan: 6.8% anomaly rate", "Brooklyn: 3.4% anomaly rate", "Queens: 4.1%"],
        campaignSize: "Brooklyn: 8+ listings per campaign",
        buildingClusters: "Same building campaigns: 60% higher in Brooklyn"
      }
    }
  ];

  const summaryStats = {
    totalInsights: insights.length,
    highImpact: insights.filter(i => i.impact === "High").length,
    avgConfidence: Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length),
    dataPoints: csvData?.length || 0
  };

  if (!csvData) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">Upload a CSV file to generate storyteller insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryStats.totalInsights}</div>
            <div className="text-sm text-slate-600">Generated Insights</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summaryStats.highImpact}</div>
            <div className="text-sm text-slate-600">High Impact Issues</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryStats.avgConfidence}%</div>
            <div className="text-sm text-slate-600">Avg Confidence</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{summaryStats.dataPoints.toLocaleString()}</div>
            <div className="text-sm text-slate-600">Data Points Analyzed</div>
          </CardContent>
        </Card>
      </div>

      {/* Insights List */}
      <div className="space-y-6">
        {insights.map((insight) => {
          const IconComponent = insight.icon;
          return (
            <Card key={insight.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${insight.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-lg">{insight.title}</div>
                      <div className="text-sm text-slate-500 font-normal">{insight.type}</div>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={insight.impact === 'High' ? 'destructive' : insight.impact === 'Medium' ? 'default' : 'secondary'}>
                      {insight.impact} Impact
                    </Badge>
                    <Badge variant="outline">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-slate-700 leading-relaxed">{insight.story}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {Object.entries(insight.details).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="font-semibold text-slate-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-slate-600">
                        {Array.isArray(value) ? (
                          <ul className="space-y-1">
                            {value.map((item, index) => (
                              <li key={index}>• {item}</li>
                            ))}
                          </ul>
                        ) : (
                          value
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm">
                    View Raw Data
                  </Button>
                  <Button variant="outline" size="sm">
                    Export Insight
                  </Button>
                  <Button variant="outline" size="sm">
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Panel */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Storyteller Agent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto flex-col gap-2 p-4">
              <FileText className="w-5 h-5" />
              <span>Generate Executive Summary</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <TrendingUp className="w-5 h-5" />
              <span>Create Trend Report</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 p-4">
              <AlertTriangle className="w-5 h-5" />
              <span>Export Anomaly Alerts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorytellerInsights;
