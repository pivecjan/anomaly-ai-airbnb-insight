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
  detailedReason: string;
}

const EnhancedAnomalyTable = () => {
  const { cleanedData, isDataReady } = useCSVDataStore();
  const [sortField, setSortField] = useState<'anomaly_score' | 'sentiment_score'>('anomaly_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [neighbourhoodFilter, setNeighbourhoodFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Function to generate detailed reasons for anomaly detection
  const generateDetailedReason = (anomaly: any, originalRow: any, sentiment: any): string => {
    const reasons = [];
    
    // Sentiment-based reasons
    if (sentiment.score < -0.5) {
      reasons.push("Extremely negative sentiment detected, indicating potential serious issues or complaints");
    } else if (sentiment.score > 0.8) {
      reasons.push("Unusually positive sentiment that may indicate fake or incentivized reviews");
    } else if (Math.abs(sentiment.score) < 0.1) {
      reasons.push("Neutral sentiment with low emotional engagement, potentially indicating generic or template content");
    }

    // Language-based reasons
    if (originalRow.language !== 'en') {
      reasons.push(`Non-English content (${originalRow.language.toUpperCase()}) may require translation verification and cultural context analysis`);
    }

    // Text length and quality reasons
    const wordCount = originalRow.raw_text.split(' ').length;
    if (wordCount < 5) {
      reasons.push("Extremely short review with insufficient detail, potentially indicating low-effort or spam content");
    } else if (wordCount > 200) {
      reasons.push("Unusually long review that may contain excessive detail or promotional content");
    }

    // Content pattern reasons
    const text = originalRow.raw_text.toLowerCase();
    if (anomaly.type === 'complaint') {
      const complaintKeywords = ['dirty', 'clean', 'smell', 'noise', 'broken', 'uncomfortable', 'rude', 'terrible'];
      const foundKeywords = complaintKeywords.filter(keyword => text.includes(keyword));
      if (foundKeywords.length > 0) {
        reasons.push(`Contains complaint indicators: ${foundKeywords.join(', ')}. May indicate service quality issues requiring attention`);
      }
    }

    if (anomaly.type === 'suspicious') {
      if (/(.)\1{3,}/.test(text)) {
        reasons.push("Contains repetitive character patterns that may indicate automated or low-quality content generation");
      }
      if (text.includes('perfect') && text.includes('amazing') && text.includes('recommend')) {
        reasons.push("Uses multiple superlative terms commonly found in fake positive reviews");
      }
    }

    // Temporal and contextual reasons
    const reviewDate = new Date(originalRow.created_at);
    const dayOfWeek = reviewDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      reasons.push("Posted on weekend, which may indicate different guest behavior patterns or potential review manipulation timing");
    }

    // Default reason if no specific patterns found
    if (reasons.length === 0) {
      reasons.push(`Flagged as ${anomaly.type} anomaly based on statistical deviation from normal review patterns in this dataset`);
    }

    return reasons.join('. ');
  };

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
        reason: anomaly.reason,
        detailedReason: generateDetailedReason(anomaly, originalRow, sentiment)
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedAnomalies.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const currentPageData = filteredAndSortedAnomalies.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const resetPage = () => setCurrentPage(1);

  const neighbourhoods = useMemo(() => {
    if (!isDataReady || cleanedData.length === 0) {
      return [];
    }

    // Calculate neighbourhood frequency for better dropdown management (same logic as Dashboard)
    const neighbourhoodCounts = cleanedData.reduce((acc, row) => {
      const neighbourhood = row.neighbourhood;
      if (neighbourhood && neighbourhood.trim() !== '') {
        acc[neighbourhood] = (acc[neighbourhood] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topNeighbourhoods = Object.entries(neighbourhoodCounts)
      .sort(([,a], [,b]) => b - a) // Sort by frequency descending
      .slice(0, 15) // Top 15 most frequent
      .map(([neighbourhood]) => neighbourhood)
      .sort(); // Then sort alphabetically for display

    return topNeighbourhoods;
  }, [cleanedData, isDataReady]);

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
          <Select onValueChange={(value) => { setSentimentFilter(value); resetPage(); }} defaultValue="all">
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

          <Select onValueChange={(value) => { setNeighbourhoodFilter(value); resetPage(); }} defaultValue="all">
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
            {currentPageData.map((anomaly) => (
              <TableRow key={anomaly.review_id}>
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
                    <SheetContent className="w-[600px] sm:w-[700px]">
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
                          <label className="text-sm font-medium text-gray-500">Reason</label>
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-gray-700 leading-relaxed">{anomaly.detailedReason}</p>
                          </div>
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
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedAnomalies.length)} of {filteredAndSortedAnomalies.length} records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedAnomalyTable;
