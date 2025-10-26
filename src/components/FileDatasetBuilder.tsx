import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Upload, FileSpreadsheet, Download, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileDatasetBuilderProps {
  datasetId: string;
}

interface CSVFile {
  id: string;
  name: string;
  content: string;
}

export const FileDatasetBuilder = ({ datasetId }: FileDatasetBuilderProps) => {
  const [files, setFiles] = useState<CSVFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CSVFile | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchFiles();
  }, [datasetId]);

  useEffect(() => {
    if (selectedFile) {
      parseCSV(selectedFile.content);
    }
  }, [selectedFile]);

  const fetchFiles = async () => {
    const { data, error } = await supabase
      .from('dataset_items')
      .select('*')
      .eq('dataset_id', datasetId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error fetching files',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setFiles(data as CSVFile[]);
  };

  const parseCSV = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;

    const parsed = lines.map(line => {
      // Simple CSV parsing (handles quoted fields)
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    });

    setHeaders(parsed[0] || []);
    setCsvData(parsed.slice(1));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Only CSV files are allowed',
        variant: 'destructive',
      });
      return;
    }

    const content = await file.text();

    const { error } = await supabase
      .from('dataset_items')
      .insert({
        dataset_id: datasetId,
        name: file.name,
        content: content,
      });

    if (error) {
      toast({
        title: 'Error uploading file',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'File uploaded',
      description: `${file.name} has been uploaded successfully`,
    });

    fetchFiles();
  };

  const deleteFile = async (fileId: string) => {
    const { error } = await supabase
      .from('dataset_items')
      .delete()
      .eq('id', fileId);

    if (error) {
      toast({
        title: 'Error deleting file',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'File deleted',
      description: 'CSV file has been deleted successfully',
    });

    if (selectedFile?.id === fileId) {
      setSelectedFile(null);
      setCsvData([]);
      setHeaders([]);
    }

    fetchFiles();
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...csvData];
    newData[rowIndex][colIndex] = value;
    setCsvData(newData);
  };

  const updateHeader = (colIndex: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[colIndex] = value;
    setHeaders(newHeaders);
  };

  const addRow = () => {
    const newRow = headers.map(() => '');
    setCsvData([...csvData, newRow]);
  };

  const addColumn = () => {
    setHeaders([...headers, `Column ${headers.length + 1}`]);
    setCsvData(csvData.map(row => [...row, '']));
  };

  const deleteRow = (rowIndex: number) => {
    setCsvData(csvData.filter((_, index) => index !== rowIndex));
  };

  const deleteColumn = (colIndex: number) => {
    setHeaders(headers.filter((_, index) => index !== colIndex));
    setCsvData(csvData.map(row => row.filter((_, index) => index !== colIndex)));
  };

  const saveChanges = async () => {
    if (!selectedFile) return;

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const { error } = await supabase
      .from('dataset_items')
      .update({ content: csvContent })
      .eq('id', selectedFile.id);

    if (error) {
      toast({
        title: 'Error saving changes',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Changes saved',
      description: 'CSV file has been updated successfully',
    });

    fetchFiles();
  };

  const exportCSV = () => {
    if (!selectedFile) return;

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => 
        cell.includes(',') ? `"${cell}"` : cell
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedFile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedFile(null)}>
            ← Back to Files
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={saveChanges}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedFile.name}</CardTitle>
                <CardDescription>
                  {csvData.length} rows × {headers.length} columns
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={addRow}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Row
                </Button>
                <Button size="sm" onClick={addColumn}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] w-full border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <Input
                            value={header}
                            onChange={(e) => updateHeader(index, e.target.value)}
                            className="h-8 font-medium"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteColumn(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="font-medium text-muted-foreground">
                        {rowIndex + 1}
                      </TableCell>
                      {row.map((cell, colIndex) => (
                        <TableCell key={colIndex}>
                          <Input
                            value={cell}
                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                            className="h-9"
                          />
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRow(rowIndex)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload CSV files to manage data in a spreadsheet view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Files ({files.length})</CardTitle>
          <CardDescription>
            Click on a file to view and edit in spreadsheet view
          </CardDescription>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No CSV files yet. Upload your first file above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedFile(file)}
                >
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <span className="font-medium">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
