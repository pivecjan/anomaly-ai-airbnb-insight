import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DataPreprocessor } from "@/utils/dataPreprocessing";
import { CSVParser } from "@/utils/csvParser";
import { useCSVDataStore } from "@/store/csvDataStore";

const CompactCSVUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  
  const { 
    cleanedData, 
    preprocessingReport, 
    setRawData,
    setCleanedData, 
    setPreprocessingReport, 
    clearData 
  } = useCSVDataStore();

  const parseCSV = (text: string): any[] => {
    return CSVParser.parse(text);
  };

  const handleFileUpload = useCallback(async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(0);
    setUploadedFile(file);
    setValidationErrors([]);
    clearData();

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 20, 80));
      }, 200);

      const text = await file.text();
      
      // Parse CSV data
      const rawData = parseCSV(text);
      
      if (rawData.length === 0) {
        throw new Error('CSV file must contain at least one data row');
      }

      const headers = Object.keys(rawData[0]);
      
      // Validate CSV structure
      const structureErrors = CSVParser.validateStructure(headers);
      if (structureErrors.length > 0) {
        clearInterval(progressInterval);
        setValidationStatus('invalid');
        setValidationErrors(structureErrors);
        setIsProcessing(false);
        setUploadProgress(0);
        return;
      }

      // Set raw data and preprocess
      setRawData(rawData);
      const { cleanedData, report } = DataPreprocessor.preprocessData(rawData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setCleanedData(cleanedData);
      setPreprocessingReport(report);

      if (cleanedData.length === 0) {
        setValidationStatus('invalid');
        setValidationErrors(['No valid data rows after preprocessing']);
        setIsProcessing(false);
        return;
      }

      setValidationStatus('valid');
      setIsProcessing(false);
      
      toast({
        title: "CSV Processing Complete",
        description: `Processed ${cleanedData.length} valid reviews`,
      });

    } catch (error) {
      setValidationStatus('invalid');
      setValidationErrors([error instanceof Error ? error.message : "Failed to process CSV file"]);
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [setCleanedData, setPreprocessingReport, setRawData, clearData, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
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
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium">Data Upload</span>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('compact-file-input')?.click()}
              disabled={isProcessing}
            >
              Choose CSV File
            </Button>
            
            <input
              id="compact-file-input"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {validationStatus === 'valid' && cleanedData.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">
                {cleanedData.length.toLocaleString()} reviews loaded 
                {uploadedFile && ` (${formatFileSize(uploadedFile.size)})`}
              </span>
            </div>
          )}

          {validationStatus === 'invalid' && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-red-700">Upload failed</span>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="mt-3">
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-slate-600 mt-1">Processing CSV...</p>
          </div>
        )}

        {validationErrors.length > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1 text-xs">
                {validationErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default CompactCSVUpload;
