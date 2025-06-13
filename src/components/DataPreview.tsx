
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Database, FileText, BarChart3 } from "lucide-react";

const DataPreview = () => {
  const sampleData = [
    {
      id: "1",
      listing_id: "2539",
      date: "2023-05-14",
      reviewer_name: "John",
      comment: "Amazing place! Clean, comfortable, and great location. Host was very responsive.",
      sentiment_score: 0.92,
      anomaly_flag: false
    },
    {
      id: "2",
      listing_id: "2539",
      date: "2023-05-12",
      reviewer_name: "Sarah",
      comment: "Perfect stay! Everything was exactly as described. Highly recommend!",
      sentiment_score: 0.95,
      anomaly_flag: false
    },
    {
      id: "3",
      listing_id: "3831",
      date: "2023-05-10",
      reviewer_name: "Mike",
      comment: "Good location but the apartment was dirty and not as shown in photos.",
      sentiment_score: -0.45,
      anomaly_flag: false
    },
    {
      id: "4",
      listing_id: "5648",
      date: "2023-05-09",
      reviewer_name: "bot_user_123",
      comment: "This is the best place ever! Amazing! Perfect! Incredible! Best host ever!",
      sentiment_score: 0.98,
      anomaly_flag: true
    },
    {
      id: "5",
      listing_id: "7291",
      date: "2023-05-08",
      reviewer_name: "Emma",
      comment: "Nice apartment with good amenities. The host was helpful.",
      sentiment_score: 0.75,
      anomaly_flag: false
    }
  ];

  const dataStats = [
    { label: "Total Records", value: "15,642", icon: Database },
    { label: "Text Reviews", value: "14,892", icon: FileText },
    { label: "Anomalies Found", value: "137", icon: BarChart3 },
    { label: "Data Sources", value: "5 Cities", icon: Download }
  ];

  return (
    <div className="space-y-6">
      {/* Data Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dataStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Source Information */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Airbnb Dataset Information</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Data Sources</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Inside Airbnb - New York City (latest)</li>
                <li>• Inside Airbnb - Los Angeles (latest)</li>
                <li>• Inside Airbnb - Chicago (latest)</li>
                <li>• Inside Airbnb - Miami (latest)</li>
                <li>• Inside Airbnb - San Francisco (latest)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Data Fields</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Listing ID, Date, Reviewer Name</li>
                <li>• Review Comments (text)</li>
                <li>• Sentiment Scores (calculated)</li>
                <li>• Anomaly Flags (ML detected)</li>
                <li>• Geographic Information</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Sample Review Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleData.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.listing_id}</TableCell>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.reviewer_name}</TableCell>
                    <TableCell className="max-w-xs truncate">{row.comment}</TableCell>
                    <TableCell>
                      <Badge variant={row.sentiment_score > 0.5 ? 'default' : row.sentiment_score > 0 ? 'secondary' : 'destructive'}>
                        {row.sentiment_score.toFixed(2)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {row.anomaly_flag ? (
                        <Badge variant="destructive">Anomaly</Badge>
                      ) : (
                        <Badge variant="outline">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;
