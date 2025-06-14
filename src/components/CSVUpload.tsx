
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVUploadProps {
  onDataUpload: (data: any[]) => void;
}

const CSVUpload = ({ onDataUpload }: CSVUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const requiredFields = ['review_id', 'listing_id', 'neighbourhood', 'created_at', 'language', 'raw_text'];

  const validateCSVStructure = (data: any[]) => {
    const errors: string[] = [];
    
    if (data.length === 0) {
      errors.push("CSV file is empty");
      return errors;
    }

    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));
    
    if (missingFields.length > 0) {
      errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check date format in created_at
    const sampleDates = data.slice(0, 10).map(row => row.created_at);
    const invalidDates = sampleDates.filter(date => isNaN(Date.parse(date)));
    
    if (invalidDates.length > 0) {
      errors.push("Invalid date format in created_at field. Expected: YYYY-MM-DD or ISO format");
    }

    // Check for empty required fields
    const emptyFields = requiredFields.filter(field => 
      data.some(row => !row[field] || row[field].toString().trim() === '')
    );
    
    if (emptyFields.length > 0) {
      errors.push(`Empty values found in: ${emptyFields.join(', ')}`);
    }

    return errors;
  };

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

    try {
      const text = await file.text();
      const data = parseCSV(text);
      const errors = validateCSVStructure(data);

      if (errors.length > 0) {
        setValidationStatus('invalid');
        setValidationErrors(errors);
        toast({
          title: "CSV Validation Failed",
          description: `Found ${errors.length} validation errors`,
          variant: "destructive"
        });
      } else {
        setValidationStatus('valid');
        setValidationErrors([]);
        onDataUpload(data);
        toast({
          title: "CSV Upload Successful",
          description: `Loaded ${data.length} reviews for analysis`,
        });
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationErrors(["Failed to parse CSV file"]);
      toast({
        title: "Upload Error",
        description: "Failed to read the CSV file",
        variant: "destructive"
      });
    }
  }, [onDataUpload, toast]);

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
          CSV Data Upload
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
            Required fields: review_id, listing_id, neighbourhood, created_at, language, raw_text
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
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {validationStatus === 'validating' && (
                <Badge variant="secondary">Validating...</Badge>
              )}
              {validationStatus === 'valid' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Valid CSV Structure
                </Badge>
              )}
              {validationStatus === 'invalid' && (
                <Badge variant="destructive">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Validation Failed
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
          </div>
        )}

        <div className="text-xs text-slate-500">
          <p><strong>Expected CSV format:</strong></p>
          <p>review_id,listing_id,neighbourhood,created_at,language,raw_text</p>
          <p>1,2539,"Downtown",2023-05-14,en,"Amazing place! Clean and comfortable."</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSVUpload;
