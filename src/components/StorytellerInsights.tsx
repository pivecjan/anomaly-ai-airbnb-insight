
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, MapPin, Calendar, MessageSquare, FileText } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";

const StorytellerInsights = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();

  const insights = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return null;
    }

    // Generate insights from real CSV data
    const totalReviews = cleanedData.length;
    const uniqueListings = new Set(cleanedData.map(row => row.listing_id)).size;
    const neighbourhoods = [...new Set(cleanedData.map(row => row.neighbourhood))];
    const languages = [...new Set(cleanedData.map(row => row.language))];

    // Time analysis
    const dateGroups = cleanedData.reduce((acc, row) => {
      const date = row.created_at.split(' ')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dates = Object.keys(dateGroups).sort();
    const dateRange = dates.length > 0 ? `${dates[0]} to ${dates[dates.length - 1]}` : 'N/A';

    // Language distribution
    const englishReviews = cleanedData.filter(row => row.language === 'en').length;
    const englishPercentage = ((englishReviews / totalReviews) * 100).toFixed(1);

    // Top neighbourhoods by review count
    const neighbourhoodCounts = cleanedData.reduce((acc, row) => {
      acc[row.neighbourhood] = (acc[row.neighbourhood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topNeighbourhoods = Object.entries(neighbourhoodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    return {
      totalReviews,
      uniqueListings,
      neighbourhoods: neighbourhoods.length,
      languages: languages.length,
      dateRange,
      englishPercentage,
      topNeighbourhoods
    };
  }, [cleanedData, isDataReady]);

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Insights Available</h3>
          <p className="text-slate-600">Upload a CSV file to generate insights</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Dataset Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Dataset Metrics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Reviews:</span>
                  <span className="font-medium">{insights?.totalReviews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Unique Listings:</span>
                  <span className="font-medium">{insights?.uniqueListings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Neighbourhoods:</span>
                  <span className="font-medium">{insights?.neighbourhoods}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Languages:</span>
                  <span className="font-medium">{insights?.languages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date Range:</span>
                  <span className="font-medium text-xs">{insights?.dateRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">English Reviews:</span>
                  <span className="font-medium">{insights?.englishPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-800">Top Neighbourhoods</h3>
              <div className="space-y-2">
                {insights?.topNeighbourhoods.map((neighbourhood, index) => (
                  <div key={neighbourhood.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                      <span className="text-sm text-slate-700">{neighbourhood.name}</span>
                    </div>
                    <span className="text-sm font-medium">{neighbourhood.count} reviews</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Review Distribution</h4>
              <p className="text-sm text-blue-700">
                The dataset contains {insights?.totalReviews.toLocaleString()} reviews across {insights?.uniqueListings} unique listings, 
                spanning {insights?.neighbourhoods} different neighbourhoods. This provides a comprehensive view of the review landscape.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Language Coverage</h4>
              <p className="text-sm text-green-700">
                {insights?.englishPercentage}% of reviews are in English, with {insights?.languages} different languages represented. 
                This multilingual data enables comprehensive sentiment analysis across diverse user bases.
              </p>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Geographic Insights</h4>
              <p className="text-sm text-purple-700">
                The top neighbourhood "{insights?.topNeighbourhoods[0]?.name}" has {insights?.topNeighbourhoods[0]?.count} reviews, 
                suggesting it's either a popular area or may require anomaly detection to identify unusual review patterns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Recommendations */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Analysis Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Anomaly Detection Focus</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Monitor high-volume neighbourhoods for review clustering</li>
                <li>• Analyze sentiment patterns across different languages</li>
                <li>• Check for temporal anomalies in review posting</li>
                <li>• Identify listings with unusual review frequencies</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-800">Data Quality Assessment</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>• Review language detection accuracy</li>
                <li>• Validate neighbourhood categorization</li>
                <li>• Check for duplicate or near-duplicate content</li>
                <li>• Assess review length distribution patterns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorytellerInsights;
