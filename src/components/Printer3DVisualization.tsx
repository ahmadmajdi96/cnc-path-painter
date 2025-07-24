
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Search, Play, Pause, Square } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EndpointManager } from './EndpointManager';

interface Printer3DVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint: string;
  printerParams: any;
  onEndpointSelect: (endpoint: string) => void;
}

export const Printer3DVisualization = ({ 
  selectedMachineId, 
  selectedEndpoint, 
  printerParams,
  onEndpointSelect 
}: Printer3DVisualizationProps) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch 3D printer data
  const { data: printerData } = useQuery({
    queryKey: ['3d_printer', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      
      const { data, error } = await (supabase as any).from('3d_printers').select('*').eq('id', selectedMachineId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['.stl', '.obj', '.gcode', '.3mf'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (allowedTypes.includes(fileExtension)) {
        setUploadedFile(file);
        toast({
          title: "File uploaded",
          description: `${file.name} has been uploaded successfully`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload STL, OBJ, GCODE, or 3MF files only",
          variant: "destructive"
        });
      }
    }
  };

  const handleDownload = () => {
    if (uploadedFile) {
      const url = URL.createObjectURL(uploadedFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = uploadedFile.name;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleInternetSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter a search term",
        variant: "destructive"
      });
      return;
    }

    // Mock internet search functionality
    toast({
      title: "Searching...",
      description: `Searching for "${searchQuery}" on Thingiverse and other 3D model repositories`,
    });

    // Simulate search results
    setTimeout(() => {
      toast({
        title: "Search completed",
        description: "Found 42 results for your query. Results would be displayed here.",
      });
    }, 2000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    toast({
      title: isPlaying ? "Print paused" : "Print started",
      description: isPlaying ? "3D printing has been paused" : "3D printing has been started",
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    toast({
      title: "Print stopped",
      description: "3D printing has been stopped",
    });
  };

  if (!selectedMachineId) {
    return (
      <Card className="p-8 bg-white border border-gray-200">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-medium mb-2">3D Printer Visualization</h3>
          <p>Select a 3D printer to view its status and control printing operations</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main 3D Visualization */}
      <Card className="p-6 bg-white border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">3D Printer View</h3>
          <div className="flex gap-2">
            <Button
              onClick={handlePlayPause}
              size="sm"
              variant={isPlaying ? "secondary" : "default"}
            >
              {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isPlaying ? 'Pause' : 'Start'}
            </Button>
            <Button
              onClick={handleStop}
              size="sm"
              variant="destructive"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>

        {/* 3D Visualization Area */}
        <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🖨️</div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">3D Printer Visualization</h4>
            {printerData ? (
              <div className="text-sm text-gray-600">
                <p>Printer: {printerData.name}</p>
                <p>Model: {printerData.model}</p>
                <p>Status: {printerData.status}</p>
                {uploadedFile && (
                  <p className="mt-2 text-blue-600">Loaded: {uploadedFile.name}</p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">3D visualization will appear here</p>
            )}
          </div>
        </div>

        {/* Print Progress */}
        {isPlaying && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Print Progress</span>
              <span className="text-sm text-gray-600">42%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Layer 34 of 81</span>
              <span>Est. 2h 15m remaining</span>
            </div>
          </div>
        )}
      </Card>

      {/* File Management */}
      <Card className="p-6 bg-white border border-gray-200">
        <h4 className="font-medium mb-4">File Management</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* File Upload */}
          <div className="space-y-3">
            <Label>Upload 3D File</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".stl,.obj,.gcode,.3mf"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </Button>
              {uploadedFile && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            {uploadedFile && (
              <p className="text-sm text-gray-600">
                Current file: {uploadedFile.name}
              </p>
            )}
          </div>

          {/* Internet Search */}
          <div className="space-y-3">
            <Label>Search 3D Models</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Thingiverse, MyMiniFactory..."
                onKeyPress={(e) => e.key === 'Enter' && handleInternetSearch()}
              />
              <Button
                onClick={handleInternetSearch}
                variant="outline"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Endpoint Manager */}
      <EndpointManager
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect}
        selectedEndpoint={selectedEndpoint}
        machineType="3d_printer"
      />
    </div>
  );
};
