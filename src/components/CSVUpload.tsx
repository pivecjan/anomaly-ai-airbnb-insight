import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertTriangle, Download, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataPreprocessor, PreprocessingReport, CleanedRow } from "@/utils/dataPreprocessing";
import { useCSVDataStore } from "@/store/csvDataStore";

const CSVUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { 
    cleanedData, 
    preprocessingReport, 
    setCleanedData, 
    setPreprocessingReport, 
    clearData 
  } = useCSVDataStore();

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setValidationStatus('validating');
    setUploadedFile(file);
    setValidationErrors([]);
    clearData();

    try {
      const text = await file.text();
      const lines = text.split('\n');
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Validate CSV structure
      const structureErrors = DataPreprocessor.validateStructure(headers);
      if (structureErrors.length > 0) {
        setValidationStatus('invalid');
        setValidationErrors(structureErrors);
        toast({
          title: "CSV Structure Invalid",
          description: `Found ${structureErrors.length} structural errors`,
          variant: "destructive"
        });
        return;
      }

      // Parse and preprocess data
      const rawData = parseCSV(text);
      const { cleanedData, report } = DataPreprocessor.preprocessData(rawData);

      setCleanedData(cleanedData);
      setPreprocessingReport(report);

      if (cleanedData.length === 0) {
        setValidationStatus('invalid');
        setValidationErrors(['No valid data rows after preprocessing']);
        toast({
          title: "Data Processing Failed",
          description: "All rows were removed during preprocessing",
          variant: "destructive"
        });
        return;
      }

      setValidationStatus('valid');
      
      toast({
        title: "CSV Processing Complete",
        description: `Processed ${cleanedData.length} valid reviews from ${rawData.length} original rows`,
      });

    } catch (error) {
      setValidationStatus('invalid');
      setValidationErrors([error instanceof Error ? error.message : "Failed to process CSV file"]);
      toast({
        title: "Processing Error",
        description: "Failed to process the CSV file",
        variant: "destructive"
      });
    }
  }, [setCleanedData, setPreprocessingReport, clearData, toast]);

  const downloadCleanedData = () => {
    if (cleanedData.length === 0) return;

    const headers = ['review_id', 'listing_id', 'neighbourhood', 'created_at', 'language', 'raw_text', 'needs_translation'];
    const csvContent = [
      headers.join(','),
      ...cleanedData.map(row => 
        headers.map(header => `"${row[header as keyof CleanedRow]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cleaned_reviews.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = () => {
    if (!preprocessingReport) return;

    const reportContent = DataPreprocessor.generateReportSummary(preprocessingReport);
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preprocessing_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileUpload(file);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file",
        variant: "destructive"
      });
    }
  }, [handleFileUpload, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Data Engineer Agent - CSV Processing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-slate-400'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
        >
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
          <p className="text-lg font-medium mb-2">
            {uploadedFile ? uploadedFile.name : 'Drop your CSV file here'}
          </p>
          <p className="text-sm text-slate-600 mb-4">
            Required structure: review_id, listing_id, neighbourhood, created_at, language, raw_text
          </p>
          <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
            Choose File
          </Button>
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {validationStatus !== 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationStatus === 'validating' && (
                <Badge variant="secondary">Processing...</Badge>
              )}
              {validationStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Data Processed Successfully
                </Badge>
              )}
              {validationStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Processing Failed
                </Badge>
              )}
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <div key={index}>• {error}</div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {preprocessingReport && (
              <div className="space-y-4">
                <Card className="bg-slate-50 border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4" />
                      Preprocessing Report
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Original Rows:</span>
                        <span className="ml-2 font-medium">{preprocessingReport.originalRows}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Cleaned Rows:</span>
                        <span className="ml-2 font-medium text-green-600">{preprocessingReport.cleanedRows}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Removed Rows:</span>
                        <span className="ml-2 font-medium text-red-600">{preprocessingReport.removedRows}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Non-English:</span>
                        <span className="ml-2 font-medium text-blue-600">{preprocessingReport.nonEnglishCount}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadCleanedData}>
                        <Download className="w-3 h-3 mr-1" />
                        Download Cleaned CSV
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadReport}>
                        <Download className="w-3 h-3 mr-1" />
                        Download Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-slate-500">
          <p><strong>Expected CSV format:</strong></p>
          <p>review_id,listing_id,neighbourhood,created_at,language,raw_text</p>
          <p>123,A1,Downtown,2024-01-15,en,"Great place to stay!"</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;
