import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MapPin, Calendar, AlertTriangle } from "lucide-react";

interface DashboardProps {
  csvData?: any[];
}

const Dashboard = ({ csvData }: DashboardProps) => {
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("all");
  const [dateRange, setDateRange] = useState([0, 100]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const sampleData = csvData?.slice(0, 50) || [
    { review_id: "1", listing_id: "2539", neighbourhood: "Manhattan", created_at: "2023-05-14", language: "en", raw_text: "Amazing place!" },
    { review_id: "2", listing_id: "2539", neighbourhood: "Manhattan", created_at: "2023-05-12", language: "en", raw_text: "Perfect stay!" },
    { review_id: "3", listing_id: "3831", neighbourhood: "Brooklyn", created_at: "2023-05-10", language: "en", raw_text: "Good location" },
    { review_id: "4", listing_id: "5648", neighbourhood: "Queens", created_at: "2023-05-09", language: "en", raw_text: "This is the best place ever!" },
    { review_id: "5", listing_id: "7291", neighbourhood: "Brooklyn", created_at: "2023-05-08", language: "es", raw_text: "Apartamento agradable" }
  ];

  const colours = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const chartData = [
    { name: 'May 1', uv: 400, pv: 240, amt: 240 },
    { name: 'May 2', uv: 300, pv: 139, amt: 221 },
    { name: 'May 3', uv: 200, pv: 980, amt: 229 },
    { name: 'May 4', uv: 278, pv: 390, amt: 200 },
    { name: 'May 5', uv: 189, pv: 480, amt: 218 },
    { name: 'May 6', uv: 239, pv: 380, amt: 250 },
    { name: 'May 7', uv: 349, pv: 430, amt: 210 },
  ];

  const pieData = [
    { name: 'Group A', value: 400 },
    { name: 'Group B', value: 300 },
    { name: 'Group C', value: 300 },
    { name: 'Group D', value: 200 },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Data Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select onValueChange={setSelectedNeighbourhood}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Neighbourhood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Neighbourhoods</SelectItem>
              {[...new Set(sampleData.map(item => item.neighbourhood))].map(neighbourhood => (
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
              {[...new Set(sampleData.map(item => item.language))].map(language => (
                <SelectItem key={language} value={language}>{language}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <p className="text-sm text-slate-600 mb-2">Date Range</p>
            <Slider
              defaultValue={dateRange}
              max={100}
              step={1}
              onValueChange={setDateRange}
            />
            <div className="text-xs text-slate-500 mt-1">
              Range: {dateRange[0]}% - {dateRange[1]}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Total Reviews</p>
              <p className="text-2xl font-bold text-slate-800">{sampleData.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Avg. Sentiment</p>
              <p className="text-2xl font-bold text-slate-800">4.2 / 5</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-600">Anomalies Detected</p>
              <p className="text-2xl font-bold text-slate-800">7</p>
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
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pv" stroke="#8884d8" />
                <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="value" data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                  {
                    pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colours[index % colours.length]} />
                    ))
                  }
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
