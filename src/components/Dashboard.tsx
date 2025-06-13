
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin, Calendar } from "lucide-react";

const Dashboard = () => {
  // Mock data for visualizations
  const reviewSentimentData = [
    { month: 'Jan', positive: 420, negative: 80, neutral: 150 },
    { month: 'Feb', positive: 380, negative: 120, neutral: 180 },
    { month: 'Mar', positive: 450, negative: 90, neutral: 140 },
    { month: 'Apr', positive: 390, negative: 140, neutral: 160 },
    { month: 'May', positive: 480, negative: 70, neutral: 120 },
    { month: 'Jun', positive: 520, negative: 60, neutral: 100 },
  ];

  const anomalyTrends = [
    { week: 'W1', anomalies: 12, reviews: 1200 },
    { week: 'W2', anomalies: 8, reviews: 1100 },
    { week: 'W3', anomalies: 15, reviews: 1350 },
    { week: 'W4', anomalies: 22, reviews: 1400 },
    { week: 'W5', anomalies: 18, reviews: 1250 },
    { week: 'W6', anomalies: 9, reviews: 1150 },
  ];

  const cityDistribution = [
    { name: 'New York', value: 1250, color: '#0088FE' },
    { name: 'Los Angeles', value: 980, color: '#00C49F' },
    { name: 'Chicago', value: 750, color: '#FFBB28' },
    { name: 'Miami', value: 620, color: '#FF8042' },
    { name: 'San Francisco', value: 890, color: '#8884d8' },
  ];

  const anomalyTypes = [
    { type: 'Fake Reviews', count: 45, severity: 'high' },
    { type: 'Sentiment Manipulation', count: 32, severity: 'medium' },
    { type: 'Geographic Inconsistency', count: 18, severity: 'low' },
    { type: 'Temporal Anomalies', count: 27, severity: 'medium' },
    { type: 'Language Patterns', count: 15, severity: 'low' },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Reviews</p>
                <p className="text-2xl font-bold text-slate-800">15,642</p>
              </div>
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-500">+12.5%</span>
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Anomalies Detected</p>
                <p className="text-2xl font-bold text-slate-800">137</p>
              </div>
              <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-500">-8.3%</span>
              <span className="text-slate-600 ml-1">from last month</span>
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
              <span className="text-slate-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Cities Analyzed</p>
                <p className="text-2xl font-bold text-slate-800">52</p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-slate-600">Updated today</span>
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
              Review Sentiment Analysis
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
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Anomaly Detection Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={anomalyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="week" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Line type="monotone" dataKey="anomalies" stroke="#ef4444" strokeWidth={3} name="Anomalies" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>City Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={cityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {cityDistribution.map((city, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: city.color }}></div>
                    <span>{city.name}</span>
                  </div>
                  <span className="font-medium">{city.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle>Anomaly Types Detected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {anomalyTypes.map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(anomaly.severity)}`}></div>
                    <span className="font-medium">{anomaly.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{anomaly.count} detected</Badge>
                    <Badge variant={anomaly.severity === 'high' ? 'destructive' : anomaly.severity === 'medium' ? 'default' : 'secondary'}>
                      {anomaly.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
