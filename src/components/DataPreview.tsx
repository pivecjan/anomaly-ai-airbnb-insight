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

  // Get the first row to determine available columns
  const firstRow = rawData[0];
  if (!firstRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: No data rows found in CSV</p>
        </CardContent>
      </Card>
    );
  }

  // Get all available columns from the first row
  const availableColumns = Object.keys(firstRow);
  
  // Try to map common column variations to expected fields
  const getColumnValue = (row: any, possibleNames: string[]) => {
    for (const name of possibleNames) {
      if (row[name] !== undefined && row[name] !== null) {
        return row[name];
      }
    }
    return '';
  };

  // Define possible column name variations
  const listingIdColumns = ['listing_id', 'listingId', 'id', 'Listing ID'];
  const dateColumns = ['date', 'Date', 'created_at', 'review_date', 'Date of Review'];
  const commentColumns = ['comments', 'comment', 'review', 'Review', 'text', 'review_text'];
  const neighbourhoodColumns = ['neighbourhood_cleansed', 'neighbourhood', 'neighborhood', 'Neighbourhood', 'area', 'location'];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Data Preview</CardTitle>
            <p className="text-sm text-slate-600">
              Showing first {Math.min(10, rawData.length)} of {rawData.length} rows from uploaded CSV
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Detected columns: {availableColumns.join(', ')}
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
                    {getColumnValue(row, listingIdColumns)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getColumnValue(row, dateColumns)}
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                      {getColumnValue(row, commentColumns)}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {getColumnValue(row, neighbourhoodColumns)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Show all available columns for debugging */}
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Available Columns ({availableColumns.length}):</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs">
            {availableColumns.map((col, index) => (
              <div key={index} className="bg-white px-2 py-1 rounded border">
                {col}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
