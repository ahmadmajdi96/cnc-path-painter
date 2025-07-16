import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Download, Upload } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EndpointManager } from './EndpointManager';
import { useToast } from '@/hooks/use-toast';
import { Laser2DVisualization } from './Laser2DVisualization';

type CNCMachine = Tables<'cnc_machines'>;
type Toolpath = Tables<'toolpaths'>;

interface Point {
  x: number;
  y: number;
  z: number;
}

interface CNCVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  cncParams?: any;
  onEndpointSelect?: (endpoint: string) => void;
}

export const CNCVisualization = ({ selectedMachineId, selectedEndpoint, cncParams, onEndpointSelect }: CNCVisualizationProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [toolpathName, setToolpathName] = useState('');
  const [loadedToolpathId, setLoadedToolpathId] = useState<string | null>(null);
  const { toast } = useToast();

  const queryClient = useQueryClient();

  // Default CNC parameters to prevent crashes
  const defaultCncParams = {
    feedRate: 1000,
    spindleSpeed: 8000,
    plungeDepth: 2,
    material: 'aluminum',
    toolDiameter: 6,
    materialWidth: 300,
    materialHeight: 200,
    ...cncParams
  };

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['cnc-machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      console.log('Fetching CNC machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('cnc_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) {
        console.error('Error fetching CNC machine:', error);
        throw error;
      }
      console.log('Fetched CNC machine:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Fetch toolpaths for selected machine
  const { data: toolpaths = [] } = useQuery({
    queryKey: ['cnc-toolpaths', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      console.log('Fetching toolpaths for CNC machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('toolpaths')
        .select('*')
        .eq('cnc_machine_id', selectedMachineId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching CNC toolpaths:', error);
        throw error;
      }
      console.log('Fetched CNC toolpaths:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Save toolpath mutation
  const saveToolpathMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMachineId || points.length === 0) return;
      
      console.log('Saving CNC toolpath:', { selectedMachineId, points, defaultCncParams });
      const { error } = await supabase
        .from('toolpaths')
        .insert({
          cnc_machine_id: selectedMachineId,
          name: toolpathName || `Toolpath ${Date.now()}`,
          points: points as any,
          machine_params: defaultCncParams as any
        });
      
      if (error) {
        console.error('Error saving CNC toolpath:', error);
        throw error;
      }
      console.log('CNC toolpath saved successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cnc-toolpaths', selectedMachineId] });
      setToolpathName('');
      toast({
        title: "Success",
        description: "Toolpath saved successfully",
      });
    }
  });

  // Parse G-code file and extract points
  const parseGCodeFile = (gcode: string): Point[] => {
    const lines = gcode.split('\n');
    const extractedPoints: Point[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('G0') || trimmedLine.startsWith('G1')) {
        const xMatch = trimmedLine.match(/X([-\d.]+)/);
        const yMatch = trimmedLine.match(/Y([-\d.]+)/);
        const zMatch = trimmedLine.match(/Z([-\d.]+)/);
        
        if (xMatch && yMatch) {
          extractedPoints.push({
            x: parseFloat(xMatch[1]),
            y: parseFloat(yMatch[1]),
            z: zMatch ? parseFloat(zMatch[1]) : 0
          });
        }
      }
    }
    
    return extractedPoints;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const parsedPoints = parseGCodeFile(content);
        if (parsedPoints.length > 0) {
          setPoints(parsedPoints);
          setCurrentPoint(0);
          setLoadedToolpathId(null);
          setToolpathName(file.name.replace(/\.[^/.]+$/, ""));
          toast({
            title: "G-Code Loaded",
            description: `Successfully loaded ${parsedPoints.length} points from ${file.name}`,
          });
        } else {
          toast({
            title: "No Points Found",
            description: "The G-code file doesn't contain valid movement commands",
            variant: "destructive"
          });
        }
      }
    };
    reader.readAsText(file);
    
    // Reset the input value to allow uploading the same file again
    event.target.value = '';
  };

  useEffect(() => {
    if (toolpaths.length > 0 && selectedMachineId && !loadedToolpathId) {
      const latestToolpath = toolpaths[0];
      console.log('Auto-loading latest CNC toolpath:', latestToolpath);
      loadToolpath(latestToolpath);
    }
  }, [toolpaths, selectedMachineId, loadedToolpathId]);

  const loadToolpath = (toolpath: Toolpath) => {
    console.log('Loading CNC toolpath:', toolpath);
    const pathPoints = Array.isArray(toolpath.points) 
      ? (toolpath.points as unknown as Point[])
      : [];
    setPoints(pathPoints);
    setCurrentPoint(0);
    setLoadedToolpathId(toolpath.id);
  };

  const startSimulation = () => {
    if (points.length === 0) return;
    
    setIsSimulating(true);
    setCurrentPoint(0);

    const interval = setInterval(() => {
      setCurrentPoint(prev => {
        if (prev >= points.length - 1) {
          setIsSimulating(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 800); // Slower for CNC operations
  };

  const stopSimulation = () => {
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentPoint(0);
  };

  const handleSimulationToggle = () => {
    if (isSimulating) {
      stopSimulation();
    } else {
      startSimulation();
    }
  };

  const addPoint = (point: { x: number; y: number }) => {
    setPoints(prev => [...prev, { ...point, z: 0 }]);
  };

  const clearPoints = () => {
    setPoints([]);
    setCurrentPoint(0);
    setLoadedToolpathId(null);
  };

  const generateGCode = () => {
    if (points.length === 0) return '';

    let gcode = '; Generated CNC G-Code\n';
    gcode += `; Machine: ${selectedMachine?.name || 'Unknown'}\n`;
    gcode += `; Date: ${new Date().toISOString()}\n`;
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    
    points.forEach((point, index) => {
      // Add null checks to prevent undefined errors
      const x = typeof point.x === 'number' ? point.x : 0;
      const y = typeof point.y === 'number' ? point.y : 0;
      const z = typeof point.z === 'number' ? point.z : 0;
      
      if (index === 0) {
        gcode += `G0 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} ; Rapid to start\n`;
      } else {
        gcode += `G1 X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)} ; Linear move\n`;
      }
    });

    gcode += 'G0 Z10 ; Retract\n';
    gcode += 'G0 X0 Y0 ; Return to origin\n';

    return gcode;
  };

  const downloadGCode = () => {
    const gcode = generateGCode();
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolpathName || 'toolpath'}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendGCodeToEndpoint = async () => {
    if (!selectedEndpoint || points.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select an endpoint and create a toolpath first",
        variant: "destructive"
      });
      return;
    }
    
    const gcode = generateGCode();
    const payload = {
      gcode,
      parameters: defaultCncParams,
      points: points.map(p => ({
        x: (typeof p.x === 'number' ? p.x : 0).toFixed(3),
        y: (typeof p.y === 'number' ? p.y : 0).toFixed(3),
        z: (typeof p.z === 'number' ? p.z : 0).toFixed(3)
      })),
      machine_id: selectedMachineId,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(selectedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast({
          title: "G-Code Sent Successfully",
          description: `G-code sent to ${selectedEndpoint} with ${points.length} points`,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      toast({
        title: "Failed to Send G-Code",
        description: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  // Convert CNC parameters to laser-compatible format for visualization
  const laserCompatibleParams = {
    laserPower: 75,
    pulseFrequency: 1000,
    markingSpeed: defaultCncParams.feedRate,
    pulseDuration: 100,
    beamDiameter: defaultCncParams.toolDiameter || 6,
    material: defaultCncParams.material || 'aluminum',
    materialWidth: defaultCncParams.materialWidth || 300,
    materialHeight: defaultCncParams.materialHeight || 200
  };

  // Convert 3D points to 2D for visualization
  const points2D = points.map(p => ({ x: p.x, y: p.y }));

  return (
    <div className="space-y-6">
      {/* CNC Visualization */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Realistic CNC 2D Visualization</h3>
          {!selectedMachineId && (
            <p className="text-gray-600 text-sm">Select a CNC machine to start creating toolpaths</p>
          )}
        </div>

        {selectedMachineId && (
          <>
            <Laser2DVisualization
              points={points2D}
              isSimulating={isSimulating}
              currentPoint={currentPoint}
              onSimulationToggle={handleSimulationToggle}
              onReset={resetSimulation}
              onAddPoint={addPoint}
              onClearPoints={clearPoints}
              laserParams={laserCompatibleParams}
              machineName={selectedMachine?.name || 'CNC Machine'}
            />

            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                onClick={downloadGCode}
                disabled={points.length === 0}
                size="sm"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download G-Code
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                size="sm"
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload G-Code
              </Button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".gcode,.nc,.cnc"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />

            {points.length > 0 && (
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Toolpath name"
                  value={toolpathName}
                  onChange={(e) => setToolpathName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => saveToolpathMutation.mutate()}
                  disabled={saveToolpathMutation.isPending}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}

            {toolpaths.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Saved Toolpaths</h4>
                <ScrollArea className="h-40 border border-gray-200 rounded p-2">
                  <div className="space-y-2">
                    {toolpaths.map((toolpath) => (
                      <div
                        key={toolpath.id}
                        className={`flex items-center justify-between p-2 border rounded ${
                          loadedToolpathId === toolpath.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {toolpath.name} ({Array.isArray(toolpath.points) ? (toolpath.points as unknown as Point[]).length : 0} points)
                          </span>
                          {loadedToolpathId === toolpath.id && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Loaded
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => loadToolpath(toolpath)}
                          size="sm"
                          variant="outline"
                        >
                          Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Endpoint Manager */}
      {selectedMachineId && (
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          onEndpointSelect={onEndpointSelect || (() => {})}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="cnc"
        />
      )}

      {/* Send G-Code Section */}
      {selectedEndpoint && points.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Send G-Code</h4>
          <Button
            onClick={sendGCodeToEndpoint}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Send G-Code to Machine
          </Button>
        </Card>
      )}
    </div>
  );
};
