import React, { useRef, useState, useCallback, Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, useFBX } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Upload, Trash2, Send, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';


function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);
  return (
    <mesh>
      <primitive object={geometry} />
      <meshStandardMaterial color="#8B5CF6" />
    </mesh>
  );
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function ModelRenderer({ url, fileType, position, rotation, scale }: { 
  url: string; 
  fileType: string; 
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  try {
    // Handle GLTF/GLB files
    if (fileType === 'gltf' || fileType === 'glb') {
      const { scene } = useGLTF(url);
      return (
        <group position={position} rotation={rotation} scale={scale}>
          <primitive object={scene} />
        </group>
      );
    }
    
    // Handle FBX files
    if (fileType === 'fbx') {
      const fbx = useFBX(url);
      return (
        <group position={position} rotation={rotation} scale={scale}>
          <primitive object={fbx} />
        </group>
      );
    }
    
    // Handle STL files
    if (fileType === 'stl') {
      return (
        <group position={position} rotation={rotation} scale={scale}>
          <STLModel url={url} />
        </group>
      );
    }
    
    // Handle OBJ files
    if (fileType === 'obj') {
      return (
        <group position={position} rotation={rotation} scale={scale}>
          <OBJModel url={url} />
        </group>
      );
    }
    
    // Default fallback
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  } catch (error) {
    console.error('Error loading 3D model:', error);
    // Return error placeholder
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    );
  }
}

function BuildVolume({ sizeX = 200, sizeY = 200, sizeZ = 200 }: { sizeX?: number; sizeY?: number; sizeZ?: number }) {
  return (
    <mesh position={[0, sizeZ / 2, 0]}>
      <boxGeometry args={[sizeX, sizeZ, sizeY]} />
      <meshBasicMaterial wireframe color="#6366f1" opacity={0.3} transparent />
    </mesh>
  );
}

interface Model3DViewerProps {
  buildVolumeX?: number;
  buildVolumeY?: number;
  buildVolumeZ?: number;
  selectedMachineId?: string;
  selectedEndpoint?: string;
}

export const Model3DViewer = ({ 
  buildVolumeX = 200, 
  buildVolumeY = 200, 
  buildVolumeZ = 200,
  selectedMachineId,
  selectedEndpoint
}: Model3DViewerProps) => {
  const [modelData, setModelData] = useState<Array<{ 
    url: string; 
    file: File; 
    fileType: string; 
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
  }>>([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load configuration on mount
  useEffect(() => {
    const loadConfiguration = async () => {
      console.log('loadConfiguration called with selectedMachineId:', selectedMachineId);
      
      if (!selectedMachineId) {
        console.log('No machine selected, clearing modelData');
        setModelData([]);
        return;
      }
      
      // Clear existing models when switching printers
      console.log('Clearing modelData for new printer');
      setModelData([]);
      
      try {
        console.log('Fetching configuration for printer:', selectedMachineId);
        const { data, error } = await supabase
          .from('printer_3d_configurations')
          .select('*')
          .eq('printer_id', selectedMachineId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        console.log('Database query result:', { data, error });

        if (error) {
          console.error('Error loading configuration:', error);
          return;
        }

        if (data) {
          const storedModels = Array.isArray(data.models) ? data.models : [];
          console.log('Found stored models:', storedModels);
          console.log('Full configuration data:', data);
          
          // Note: We can't restore actual file objects after refresh due to browser security,
          // but we can show placeholders with the saved parameters
          if (storedModels.length > 0) {
            toast({
              title: "Configuration Loaded", 
              description: `Found ${storedModels.length} model(s) from previous session. Re-upload files to see them.`,
            });
          }
        } else {
          console.log('No saved configuration found for printer:', selectedMachineId);
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };

    loadConfiguration();
  }, [selectedMachineId, toast]);

  // Save configuration whenever data changes
  useEffect(() => {
    const saveConfiguration = async () => {
      if (!selectedMachineId) return;

      const configData = {
        printer_id: selectedMachineId,
        endpoint_url: selectedEndpoint || null,
        build_volume_x: buildVolumeX,
        build_volume_y: buildVolumeY,
        build_volume_z: buildVolumeZ,
        models: modelData.map(model => ({
          filename: model.file.name,
          fileType: model.fileType,
          position: model.position,
          rotation: model.rotation,
          scale: model.scale
        }))
      };

      try {
        const { error } = await supabase
          .from('printer_3d_configurations')
          .upsert(configData, { 
            onConflict: 'printer_id',
            ignoreDuplicates: false 
          });

        if (error) {
          console.error('Error saving configuration:', error);
        } else {
          console.log('Configuration saved successfully for printer:', selectedMachineId);
        }
      } catch (error) {
        console.error('Error saving configuration:', error);
      }
    };

    const timeoutId = setTimeout(saveConfiguration, 1000); // Debounce saves
    return () => clearTimeout(timeoutId);
  }, [selectedMachineId, selectedEndpoint, buildVolumeX, buildVolumeY, buildVolumeZ, modelData]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const extension = file.name.toLowerCase();
      return extension.endsWith('.gltf') || 
             extension.endsWith('.glb') || 
             extension.endsWith('.fbx') ||
             extension.endsWith('.obj') ||
             extension.endsWith('.stl');
    });

    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Invalid file format",
        description: "Please upload .gltf, .glb, .fbx, .obj, or .stl files only",
        variant: "destructive"
      });
    }

    if (validFiles.length > 0) {
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        const fileType = file.name.split('.').pop()?.toLowerCase() || '';
        setModelData(prev => [...prev, { 
          url, 
          file, 
          fileType, 
          position: [0, 0, 0], // Start at ground level
          rotation: [0, 0, 0],
          scale: [1, 1, 1]
        }]);
      });

      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) added to the viewer`,
      });
    }
  }, [toast]);

  const handleRemoveModel = (index: number) => {
    const modelToRemove = modelData[index];
    if (modelToRemove) {
      URL.revokeObjectURL(modelToRemove.url);
    }
    
    setModelData(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Model removed",
      description: "Model has been removed from the viewer",
    });
  };

  const handleSendToConfiguration = async () => {
    if (!selectedEndpoint || !selectedMachineId) {
      toast({
        title: "Configuration Error",
        description: "Please select a machine and endpoint first",
        variant: "destructive"
      });
      return;
    }

    const configData = {
      machineId: selectedMachineId,
      endpoint: selectedEndpoint,
      buildVolume: { x: buildVolumeX, y: buildVolumeY, z: buildVolumeZ },
      models: modelData.map(model => ({
        filename: model.file.name,
        fileType: model.fileType,
        position: model.position,
        rotation: model.rotation,
        scale: model.scale
      }))
    };

    try {
      // Here you would send to your actual endpoint
      console.log('Sending configuration:', configData);
      
      toast({
        title: "Configuration Sent",
        description: `Sent ${modelData.length} model(s) to ${selectedEndpoint}`,
      });
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send configuration to endpoint",
        variant: "destructive"
      });
    }
  };

  const updateModelPosition = (index: number, axis: 'x' | 'y' | 'z', value: number) => {
    setModelData(prev => prev.map((model, i) => {
      if (i === index) {
        const newPosition = [...model.position] as [number, number, number];
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newPosition[axisIndex] = value;
        return { ...model, position: newPosition };
      }
      return model;
    }));
  };

  const updateModelRotation = (index: number, axis: 'x' | 'y' | 'z', value: number) => {
    setModelData(prev => prev.map((model, i) => {
      if (i === index) {
        const newRotation = [...model.rotation] as [number, number, number];
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newRotation[axisIndex] = (value * Math.PI) / 180; // Convert degrees to radians
        return { ...model, rotation: newRotation };
      }
      return model;
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">3D Model Viewer</h3>
          <div className="flex gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              variant="outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Model
            </Button>
            {modelData.length > 0 && selectedEndpoint && (
              <Button
                onClick={handleSendToConfiguration}
                size="sm"
                variant="default"
              >
                <Send className="w-4 h-4 mr-2" />
                Send to Configuration
              </Button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".gltf,.glb,.fbx,.obj,.stl"
          onChange={handleFileUpload}
          className="hidden"
        />

        {modelData.length > 0 && (
          <div className="mb-4 space-y-4">
            <h4 className="text-sm font-medium">Loaded Models:</h4>
            {modelData.map((model, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{model.file.name}</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedModelIndex(selectedModelIndex === index ? null : index)}
                      size="sm"
                      variant={selectedModelIndex === index ? "default" : "outline"}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleRemoveModel(index)}
                      size="sm"
                      variant="ghost"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedModelIndex === index && (
                  <div className="space-y-4 pt-3 border-t">
                    <div>
                      <h5 className="text-sm font-medium mb-3">Position</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">X Position</label>
                          <Slider
                            value={[model.position[0]]}
                            onValueChange={([value]) => updateModelPosition(index, 'x', value)}
                            min={-buildVolumeX/2}
                            max={buildVolumeX/2}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{model.position[0].toFixed(1)}mm</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Y Position</label>
                          <Slider
                            value={[model.position[1]]}
                            onValueChange={([value]) => updateModelPosition(index, 'y', value)}
                            min={0}
                            max={buildVolumeZ}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{model.position[1].toFixed(1)}mm</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Z Position</label>
                          <Slider
                            value={[model.position[2]]}
                            onValueChange={([value]) => updateModelPosition(index, 'z', value)}
                            min={-buildVolumeY/2}
                            max={buildVolumeY/2}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{model.position[2].toFixed(1)}mm</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-3">Rotation</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">X Rotation</label>
                          <Slider
                            value={[(model.rotation[0] * 180) / Math.PI]}
                            onValueChange={([value]) => updateModelRotation(index, 'x', value)}
                            min={-180}
                            max={180}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{((model.rotation[0] * 180) / Math.PI).toFixed(0)}°</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Y Rotation</label>
                          <Slider
                            value={[(model.rotation[1] * 180) / Math.PI]}
                            onValueChange={([value]) => updateModelRotation(index, 'y', value)}
                            min={-180}
                            max={180}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{((model.rotation[1] * 180) / Math.PI).toFixed(0)}°</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Z Rotation</label>
                          <Slider
                            value={[(model.rotation[2] * 180) / Math.PI]}
                            onValueChange={([value]) => updateModelRotation(index, 'z', value)}
                            min={-180}
                            max={180}
                            step={1}
                          />
                          <span className="text-xs text-gray-500">{((model.rotation[2] * 180) / Math.PI).toFixed(0)}°</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="h-96 bg-gray-50 rounded-lg border">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Stage adjustCamera intensity={1} shadows="contact" environment="city">
                {/* Build volume visualization */}
                <BuildVolume sizeX={buildVolumeX} sizeY={buildVolumeY} sizeZ={buildVolumeZ} />
                
                {/* Render all uploaded models */}
                {modelData.map((model, index) => (
                  <ModelRenderer 
                    key={index}
                    url={model.url} 
                    fileType={model.fileType}
                    position={model.position}
                    rotation={model.rotation}
                    scale={model.scale}
                  />
                ))}
              </Stage>
            </Suspense>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>

        <div className="mt-4 text-sm text-gray-600">
          <p>Build Volume: {buildVolumeX}×{buildVolumeY}×{buildVolumeZ}mm</p>
          <p>Supported formats: .gltf, .glb, .fbx, .obj, .stl</p>
          <p>Use mouse to rotate, scroll to zoom, right-click to pan</p>
        </div>
      </Card>
    </div>
  );
};