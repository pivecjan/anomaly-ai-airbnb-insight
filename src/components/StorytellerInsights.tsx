
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, TrendingUp, MapPin, MessageSquare, AlertTriangle, Languages } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";

const StorytellerInsights = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();

  // Generate insights from real CSV data
  const insights = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return [];
    }

    const generatedInsights = [];
    
    // Analyze language distribution
    const languageGroups = cleanedData.reduce((acc, row) => {
      acc[row.language] = (acc[row.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalReviews = cleanedData.length;
    const nonEnglishCount = totalReviews - (languageGroups.en || 0);
    const nonEnglishPercentage = ((nonEnglishCount / totalReviews) * 100).toFixed(1);

    if (nonEnglishCount > 0) {
      generatedInsights.push({
        id: 1,
        type: "Language Analysis",
        icon: Languages,
        color: "bg-blue-500",
        title: "Multi-language Review Distribution",
        story: `Analysis of ${totalReviews.toLocaleString()} reviews reveals ${nonEnglishPercentage}% are in non-English languages. The dataset contains reviews in ${Object.keys(languageGroups).length} different languages, indicating a diverse international customer base.`,
        impact: nonEnglishCount > totalReviews * 0.2 ? "High" : "Medium",
        confidence: 95,
        details: {
          languages: Object.entries(languageGroups).map(([lang, count]) => 
            `${lang.toUpperCase()}: ${count} (${((count / totalReviews) * 100).toFixed(1)}%)`
          ),
          totalReviews: `${totalReviews.toLocaleString()} reviews analyzed`,
          diversity: `${Object.keys(languageGroups).length} languages detected`
        }
      });
    }

    // Analyze neighbourhood distribution
    const neighbourhoodGroups = cleanedData.reduce((acc, row) => {
      acc[row.neighbourhood] = (acc[row.neighbourhood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topNeighbourhoods = Object.entries(neighbourhoodGroups)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    if (topNeighbourhoods.length > 0) {
      generatedInsights.push({
        id: 2,
        type: "Geographic Analysis",
        icon: MapPin,
        color: "bg-green-500",
        title: "Neighbourhood Review Concentration",
        story: `Review activity is concentrated in key areas: ${topNeighbourhoods[0][0]} leads with ${topNeighbourhoods[0][1]} reviews (${((topNeighbourhoods[0][1] / totalReviews) * 100).toFixed(1)}% of total). This concentration suggests these areas are primary tourist destinations or have higher listing density.`,
        impact: "Medium",
        confidence: 88,
        details: {
          topAreas: topNeighbourhoods.map(([area, count]) => 
            `${area}: ${count} reviews (${((count / totalReviews) * 100).toFixed(1)}%)`
          ),
          totalAreas: `${Object.keys(neighbourhoodGroups).length} neighbourhoods covered`,
          concentration: `Top 3 areas account for ${((topNeighbourhoods.reduce((sum, [,count]) => sum + count, 0) / totalReviews) * 100).toFixed(1)}% of reviews`
        }
      });
    }

    // Analyze review clustering by listing
    const listingGroups = cleanedData.reduce((acc, row) => {
      acc[row.listing_id] = (acc[row.listing_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const multipleReviewListings = Object.values(listingGroups).filter(count => count > 1).length;
    const avgReviewsPerListing = totalReviews / Object.keys(listingGroups).length;

    generatedInsights.push({
      id: 3,
      type: "Review Pattern Analysis",
      icon: TrendingUp,
      color: "bg-purple-500",
      title: "Review Distribution Patterns",
      story: `Dataset contains ${Object.keys(listingGroups).length.toLocaleString()} unique listings with an average of ${avgReviewsPerListing.toFixed(1)} reviews per listing. ${multipleReviewListings} listings (${((multipleReviewListings / Object.keys(listingGroups).length) * 100).toFixed(1)}%) have multiple reviews, indicating repeat customer engagement or sustained booking activity.`,
      impact: "Low",
      confidence: 92,
      details: {
        uniqueListings: `${Object.keys(listingGroups).length.toLocaleString()} unique properties`,
        averageReviews: `${avgReviewsPerListing.toFixed(1)} reviews per listing`,
        multipleReviews: `${multipleReviewListings} listings with multiple reviews`
      }
    });

    return generatedInsights;
  }, [cleanedData, isDataReady]);

  const summaryStats = {
    totalInsights: insights.length,
    highImpact: insights.filter(i => i.impact === "High").length,
    avgConfidence: insights.length > 0 ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length) : 0,
    dataPoints: cleanedData.length
  };

  if (!isDataReady) {
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
