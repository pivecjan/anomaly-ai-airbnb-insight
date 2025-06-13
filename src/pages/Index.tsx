
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Database, Code, Palette, Play, AlertTriangle } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Dashboard from "@/components/Dashboard";
import DataPreview from "@/components/DataPreview";
import AnomalyDetection from "@/components/AnomalyDetection";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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
      id: "creative",
      name: "Creative Agent",
      role: "Dashboard Designer",
      description: "Creates beautiful visualizations and user interfaces",
      icon: Palette,
      status: "ready",
      color: "bg-purple-500"
    },
    {
      id: "analytical",
      name: "Analytical Agent",
      role: "Data Analyst",
      description: "Explores data patterns and generates insights",
      icon: BarChart3,
      status: "ready",
      color: "bg-green-500"
    },
    {
      id: "scientist",
      name: "Data Scientist Agent",
      role: "ML Engineer",
      description: "Implements anomaly detection algorithms",
      icon: Code,
      status: "ready",
      color: "bg-orange-500"
    },
    {
      id: "engineer",
      name: "Data Engineer Agent",
      role: "Data Pipeline",
      description: "Downloads and preprocesses Airbnb datasets",
      icon: Database,
      status: "ready",
      color: "bg-teal-500"
    }
  ];

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate agent workflow
    const steps = [
      { agent: "engineer", message: "Downloading Airbnb dataset...", progress: 20 },
      { agent: "engineer", message: "Preprocessing review data...", progress: 35 },
      { agent: "analytical", message: "Exploring data patterns...", progress: 50 },
      { agent: "scientist", message: "Training anomaly detection model...", progress: 70 },
      { agent: "creative", message: "Generating visualizations...", progress: 85 },
      { agent: "lead", message: "Analysis complete!", progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
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
            Multi-agent AI system for analyzing text anomalies in Airbnb reviews using collaborative intelligence
          </p>
          <Badge variant="outline" className="text-sm">
            <AlertTriangle className="w-4 h-4 mr-1" />
            5 AI Agents Active
          </Badge>
        </div>

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
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} isActive={isAnalyzing} />
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data Preview</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Agent Workflow</h3>
                    <ol className="space-y-2 text-sm text-slate-600">
                      <li>1. Data Engineer downloads Airbnb datasets</li>
                      <li>2. Data preprocessing and cleaning</li>
                      <li>3. Analytical Agent explores patterns</li>
                      <li>4. Data Scientist trains ML models</li>
                      <li>5. Creative Agent builds visualizations</li>
                      <li>6. Lead Agent coordinates and summarizes</li>
                    </ol>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Anomaly Detection Features</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Sentiment analysis irregularities</li>
                      <li>• Unusual review patterns</li>
                      <li>• Fake review detection</li>
                      <li>• Geographic anomalies</li>
                      <li>• Temporal pattern analysis</li>
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
            <AnomalyDetection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
