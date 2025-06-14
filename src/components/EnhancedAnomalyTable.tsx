import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertTriangle, Eye, ArrowUpDown } from "lucide-react";
import { useCSVDataStore } from "@/store/csvDataStore";
import { SentimentAnalyzer } from "@/utils/sentimentAnalysis";

interface EnhancedAnomaly {
  review_id: string;
  sentiment_score: number;
  anomaly_score: number;
  raw_text: string;
  neighbourhood: string;
  created_at: string;
  anomaly_type: string;
  reason: string;
}

const EnhancedAnomalyTable = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();
  const [sortField, setSortField] = useState<'anomaly_score' | 'sentiment_score'>('anomaly_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [neighbourhoodFilter, setNeighbourhoodFilter] = useState('all');

  const anomalies = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return [];
    }

    const detectedAnomalies = SentimentAnalyzer.detectAnomalies(cleanedData);
    
    return detectedAnomalies.map(anomaly => {
      const originalRow = cleanedData.find(row => row.review_id === anomaly.review_id);
      if (!originalRow) return null;

      const sentiment = SentimentAnalyzer.analyzeSentiment(originalRow.raw_text);
      
      // Calculate enhanced anomaly score: (sentiment_deviation * 0.7) + (language_risk * 0.3)
      const avgSentiment = 0.6; // Average baseline sentiment
      const sentimentDeviation = Math.abs(sentiment.score - avgSentiment);
      const languageRisk = originalRow.language !== 'en' ? 0.8 : 0.2;
      const anomaly_score = Math.min(1.0, (sentimentDeviation * 0.7) + (languageRisk * 0.3));

      return {
        review_id: anomaly.review_id,
        sentiment_score: Number(((sentiment.score + 1) / 2).toFixed(3)), // Normalize to 0-1
        anomaly_score: Number(anomaly_score.toFixed(3)),
        raw_text: originalRow.raw_text,
        neighbourhood: anomaly.neighbourhood,
        created_at: anomaly.created_at,
        anomaly_type: anomaly.type,
        reason: anomaly.reason
      } as EnhancedAnomaly;
    }).filter(Boolean) as EnhancedAnomaly[];
  }, [cleanedData, isDataReady]);

  const filteredAndSortedAnomalies = useMemo(() => {
    let filtered = anomalies;

    // Apply sentiment filter
    if (sentimentFilter !== 'all') {
      const [min, max] = sentimentFilter.split('-').map(Number);
      filtered = filtered.filter(a => a.sentiment_score >= min && a.sentiment_score <= max);
    }

    // Apply neighbourhood filter
    if (neighbourhoodFilter !== 'all') {
      filtered = filtered.filter(a => a.neighbourhood === neighbourhoodFilter);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      return sortDirection === 'desc' ? bVal - aVal : aVal - bVal;
    });
  }, [anomalies, sentimentFilter, neighbourhoodFilter, sortField, sortDirection]);

  const neighbourhoods = useMemo(() => {
    return [...new Set(anomalies.map(a => a.neighbourhood).filter(n => n && n.trim() !== ''))];
  }, [anomalies]);

  const handleSort = (field: 'anomaly_score' | 'sentiment_score') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'text-green-600';
    if (score > 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAnomalyColor = (score: number) => {
    if (score > 0.7) return 'bg-red-100 text-red-800';
    if (score > 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (!isDataReady || anomalies.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Anomalies Detected</h3>
          <p className="text-gray-600">Upload CSV data to detect anomalies</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Anomaly Records ({filteredAndSortedAnomalies.length})
        </CardTitle>
        
        {/* Filters */}
        <div className="flex gap-4 mt-4">
          <Select onValueChange={setSentimentFilter} defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="0-0.3">Negative (0-0.3)</SelectItem>
              <SelectItem value="0.3-0.7">Neutral (0.3-0.7)</SelectItem>
              <SelectItem value="0.7-1">Positive (0.7-1)</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={setNeighbourhoodFilter} defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Neighbourhood" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Neighbourhoods</SelectItem>
              {neighbourhoods.map(neighbourhood => (
                <SelectItem key={neighbourhood} value={neighbourhood}>
                  {neighbourhood}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('sentiment_score')}
                  className="h-auto p-0 font-medium"
                >
                  Sentiment Score
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('anomaly_score')}
                  className="h-auto p-0 font-medium"
                >
                  Anomaly Score
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Raw Text Excerpt</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedAnomalies.map((anomaly) => (
              <TableRow key={anomaly.review_id}>
                <TableCell className="font-mono text-sm">
                  {anomaly.review_id}
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${getSentimentColor(anomaly.sentiment_score)}`}>
                    {anomaly.sentiment_score}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={getAnomalyColor(anomaly.anomaly_score)}>
                    {anomaly.anomaly_score}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs">
                  {truncateText(anomaly.raw_text)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{anomaly.anomaly_type}</Badge>
                </TableCell>
                <TableCell>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Full
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Review Details</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Review ID</label>
                          <p className="font-mono">{anomaly.review_id}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Neighbourhood</label>
                          <p>{anomaly.neighbourhood}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Date</label>
                          <p>{new Date(anomaly.created_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Anomaly Type</label>
                          <p>{anomaly.anomaly_type} - {anomaly.reason}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Scores</label>
                          <p>Sentiment: {anomaly.sentiment_score} | Anomaly: {anomaly.anomaly_score}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Review Text</label>
                          <div className="mt-2 p-3 bg-gray-50 rounded border text-sm">
                            {anomaly.raw_text}
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EnhancedAnomalyTable;
