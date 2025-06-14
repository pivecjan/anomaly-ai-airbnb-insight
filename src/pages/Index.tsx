import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Database, Code, Palette, Play, AlertTriangle, FileText } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Dashboard from "@/components/Dashboard";
import DataPreview from "@/components/DataPreview";
import EnhancedAnomalyDetection from "@/components/EnhancedAnomalyDetection";
import CompactCSVUpload from "@/components/CompactCSVUpload";
import StorytellerInsights from "@/components/StorytellerInsights";
import { useToast } from "@/hooks/use-toast";
import { useCSVDataStore } from "@/store/csvDataStore";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  
  const { cleanedData, isDataReady } = useCSVDataStore();

  const agents = [
    {
      id: "lead",
      name: "Lead Agent",
      role: "Orchestrator",
      description: "Coordinates all agents and manages the analysis workflow",
      icon: Brain,
      status: "ready",
      color: "bg-blue-500"
    },
    {
      id: "storyteller",
      name: "Storyteller Agent",
      role: "Insight Generator",
      description: "Creates human-readable insights and narratives from analysis results",
      icon: FileText,
      status: "ready",
      color: "bg-indigo-500"
    },
    {
      id: "creative",
      name: "Creative Agent",
      role: "Dashboard Designer",
      description: "Creates beautiful visualizations with time filters and neighbourhood selectors",
      icon: Palette,
      status: "ready",
      color: "bg-purple-500"
    },
    {
      id: "analytical",
      name: "Analytical Agent",
      role: "Data Analyst",
      description: "Analyzes review trends, sentiment by neighbourhood, and language distribution",
      icon: BarChart3,
      status: "ready",
      color: "bg-green-500"
    },
    {
      id: "scientist",
      name: "Data Scientist Agent",
      role: "ML Engineer",
      description: "Detects fake reviews, complaint analysis, and anomalous review bursts",
      icon: Code,
      status: "ready",
      color: "bg-orange-500"
    },
    {
      id: "engineer",
      name: "Data Engineer Agent",
      role: "Data Pipeline",
      description: "Validates CSV structure, parses dates, and handles language detection",
      icon: Database,
      status: "ready",
      color: "bg-teal-500"
    }
  ];

  const startAnalysis = async () => {
    if (!isDataReady) {
      toast({
        title: "No Data Found",
        description: "Please upload a CSV file first to begin analysis.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const steps = [
      { agent: "engineer", message: "Validating CSV structure and parsing dates...", progress: 15 },
      { agent: "engineer", message: "Cleaning data and removing duplicates...", progress: 25 },
      { agent: "engineer", message: "Standardizing text encoding and language detection...", progress: 35 },
      { agent: "analytical", message: "Analyzing review volume trends over time...", progress: 45 },
      { agent: "analytical", message: "Computing sentiment distribution by neighbourhood...", progress: 55 },
      { agent: "scientist", message: "Detecting fake reviews and complaint patterns...", progress: 70 },
      { agent: "scientist", message: "Identifying anomalous review bursts...", progress: 80 },
      { agent: "storyteller", message: "Generating human-readable insights...", progress: 90 },
      { agent: "creative", message: "Building interactive dashboard...", progress: 95 },
      { agent: "lead", message: "Analysis complete! Ready to explore insights.", progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setAnalysisProgress(step.progress);
      toast({
        title: `${step.agent.charAt(0).toUpperCase() + step.agent.slice(1)} Agent`,
        description: step.message,
      });
    }

    setIsAnalyzing(false);
    setActiveTab("dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Airbnb Review Anomaly Detection
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Multi-agent AI system with advanced CSV preprocessing for analyzing review datasets
          </p>
          <Badge variant="outline" className="text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            6 AI Agents Active
          </Badge>
        </div>

        {/* Compact CSV Upload Section */}
        <CompactCSVUpload />

        {/* Analysis Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Analysis Control Center
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={startAnalysis} 
                disabled={isAnalyzing || !isDataReady}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
              {isDataReady && (
                <div className="text-sm text-slate-600">
                  Ready to analyze {cleanedData.length.toLocaleString()} cleaned reviews
                </div>
              )}
              {isAnalyzing && (
                <div className="flex-1 max-w-md">
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-sm text-slate-600 mt-1">{analysisProgress}% Complete</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} isActive={isAnalyzing} />
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Enhanced System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Data Engineering Workflow</h3>
                    <ol className="space-y-2 text-sm text-slate-600">
                      <li>1. Structural validation (6 columns, correct headers)</li>
                      <li>2. Data cleaning (remove missing/duplicate entries)</li>
                      <li>3. DateTime standardization (YYYY-MM-DD HH:MM:SS)</li>
                      <li>4. Text normalization (encoding fixes, whitespace)</li>
                      <li>5. Language detection and translation flagging</li>
                      <li>6. Generate preprocessing report</li>
                      <li>7. Output cleaned_reviews.csv</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Validation Features</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Strict CSV structure validation</li>
                      <li>• Automatic duplicate removal</li>
                      <li>• Date format validation and parsing</li>
                      <li>• Text encoding normalization</li>
                      <li>• Language distribution analysis</li>
                      <li>• Downloadable cleaned datasets</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <DataPreview />
          </TabsContent>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="anomalies">
            <EnhancedAnomalyDetection />
          </TabsContent>

          <TabsContent value="insights">
            <StorytellerInsights />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
