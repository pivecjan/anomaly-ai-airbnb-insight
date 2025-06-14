
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Eye, Filter, FileText } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";

interface DetectedAnomaly {
  id: number;
  review_id: string;
  listing_id: string;
  neighbourhood: string;
  raw_text: string;
  anomaly_score: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

const EnhancedAnomalyDetection = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();
  const [selectedNeighbourhood, setSelectedNeighbourhood] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const anomalies = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return [];
    }

    const detectedAnomalies: DetectedAnomaly[] = [];

    // Group by listing_id to detect review clusters
    const listingGroups = cleanedData.reduce((acc, row) => {
      if (!acc[row.listing_id]) {
        acc[row.listing_id] = [];
      }
      acc[row.listing_id].push(row);
      return acc;
    }, {} as Record<string, typeof cleanedData>);

    // Detect review clusters (multiple reviews for same listing)
    Object.entries(listingGroups).forEach(([listingId, reviews]) => {
      if (reviews.length >= 3) {
        reviews.forEach((review, index) => {
          if (index < 3) { // Limit to first 3 reviews to avoid too many anomalies
            const score = Math.min(0.95, 0.6 + (reviews.length * 0.05));
            detectedAnomalies.push({
              id: detectedAnomalies.length + 1,
              review_id: review.review_id,
              listing_id: listingId,
              neighbourhood: review.neighbourhood,
              raw_text: review.raw_text,
              anomaly_score: score,
              reason: `Review cluster (${reviews.length} reviews for same listing)`,
              severity: reviews.length >= 5 ? 'high' : 'medium'
            });
          }
        });
      }
    });

    // Detect repetitive text patterns
    const textGroups = cleanedData.reduce((acc, row) => {
      const firstWords = row.raw_text.split(' ').slice(0, 5).join(' ').toLowerCase();
      if (!acc[firstWords]) {
        acc[firstWords] = [];
      }
      acc[firstWords].push(row);
      return acc;
    }, {} as Record<string, typeof cleanedData>);

    Object.entries(textGroups).forEach(([pattern, reviews]) => {
      if (reviews.length >= 2 && pattern.length > 10) {
        reviews.forEach((review, index) => {
          if (index < 2) { // Limit to avoid duplicates
            detectedAnomalies.push({
              id: detectedAnomalies.length + 1,
              review_id: review.review_id,
              listing_id: review.listing_id,
              neighbourhood: review.neighbourhood,
              raw_text: review.raw_text,
              anomaly_score: 0.75 + (reviews.length * 0.05),
              reason: `Repetitive language pattern`,
              severity: 'medium'
            });
          }
        });
      }
    });

    // Detect very short reviews (potential fake)
    cleanedData.forEach(row => {
      if (row.raw_text.split(' ').length <= 3) {
        detectedAnomalies.push({
          id: detectedAnomalies.length + 1,
          review_id: row.review_id,
          listing_id: row.listing_id,
          neighbourhood: row.neighbourhood,
          raw_text: row.raw_text,
          anomaly_score: 0.65,
          reason: 'Suspiciously short review',
          severity: 'low'
        });
      }
    });

    return detectedAnomalies.slice(0, 20); // Limit to 20 for performance
  }, [cleanedData, isDataReady]);

  const filteredAnomalies = useMemo(() => {
    return anomalies.filter(anomaly => {
      const neighbourhoodMatch = selectedNeighbourhood === "all" || anomaly.neighbourhood === selectedNeighbourhood;
      const severityMatch = selectedSeverity === "all" || anomaly.severity === selectedSeverity;
      return neighbourhoodMatch && severityMatch;
    });
  }, [anomalies, selectedNeighbourhood, selectedSeverity]);

  const neighbourhoods = useMemo(() => {
    return [...new Set(anomalies.map(a => a.neighbourhood))];
  }, [anomalies]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (!isDataReady) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-slate-600">Upload a CSV file to detect anomalies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Anomaly Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Select onValueChange={setSelectedNeighbourhood}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Neighbourhoods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Neighbourhoods</SelectItem>
              {neighbourhoods.map(neighbourhood => (
                <SelectItem key={neighbourhood} value={neighbourhood}>{neighbourhood}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Anomalies Table */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Detected Anomalies ({filteredAnomalies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600">No anomalies match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Review ID</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Original Review</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAnomalies.map((anomaly) => (
                    <TableRow key={anomaly.id}>
                      <TableCell className="font-medium">{anomaly.review_id}</TableCell>
                      <TableCell>
                        <span className="font-mono">{anomaly.anomaly_score.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSeverityColor(anomaly.severity) as any}>
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-sm">{anomaly.reason}</div>
                        <div className="text-xs text-slate-500">
                          {anomaly.neighbourhood} • #{anomaly.listing_id}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-sm" title={anomaly.raw_text}>
                          {truncateText(anomaly.raw_text, 80)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View Full
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Review Details - #{anomaly.review_id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Listing ID:</span>
                                  <span className="ml-2">{anomaly.listing_id}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Neighbourhood:</span>
                                  <span className="ml-2">{anomaly.neighbourhood}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Anomaly Score:</span>
                                  <span className="ml-2 font-mono">{anomaly.anomaly_score.toFixed(3)}</span>
                                </div>
                                <div>
                                  <span className="font-medium">Severity:</span>
                                  <Badge variant={getSeverityColor(anomaly.severity) as any} className="ml-2">
                                    {anomaly.severity.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              <div>
                                <span className="font-medium">Reason:</span>
                                <span className="ml-2">{anomaly.reason}</span>
                              </div>
                              <div>
                                <span className="font-medium">Original Review:</span>
                                <div className="mt-2 p-3 bg-slate-50 rounded border text-sm">
                                  {anomaly.raw_text}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAnomalyDetection;
