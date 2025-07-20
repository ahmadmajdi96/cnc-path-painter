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

type LaserMachine = Tables<'laser_machines'>;
type LaserToolpath = Tables<'laser_toolpaths'>;

interface Point {
  x: number;
  y: number;
}

interface LaserVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  laserParams?: any;
  onEndpointSelect?: (endpoint: string) => void;
}

export const LaserVisualization = ({ selectedMachineId, selectedEndpoint: externalSelectedEndpoint, laserParams, onEndpointSelect }: LaserVisualizationProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [toolpathName, setToolpathName] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('');
  const [loadedToolpathId, setLoadedToolpathId] = useState<string | null>(null);
  const [hasAutoLoaded, setHasAutoLoaded] = useState<Record<string, boolean>>({});

  // Use default laser params if none provided
  const [defaultLaserParams] = useState({
    laserPower: 79,
    pulseFrequency: 4300,
    markingSpeed: 1050,
    pulseDuration: 100,
    zOffset: 0,
    passes: 1,
    laserMode: 'pulsed',
    beamDiameter: 0.1,
    material: 'steel',
    materialWidth: 300,
    materialHeight: 200
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use external parameters if provided, otherwise use defaults
  const currentLaserParams = laserParams || defaultLaserParams;

  // Use external selectedEndpoint if provided
  useEffect(() => {
    if (externalSelectedEndpoint) {
      setSelectedEndpoint(externalSelectedEndpoint);
    }
  }, [externalSelectedEndpoint]);

  // Clear points when machine changes
  useEffect(() => {
    if (selectedMachineId) {
      setPoints([]);
      setCurrentPoint(0);
      setIsSimulating(false);
      setLoadedToolpathId(null);
      setToolpathName('');
      console.log('Cleared points for laser machine change:', selectedMachineId);
    }
  }, [selectedMachineId]);

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['laser-machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      console.log('Fetching machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) {
        console.error('Error fetching machine:', error);
        throw error;
      }
      console.log('Fetched machine:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Fetch toolpaths for selected machine
  const { data: toolpaths = [] } = useQuery({
    queryKey: ['laser-toolpaths', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return [];
      console.log('Fetching toolpaths for machine:', selectedMachineId);
      const { data, error } = await supabase
        .from('laser_toolpaths')
        .select('*')
        .eq('laser_machine_id', selectedMachineId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching toolpaths:', error);
        throw error;
      }
      console.log('Fetched toolpaths:', data);
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Save toolpath mutation
  const saveToolpathMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMachineId || points.length === 0) return;
      
      console.log('Saving toolpath:', { selectedMachineId, points, currentLaserParams });
      const { error } = await supabase
        .from('laser_toolpaths')
        .insert({
          laser_machine_id: selectedMachineId,
          name: toolpathName || `Toolpath ${Date.now()}`,
          points: points as any,
          laser_params: currentLaserParams as any
        });
      
      if (error) {
        console.error('Error saving toolpath:', error);
        throw error;
      }
      console.log('Toolpath saved successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laser-toolpaths', selectedMachineId] });
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
        
        if (xMatch && yMatch) {
          extractedPoints.push({
            x: parseFloat(xMatch[1]),
            y: parseFloat(yMatch[1])
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
          // Clear all existing state and load new G-code
          setPoints(parsedPoints);
          setCurrentPoint(0);
          setIsSimulating(false);
          setLoadedToolpathId(null);
          setToolpathName(file.name.replace(/\.[^/.]+$/, ""));
          console.log('G-code uploaded successfully, cleared previous points:', parsedPoints);
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

  // Auto-load latest toolpath only once per machine
  useEffect(() => {
    if (toolpaths.length > 0 && selectedMachineId && !hasAutoLoaded[selectedMachineId] && !loadedToolpathId && points.length === 0) {
      const latestToolpath = toolpaths[0];
      console.log('Auto-loading latest toolpath:', latestToolpath);
      loadToolpath(latestToolpath);
      setHasAutoLoaded(prev => ({ ...prev, [selectedMachineId]: true }));
    }
  }, [toolpaths, selectedMachineId, hasAutoLoaded, loadedToolpathId, points.length]);

  const loadToolpath = (toolpath: LaserToolpath) => {
    console.log('Loading laser toolpath, clearing previous points:', toolpath);
    const pathPoints = Array.isArray(toolpath.points) 
      ? (toolpath.points as unknown as Point[])
      : [];
    
    // Clear all state before loading new toolpath
    setPoints(pathPoints);
    setCurrentPoint(0);
    setIsSimulating(false);
    setLoadedToolpathId(toolpath.id);
    setToolpathName('');
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
    }, 500);
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

  const addPoint = (point: Point) => {
    setPoints(prev => [...prev, point]);
    setLoadedToolpathId(null); // Clear loaded toolpath when manually adding points
  };

  const clearPoints = () => {
    setPoints([]);
    setCurrentPoint(0);
    setIsSimulating(false);
    setLoadedToolpathId(null);
    setToolpathName('');
    console.log('Points cleared manually');
  };

  const generateGCode = () => {
    if (points.length === 0) return '';

    let gcode = '; Generated Laser G-Code\n';
    gcode += `; Machine: ${selectedMachine?.name || 'Unknown'}\n`;
    gcode += `; Date: ${new Date().toISOString()}\n`;
    gcode += `; Laser Power: ${currentLaserParams.laserPower}%\n`;
    gcode += `; Pulse Frequency: ${currentLaserParams.pulseFrequency} Hz\n`;
    gcode += `; Marking Speed: ${currentLaserParams.markingSpeed} mm/min\n`;
    gcode += `; Pulse Duration: ${currentLaserParams.pulseDuration} µs\n`;
    gcode += `; Z-Offset: ${currentLaserParams.zOffset} mm\n`;
    gcode += `; Beam Diameter: ${currentLaserParams.beamDiameter} mm\n`;
    gcode += `; Passes: ${currentLaserParams.passes}\n`;
    gcode += `; Mode: ${currentLaserParams.laserMode}\n`;
    gcode += `; Material: ${currentLaserParams.material}\n\n`;
    
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    gcode += `G0 Z${currentLaserParams.zOffset} ; Move to Z offset\n`;
    
    gcode += `M3 S${Math.round((currentLaserParams.laserPower / 100) * 1000)} ; Set laser power\n`;
    gcode += `M4 P${currentLaserParams.pulseFrequency} ; Set pulse frequency\n`;
    gcode += `M5 D${currentLaserParams.pulseDuration} ; Set pulse duration\n\n`;

    for (let pass = 1; pass <= currentLaserParams.passes; pass++) {
      gcode += `; Pass ${pass}\n`;
      
      points.forEach((point, index) => {
        const mmX = (point.x).toFixed(3);
        const mmY = (point.y).toFixed(3);
        
        if (index === 0) {
          gcode += `G0 X${mmX} Y${mmY} ; Rapid to start position\n`;
          if (currentLaserParams.laserMode === 'continuous') {
            gcode += 'M3 ; Start laser (continuous mode)\n';
          }
        } else {
          if (currentLaserParams.laserMode === 'pulsed') {
            gcode += `G1 X${mmX} Y${mmY} F${currentLaserParams.markingSpeed} ; Pulsed laser move\n`;
          } else {
            gcode += `G1 X${mmX} Y${mmY} F${currentLaserParams.markingSpeed} ; Continuous laser move\n`;
          }
        }
      });
      
      if (currentLaserParams.laserMode === 'continuous') {
        gcode += 'M5 ; Stop laser\n';
      }
      gcode += '\n';
    }

    gcode += 'G0 Z10 ; Retract\n';
    gcode += 'M5 ; Ensure laser is off\n';
    gcode += 'G0 X0 Y0 ; Return to origin\n';

    return gcode;
  };

  const downloadGCode = () => {
    const gcode = generateGCode();
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolpathName || 'laser_toolpath'}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendGCodeToEndpoint = async () => {
    const endpoint = selectedEndpoint || externalSelectedEndpoint;
    if (!endpoint || points.length === 0) {
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
      parameters: currentLaserParams,
      points: points.map(p => ({
        x: p.x.toFixed(3),
        y: p.y.toFixed(3)
      })),
      machine_id: selectedMachineId,
      timestamp: new Date().toISOString()
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast({
          title: "G-Code Sent Successfully",
          description: `G-code sent to ${endpoint} with ${points.length} points`,
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

  return (
    <div className="space-y-6">
      {/* Laser Visualization */}
      <Card className="p-4 bg-white border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Realistic Laser 2D Visualization</h3>
          {!selectedMachineId && (
            <p className="text-gray-600 text-sm">Select a machine to start creating toolpaths</p>
          )}
        </div>

        {selectedMachineId && (
          <>
            <Laser2DVisualization
              points={points}
              isSimulating={isSimulating}
              currentPoint={currentPoint}
              onSimulationToggle={handleSimulationToggle}
              onReset={resetSimulation}
              onAddPoint={addPoint}
              onClearPoints={clearPoints}
              laserParams={currentLaserParams}
              machineName={selectedMachine?.name}
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
                            ? 'border-purple-500 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {toolpath.name} ({Array.isArray(toolpath.points) ? (toolpath.points as unknown as Point[]).length : 0} points)
                          </span>
                          {loadedToolpathId === toolpath.id && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
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
          onEndpointSelect={onEndpointSelect || setSelectedEndpoint}
          selectedEndpoint={selectedEndpoint || ''}
          machineType="laser"
        />
      )}

      {/* Send G-Code Section */}
      {(selectedEndpoint || externalSelectedEndpoint) && points.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Send G-Code</h4>
          <Button
            onClick={sendGCodeToEndpoint}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            Send G-Code to Machine
          </Button>
        </Card>
      )}
    </div>
  );
};
