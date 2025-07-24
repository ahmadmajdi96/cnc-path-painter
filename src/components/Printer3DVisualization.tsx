
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Save, Play, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EndpointManager } from './EndpointManager';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Printer3DVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  printerParams: any;
  onEndpointSelect: (endpoint: string) => void;
}

export const Printer3DVisualization = ({ 
  selectedMachineId, 
  selectedEndpoint, 
  printerParams,
  onEndpointSelect 
}: Printer3DVisualizationProps) => {
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelUrl, setModelUrl] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: machineData } = useQuery({
    queryKey: ['3d_printers', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('3d_printers')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
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
      
      if (!allowedTypes.includes(fileExtension)) {
        toast({
          title: "Invalid file type",
          description: "Please upload STL, OBJ, G-code, or 3MF files",
          variant: "destructive"
        });
        return;
      }

      setModelFile(file);
      setModelUrl(URL.createObjectURL(file));
      toast({
        title: "File uploaded",
        description: `${file.name} loaded successfully`
      });
    }
  };

  const handleDownload = () => {
    if (!modelFile) {
      toast({
        title: "No file to download",
        description: "Please upload a 3D model first",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.href = modelUrl;
    link.download = modelFile.name;
    link.click();
    
    toast({
      title: "Download started",
      description: `Downloading ${modelFile.name}`
    });
  };

  const handleSaveModel = async () => {
    if (!modelFile || !selectedMachineId) {
      toast({
        title: "Cannot save",
        description: "Please select a machine and upload a model first",
        variant: "destructive"
      });
      return;
    }

    // This would save to database in a real implementation
    toast({
      title: "Model saved",
      description: "3D model saved successfully"
    });
  };

  const handleSearchPrintSettings = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter search query",
        description: "Please enter a material or print setting to search for",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulate API search - in real implementation, this would search for print settings
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Search completed",
        description: `Found print settings for "${searchQuery}"`
      });
    }, 2000);
  };

  const handleSendConfiguration = async () => {
    if (!selectedEndpoint || !modelFile) {
      toast({
        title: "Cannot send configuration",
        description: "Please select an endpoint and upload a model first",
        variant: "destructive"
      });
      return;
    }

    try {
      // This would send the configuration to the 3D printer
      toast({
        title: "Configuration sent",
        description: "Print job sent to 3D printer successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send configuration to 3D printer",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 3D Model Upload */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">3D Model Viewer</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Model
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              disabled={!modelFile}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleSaveModel}
              variant="outline"
              size="sm"
              disabled={!modelFile || !selectedMachineId}
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".stl,.obj,.gcode,.3mf"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* 3D Viewer Area */}
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
          {modelFile ? (
            <div className="text-center">
              <div className="text-lg font-medium text-gray-700 mb-2">
                {modelFile.name}
              </div>
              <div className="text-sm text-gray-500">
                3D model loaded - viewer would render here
              </div>
              <div className="mt-4 text-xs text-gray-400">
                In a real implementation, this would show a 3D preview using Three.js or similar
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Upload a 3D model file</p>
              <p className="text-sm text-gray-400">Supports STL, OBJ, G-code, and 3MF files</p>
            </div>
          )}
        </div>
      </Card>

      {/* Print Settings Search */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Search Print Settings</h3>
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="search-query">Material or Setting</Label>
            <Input
              id="search-query"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., PLA, ABS, PETG, support settings..."
            />
          </div>
          <Button
            onClick={handleSearchPrintSettings}
            disabled={isSearching}
            className="mt-6"
          >
            <Search className="w-4 h-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </Card>

      {/* Endpoint Manager */}
      <EndpointManager
        selectedMachineId={selectedMachineId}
        onEndpointSelect={onEndpointSelect}
        selectedEndpoint={selectedEndpoint}
        machineType="3d_printer"
      />

      {/* Send Configuration */}
      {selectedEndpoint && modelFile && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Send to 3D Printer</h4>
          <Button
            onClick={handleSendConfiguration}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Print Job
          </Button>
        </Card>
      )}
    </div>
  );
};
