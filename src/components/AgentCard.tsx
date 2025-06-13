
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: LucideIcon;
  status: string;
  color: string;
}

interface AgentCardProps {
  agent: Agent;
  isActive: boolean;
}

const AgentCard = ({ agent, isActive }: AgentCardProps) => {
  const IconComponent = agent.icon;

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
      isActive ? 'ring-2 ring-blue-400 animate-pulse' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`w-10 h-10 rounded-lg ${agent.color} flex items-center justify-center`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          <Badge variant={agent.status === 'ready' ? 'default' : 'secondary'} className="text-xs">
            {isActive ? 'Active' : agent.status}
          </Badge>
        </div>
        <CardTitle className="text-lg">{agent.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-2 font-medium">{agent.role}</p>
        <p className="text-xs text-slate-500">{agent.description}</p>
      </CardContent>
    </Card>
  );
};

export default AgentCard;
