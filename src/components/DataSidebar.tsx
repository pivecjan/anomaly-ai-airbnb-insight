
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Upload, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import CompactCSVUpload from "./CompactCSVUpload";

const DataSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { cleanedData, isDataReady, preprocessingReport } = useCSVDataStore();

  const agents = [
    {
      name: "Data Engineer",
      status: isDataReady ? "complete" : "idle",
      message: isDataReady ? `Processed ${cleanedData.length.toLocaleString()} rows` : "Ready to process CSV",
      progress: isDataReady ? 100 : 0
    },
    {
      name: "Data Scientist",
      status: isDataReady ? "complete" : "idle",
      message: isDataReady ? "Anomaly analysis complete" : "Waiting for data",
      progress: isDataReady ? 100 : 0
    },
    {
      name: "Analytical Agent",
      status: isDataReady ? "complete" : "idle",
      message: isDataReady ? "Sentiment analysis complete" : "Waiting for data",
      progress: isDataReady ? 100 : 0
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={`bg-white border-r transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-80'} flex flex-col`}>
      <div className="p-2 border-b flex justify-between items-center">
        {!isCollapsed && (
          <h2 className="font-semibold text-lg">Data Control</h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {/* CSV Upload Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="w-4 h-4" />
                CSV Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CompactCSVUpload />
              {preprocessingReport && (
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Rows: {preprocessingReport.cleanedRows.toLocaleString()}</div>
                  <div>Languages: {Object.keys(preprocessingReport.languageDistribution).length}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agent Status Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Agent Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {agents.map((agent, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(agent.status)}
                      <span className="text-xs font-medium">{agent.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {agent.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{agent.message}</p>
                  {agent.progress > 0 && agent.progress < 100 && (
                    <Progress value={agent.progress} className="h-1" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {isCollapsed && (
        <div className="flex-1 p-2 space-y-2">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          {agents.map((agent, index) => (
            <div key={index} className="w-8 h-8 rounded flex items-center justify-center">
              {getStatusIcon(agent.status)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataSidebar;
