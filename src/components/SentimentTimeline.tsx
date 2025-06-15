import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import { SentimentAnalyzer } from "@/utils/sentimentAnalysis";

interface SentimentTimelineProps {
  selectedNeighbourhood?: string;
  selectedLanguage?: string;
}

const SentimentTimeline = ({ selectedNeighbourhood = "all", selectedLanguage = "all" }: SentimentTimelineProps) => {
  const { cleanedData, enhancedData, isDataReady, isEnhanced, isAnalysisStarted } = useCSVDataStore();

  const timelineData = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0 || !isAnalysisStarted) {
      return [];
    }

    // Use enhanced data if available, otherwise use cleaned data
    const dataToUse = isEnhanced && enhancedData.length > 0 ? enhancedData : cleanedData;

    // Apply filters to the data
    let filteredData = dataToUse;
    
    if (selectedNeighbourhood !== "all") {
      filteredData = filteredData.filter(row => row.neighbourhood === selectedNeighbourhood);
    }
    
    if (selectedLanguage !== "all") {
      filteredData = filteredData.filter(row => row.language === selectedLanguage);
    }

    // If no data after filtering, return empty array
    if (filteredData.length === 0) {
      return [];
    }

    return SentimentAnalyzer.calculateTimelineSentiment(filteredData);
  }, [cleanedData, enhancedData, isDataReady, isEnhanced, selectedNeighbourhood, selectedLanguage]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Sentiment: <span className="font-medium">{data.averageSentiment.toFixed(3)}</span>
          </p>
          <p className="text-sm">
            Reviews: <span className="font-medium">{data.reviewCount}</span>
          </p>
          {data.change && (
            <p className="text-sm flex items-center gap-1">
              {data.change > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={data.change > 0 ? "text-green-600" : "text-red-600"}>
                {data.change > 0 ? '+' : ''}{data.change}% from previous month
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!isDataReady || timelineData.length === 0) {
    const noDataMessage = !isDataReady 
      ? "Upload CSV data to view sentiment timeline"
      : "No data available for the selected filters";

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sentiment Over Time
            {(selectedNeighbourhood !== "all" || selectedLanguage !== "all") && (
              <span className="text-sm font-normal text-slate-500">
                (Filtered)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">{noDataMessage}</p>
          {(selectedNeighbourhood !== "all" || selectedLanguage !== "all") && (
            <p className="text-xs text-slate-500 mt-2">
              Try adjusting your filters to see more data
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Sentiment Over Time
          {(selectedNeighbourhood !== "all" || selectedLanguage !== "all") && (
            <span className="text-sm font-normal text-slate-500">
              (Filtered: {timelineData.reduce((sum, item) => sum + item.reviewCount, 0)} reviews)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 1]} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="averageSentiment" 
              stroke="#8884d8" 
              fill="url(#sentimentGradient)" 
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SentimentTimeline;
