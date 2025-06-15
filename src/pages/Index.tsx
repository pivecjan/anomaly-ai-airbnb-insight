import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, BarChart3, Database, Code, Palette, Play, AlertTriangle, FileText } from "lucide-react";
import AgentCard from "@/components/AgentCard";
import Dashboard from "@/components/Dashboard";
import { DataPreview } from "@/components/DataPreview";
import EnhancedAnomalyDetection from "@/components/EnhancedAnomalyDetection";
import StorytellerInsights from "@/components/StorytellerInsights";
import DataSidebar from "@/components/DataSidebar";
import EnhancedAnomalyTable from "@/components/EnhancedAnomalyTable";
import { useToast } from "@/hooks/use-toast";
import { useCSVDataStore } from "@/store/csvDataStore";
import AnomalyInsights from "@/components/AnomalyInsights";
import CompactCSVUpload from "@/components/CompactCSVUpload";
import { LLMSentimentAnalyzer } from "@/utils/llmSentimentAnalysis";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const { toast } = useToast();
  
  const { 
    cleanedData, 
    isDataReady, 
    isAnalysisStarted, 
    isAnalyzing, 
    startAnalysis: triggerAnalysis,
    setAnalyzing,
    setEnhancedData
  } = useCSVDataStore();

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
    },
    {
      id: "ai-anomaly",
      name: "AI Anomaly Agent",
      role: "ChatGPT Analyst",
      description: "Uses ChatGPT gpt-4o-mini for language detection, sentiment scoring, and neighborhood-specific anomaly detection",
      icon: Brain,
      status: "ready",
      color: "bg-pink-500"
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

    // Trigger analysis state in store
    triggerAnalysis();
    setAnalysisProgress(0);
    
    try {
      // Step 1-7: Initial analysis steps
      const initialSteps = [
        { agent: "engineer", message: "Validating CSV structure and parsing dates...", progress: 15 },
        { agent: "engineer", message: "Cleaning data and removing duplicates...", progress: 25 },
        { agent: "engineer", message: "Standardizing text encoding and language detection...", progress: 35 },
        { agent: "analytical", message: "Analyzing review volume trends over time...", progress: 45 },
        { agent: "analytical", message: "Computing sentiment distribution by neighbourhood...", progress: 55 },
        { agent: "scientist", message: "Detecting fake reviews and complaint patterns...", progress: 70 },
        { agent: "scientist", message: "Identifying anomalous review bursts...", progress: 80 }
      ];

      // Run initial steps
      for (const step of initialSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnalysisProgress(step.progress);
        toast({
          title: `${step.agent.charAt(0).toUpperCase() + step.agent.slice(1)} Agent`,
          description: step.message,
        });
      }

      // Step 8: ChatGPT Enhancement (actual processing)
      setAnalysisProgress(85);
      toast({
        title: "AI Anomaly Agent",
        description: "Starting ChatGPT sentiment analysis enhancement...",
      });

      // Actually run the ChatGPT enhancement
      const enhanced = await LLMSentimentAnalyzer.enhanceDataWithLLM(cleanedData);
      setEnhancedData(enhanced);

      setAnalysisProgress(90);
      toast({
        title: "AI Anomaly Agent",
        description: "ChatGPT enhancement completed successfully!",
      });

      // Final steps
      const finalSteps = [
        { agent: "storyteller", message: "Generating human-readable insights...", progress: 95 },
        { agent: "creative", message: "Building interactive dashboard...", progress: 98 },
        { agent: "lead", message: "Analysis complete! Ready to explore insights.", progress: 100 }
      ];

      for (const step of finalSteps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setAnalysisProgress(step.progress);
        toast({
          title: `${step.agent.charAt(0).toUpperCase() + step.agent.slice(1)} Agent`,
          description: step.message,
        });
      }

      setAnalyzing(false);
      setActiveTab("dashboard");

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "ChatGPT enhancement failed. Analysis will continue with basic sentiment analysis.",
        variant: "destructive"
      });
      
      // Complete analysis even if ChatGPT fails
      setAnalysisProgress(100);
      setAnalyzing(false);
      setActiveTab("dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex">
      {/* Left Sidebar with Agents */}
      <DataSidebar agents={agents} isAnalyzing={isAnalyzing} />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-slate-800 mb-2">
              Airbnb Review Anomaly Detection
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Multi-agent AI system with ChatGPT-powered anomaly detection, language recognition, and neighborhood-specific sentiment analysis
            </p>
            <Badge variant="outline" className="text-sm">
              <AlertTriangle className="w-4 h-4 mr-1" />
              7 AI Agents Active (including ChatGPT)
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

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data Preview</TabsTrigger>
              <TabsTrigger value="dashboard" disabled={!isAnalysisStarted}>Dashboard</TabsTrigger>
              <TabsTrigger value="anomalies" disabled={!isAnalysisStarted}>Anomalies</TabsTrigger>
              <TabsTrigger value="insights" disabled={!isAnalysisStarted}>Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Enhanced System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} isActive={isAnalyzing} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>System Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Advanced Analytics</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Real-time sentiment analysis with ChatGPT integration</li>
                      <li>• Multi-language review processing and translation</li>
                      <li>• Neighborhood-specific anomaly baselines</li>
                      <li>• Temporal pattern recognition</li>
                      <li>• Statistical outlier detection</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Detection Features</h3>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li>• Fake review identification</li>
                      <li>• Complaint pattern analysis</li>
                      <li>• Review clustering detection</li>
                      <li>• Language anomaly flagging</li>
                      <li>• Sentiment manipulation alerts</li>
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
              {isAnalysisStarted ? (
                <Dashboard />
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold mb-2">Analysis Not Started</h3>
                    <p className="text-slate-600">Click "Start Analysis" to generate the dashboard</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="anomalies">
              {isAnalysisStarted ? (
                <div className="space-y-6">
                  <EnhancedAnomalyTable />
                  <AnomalyInsights />
                </div>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold mb-2">Analysis Not Started</h3>
                    <p className="text-slate-600">Click "Start Analysis" to detect anomalies</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights">
              {isAnalysisStarted ? (
                <StorytellerInsights />
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-semibold mb-2">Analysis Not Started</h3>
                    <p className="text-slate-600">Click "Start Analysis" to generate insights</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
