import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface DataPreviewProps {
  data: any[];
}

export const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  // Show first 10 rows for preview
  const previewData = data.slice(0, 10);

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Preview</CardTitle>
        <p className="text-sm text-slate-600">
          Showing first {Math.min(10, data.length)} of {data.length} rows
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Listing ID</TableHead>
                <TableHead className="w-[120px]">Date</TableHead>
                <TableHead className="w-[200px]">Neighbourhood</TableHead>
                <TableHead className="w-[80px]">Language</TableHead>
                <TableHead className="min-w-[400px]">Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewData.map((row, index) => (
                <TableRow key={index} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    {row.listing_id}
                  </TableCell>
                  <TableCell className="text-sm">
                    {row.created_at || row.date}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {row.neighbourhood || row.neighbourhood_cleansed || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={row.language === 'en' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {(row.language || 'EN').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
                      {row.raw_text || row.comments || ''}
                    </div>
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
