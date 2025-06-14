
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Upload, LucideIcon } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import CompactCSVUpload from "./CompactCSVUpload";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  status: string;
  color: string;
}

interface DataSidebarProps {
  agents?: Agent[];
  isAnalyzing?: boolean;
}

const DataSidebar = ({ agents = [], isAnalyzing = false }: DataSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { cleanedData, isDataReady, preprocessingReport } = useCSVDataStore();

  return (
    <div className={`bg-white border-r transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-96'} flex flex-col`}>
      <div className="p-3 border-b flex justify-between items-center">
        {!isCollapsed && (
          <h2 className="font-semibold text-lg">AI Agents & Data</h2>
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

          {/* Agent Cards Section */}
          {agents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 px-2">AI Agents</h3>
              {agents.map((agent) => {
                const IconComponent = agent.icon;
                return (
                  <Card key={agent.id} className={`bg-white/90 backdrop-blur-sm border shadow-sm transition-all duration-300 hover:shadow-md ${
                    isAnalyzing ? 'ring-1 ring-blue-300' : ''
                  }`}>
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg ${agent.color} flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-medium text-slate-800 truncate">{agent.name}</h4>
                            <Badge variant={agent.status === 'ready' ? 'default' : 'secondary'} className="text-xs ml-2">
                              {isAnalyzing ? 'Active' : agent.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 font-medium mb-1">{agent.role}</p>
                          <p className="text-xs text-slate-500 leading-tight">{agent.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className="flex-1 p-2 space-y-2">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-blue-600" />
          </div>
          {agents.map((agent) => {
            const IconComponent = agent.icon;
            return (
              <div key={agent.id} className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center ${
                isAnalyzing ? 'ring-1 ring-blue-300' : ''
              }`}>
                <IconComponent className="w-4 h-4 text-white" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DataSidebar;
