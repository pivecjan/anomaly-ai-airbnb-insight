import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Database, FileText, BarChart3, Calendar, MapPin, Languages, MessageSquare } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";

const DataPreview = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();

  // Calculate statistics from actual CSV data
  const calculateStats = () => {
    if (!isDataReady || cleanedData.length === 0) {
      return {
        totalRecords: 0,
        uniqueListings: 0,
        uniqueNeighbourhoods: 0,
        languages: 0,
        languageDistribution: {}
      };
    }

    const totalRecords = cleanedData.length;
    const uniqueListings = new Set(cleanedData.map(item => item.listing_id)).size;
    const uniqueNeighbourhoods = new Set(cleanedData.map(item => item.neighbourhood)).size;
    const languageDistribution = cleanedData.reduce((acc, item) => {
      acc[item.language] = (acc[item.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRecords,
      uniqueListings,
      uniqueNeighbourhoods,
      languages: Object.keys(languageDistribution).length,
      languageDistribution
    };
  };

  const stats = calculateStats();
  const previewData = cleanedData.slice(0, 10);

  const dataStats = [
    { label: "Total Reviews", value: stats.totalRecords.toLocaleString(), icon: MessageSquare },
    { label: "Unique Listings", value: stats.uniqueListings.toString(), icon: Database },
    { label: "Neighbourhoods", value: stats.uniqueNeighbourhoods.toString(), icon: MapPin },
    { label: "Languages", value: stats.languages.toString(), icon: Languages }
  ];

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">Upload a CSV file to preview the data</p>
        </CardContent>
      </Card>
    );
  }

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

      {/* Language Distribution */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Language Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.languageDistribution).map(([lang, count]) => (
              <div key={lang} className="text-center p-3 bg-slate-50 rounded-lg">
                <div className="text-2xl font-bold text-slate-800">{count as number}</div>
                <div className="text-sm text-slate-600">{lang.toUpperCase()}</div>
                <div className="text-xs text-slate-500">
                  {(((count as number) / stats.totalRecords) * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dataset Information */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>CSV Dataset Structure</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Required CSV Fields</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• <strong>review_id:</strong> Unique identifier for each review</li>
                <li>• <strong>listing_id:</strong> Property identifier for grouping</li>
                <li>• <strong>neighbourhood:</strong> Geographic location data</li>
                <li>• <strong>created_at:</strong> Timestamp for temporal analysis</li>
                <li>• <strong>language:</strong> Language code (en, es, fr, etc.)</li>
                <li>• <strong>raw_text:</strong> Review content for text analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Analysis Capabilities</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>• Time-series anomaly detection</li>
                <li>• Geographic clustering analysis</li>
                <li>• Multi-language sentiment processing</li>
                <li>• Fake review pattern recognition</li>
                <li>• Neighbourhood sentiment mapping</li>
                <li>• Review burst identification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Data Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Review ID</TableHead>
                  <TableHead>Listing ID</TableHead>
                  <TableHead>Neighbourhood</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Review Text</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, index) => (
                  <TableRow key={row.review_id || index}>
                    <TableCell className="font-medium">{row.review_id}</TableCell>
                    <TableCell>{row.listing_id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.neighbourhood}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {row.created_at.split(' ')[0]}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.language === 'en' ? 'default' : 'secondary'}>
                        {row.language.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={row.raw_text}>
                        {row.raw_text}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {cleanedData.length > 10 && (
            <div className="mt-4 text-center text-sm text-slate-600">
              Showing first 10 of {cleanedData.length.toLocaleString()} total reviews
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPreview;
