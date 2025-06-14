import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MapPin, Calendar, AlertTriangle, FileText } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import { SentimentAnalyzer } from "@/utils/sentimentAnalysis";
import SentimentMetric from "./SentimentMetric";
import SentimentTimeline from "./SentimentTimeline";

const Dashboard = () => {
  const { cleanedData, enhancedData, isDataReady, isEnhanced, isAnalysisStarted } = useCSVDataStore();
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const analytics = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0 || !isAnalysisStarted) {
      return null;
    }

    // Use enhanced data if available, otherwise use cleaned data
    const dataToUse = isEnhanced && enhancedData.length > 0 ? enhancedData : cleanedData;
    let filteredData = dataToUse;
    
    if (selectedNeighbourhood !== "all") {
      filteredData = filteredData.filter(row => row.neighbourhood === selectedNeighbourhood);
    }
    
    if (selectedLanguage !== "all") {
      filteredData = filteredData.filter(row => row.language === selectedLanguage);
    }

    const dateGroups = filteredData.reduce((acc, row) => {
      const date = new Date(row.created_at.split(' ')[0]);
      const monthYear = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
      acc[monthYear] = (acc[monthYear] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timeSeriesData = Object.entries(dateGroups)
      .sort(([a], [b]) => {
        // Sort by year then month for proper chronological order
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        const dateA = new Date(2000 + parseInt(yearA), parseInt(monthA) - 1);
        const dateB = new Date(2000 + parseInt(yearB), parseInt(monthB) - 1);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([date, count]) => ({
        name: date,
        reviews: count,
        date
      }));

    const languageGroups = filteredData.reduce((acc, row) => {
      acc[row.language] = ((acc[row.language] as number) || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageData = Object.entries(languageGroups).map(([lang, count]) => ({
      name: lang.toUpperCase(),
      value: count,
      percentage: ((count / filteredData.length) * 100).toFixed(1)
    }));

    // Calculate actual anomalies using the same logic as legacy anomaly detection
    const detectedAnomalies = SentimentAnalyzer.detectAnomalies(filteredData);
    const anomalyCount = detectedAnomalies.length;

    // Get all distinct neighbourhoods from the uploaded CSV data (using dataToUse for consistency)
    const allNeighbourhoods = [...new Set(dataToUse
      .map(row => row.neighbourhood)
      .filter(neighbourhood => neighbourhood && neighbourhood.trim() !== '')
    )].sort(); // Sort alphabetically for better UX

    return {
      filteredData,
      totalReviews: filteredData.length,
      anomalyCount,
      timeSeriesData,
      languageData,
      neighbourhoods: allNeighbourhoods,
      languages: [...new Set(dataToUse.map(row => row.language).filter(l => l && l.trim() !== ''))]
    };
  }, [cleanedData, enhancedData, isDataReady, isEnhanced, selectedNeighbourhood, selectedLanguage, isAnalysisStarted]);

  const colours = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">Upload a CSV file to begin analysis</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Data Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={setSelectedNeighbourhood}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Neighbourhood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Neighbourhoods</SelectItem>
              {analytics?.neighbourhoods.map(neighbourhood => (
                <SelectItem key={neighbourhood} value={neighbourhood}>{neighbourhood}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {analytics?.languages.map(language => (
                <SelectItem key={language} value={language}>{language.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Sentiment Timeline - Now positioned under filters and reactive to them */}
      <SentimentTimeline 
        selectedNeighbourhood={selectedNeighbourhood}
        selectedLanguage={selectedLanguage}
      />

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Total Reviews</p>
              <p className="text-2xl font-bold text-slate-800">{analytics?.totalReviews.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <SentimentMetric filteredData={analytics?.filteredData || []} />

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Neighbourhoods</p>
              <p className="text-2xl font-bold text-slate-800">{analytics?.neighbourhoods.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Anomalies Detected</p>
              <p className="text-2xl font-bold text-slate-800">{analytics?.anomalyCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Review Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.timeSeriesData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reviews" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Language Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  dataKey="value" 
                  data={analytics?.languageData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  fill="#8884d8" 
                  label={({name, percentage}) => `${name}: ${percentage}%`}
                >
                  {analytics?.languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
