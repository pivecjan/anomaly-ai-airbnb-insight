import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useCSVDataStore } from '@/store/csvDataStore';

export const DataPreview: React.FC = () => {
  const { rawData, isDataReady, clearData } = useCSVDataStore();
  
  // Show first 10 rows for preview
  const previewData = rawData.slice(0, 10);

  // Debug: Log the first row to see what fields are available
  if (rawData.length > 0) {
    console.log('Raw data first row:', rawData[0]);
    console.log('Available fields:', Object.keys(rawData[0]));
  }

  if (!isDataReady || !rawData || rawData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No data available. Please upload a CSV file.</p>
        </CardContent>
      </Card>
    );
  }

  // Check if we have the expected CSV structure
  const firstRow = rawData[0];
  const hasExpectedFields = firstRow && 
    'listing_id' in firstRow && 
    'date' in firstRow && 
    'comments' in firstRow && 
    'neighbourhood_cleansed' in firstRow;

  if (!hasExpectedFields) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            Error: CSV does not have expected structure. Expected columns: listing_id, date, comments, neighbourhood_cleansed
          </p>
          {firstRow && (
            <p className="text-sm text-slate-600 mt-2">
              Found columns: {Object.keys(firstRow).join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Preview</CardTitle>
            <p className="text-sm text-slate-600">
              Showing first {Math.min(10, rawData.length)} of {rawData.length} rows from uploaded CSV
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearData}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Data
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Listing ID</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="min-w-[400px]">Review</TableHead>
                <TableHead className="w-[200px]">Neighbourhood</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    {row.listing_id || ''}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.date || ''}
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                      {row.comments || ''}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.neighbourhood_cleansed || ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
