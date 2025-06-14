
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin, Calendar, Filter, Languages } from "lucide-react";

interface DashboardProps {
  csvData?: any[];
}

const Dashboard = ({ csvData }: DashboardProps) => {
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [dateRange, setDateRange] = useState<number[]>([0, 100]);

  // Mock data for visualizations (would be replaced with actual CSV analysis)
  const reviewSentimentData = [
    { month: 'Jan', positive: 420, negative: 80, neutral: 150, anomalies: 12 },
    { month: 'Feb', positive: 380, negative: 120, neutral: 180, anomalies: 8 },
    { month: 'Mar', positive: 450, negative: 90, neutral: 140, anomalies: 15 },
    { month: 'Apr', positive: 390, negative: 140, neutral: 160, anomalies: 22 },
    { month: 'May', positive: 480, negative: 70, neutral: 120, anomalies: 18 },
    { month: 'Jun', positive: 520, negative: 60, neutral: 100, anomalies: 9 },
  ];

  const neighbourhoodData = [
    { name: 'Manhattan', reviews: 1250, anomalies: 85, avgSentiment: 4.2 },
    { name: 'Brooklyn', reviews: 980, anomalies: 45, avgSentiment: 4.4 },
    { name: 'Queens', reviews: 750, anomalies: 32, avgSentiment: 4.1 },
    { name: 'Bronx', reviews: 420, anomalies: 18, avgSentiment: 3.9 },
    { name: 'Staten Island', reviews: 290, anomalies: 12, avgSentiment: 4.3 },
  ];

  const languageAnomalies = [
    { language: 'English', total: 3200, anomalies: 195, rate: 6.1 },
    { language: 'Spanish', total: 480, anomalies: 39, rate: 8.1 },
    { language: 'French', total: 160, anomalies: 12, rate: 7.5 },
    { language: 'German', total: 120, anomalies: 8, rate: 6.7 },
    { language: 'Other', total: 140, anomalies: 11, rate: 7.9 },
  ];

  const neighbourhoods = ["all", ...neighbourhoodData.map(n => n.name)];
  const languages = ["all", "English", "Spanish", "French", "German", "Other"];

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Neighbourhood</label>
              <Select value={selectedNeighbourhood} onValueChange={setSelectedNeighbourhood}>
                <SelectTrigger>
                  <SelectValue placeholder="Select neighbourhood" />
                </SelectTrigger>
                <SelectContent>
                  {neighbourhoods.map(n => (
                    <SelectItem key={n} value={n}>
                      {n === "all" ? "All Neighbourhoods" : n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(l => (
                    <SelectItem key={l} value={l}>
                      {l === "all" ? "All Languages" : l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range (%)</label>
              <Slider
                value={dateRange}
                onValueChange={setDateRange}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>{dateRange[0]}%</span>
                <span>{dateRange[1]}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Reviews</p>
                <p className="text-2xl font-bold text-slate-800">{csvData?.length.toLocaleString() || '15,642'}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-slate-600 ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-slate-800">284</p>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">-8.3%</span>
              <span className="text-slate-600 ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Avg Sentiment</p>
                <p className="text-2xl font-bold text-slate-800">4.2/5</p>
              </div>
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+0.3</span>
              <span className="text-slate-600 ml-1">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Languages</p>
                <p className="text-2xl font-bold text-slate-800">12</p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <Languages className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Languages className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-slate-600">Multi-language analysis</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Temporal Sentiment & Anomaly Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reviewSentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar dataKey="positive" fill="#10b981" name="Positive" />
                <Bar dataKey="neutral" fill="#f59e0b" name="Neutral" />
                <Bar dataKey="negative" fill="#ef4444" name="Negative" />
                <Bar dataKey="anomalies" fill="#8b5cf6" name="Anomalies" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Language Anomaly Rates</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={languageAnomalies} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" />
                <YAxis dataKey="language" type="category" stroke="#64748b" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar dataKey="rate" fill="#ef4444" name="Anomaly Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Neighbourhood Analysis */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Neighbourhood Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {neighbourhoodData.map((neighbourhood, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-lg">{neighbourhood.name}</div>
                  <Badge variant="outline">{neighbourhood.reviews} reviews</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-red-600">{neighbourhood.anomalies}</div>
                    <div className="text-slate-600">Anomalies</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{neighbourhood.avgSentiment}</div>
                    <div className="text-slate-600">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-purple-600">
                      {((neighbourhood.anomalies / neighbourhood.reviews) * 100).toFixed(1)}%
                    </div>
                    <div className="text-slate-600">Anomaly Rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
