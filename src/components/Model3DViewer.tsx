
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
import { Upload, Trash2, Send, Settings, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Type definition for stored model data
interface StoredModelData {
  filename: string;
  fileType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  storagePath: string;
}

function STLModel({ url }: { url: string }) {
  try {
    const geometry = useLoader(STLLoader, url);
    return (
      <mesh>
        <primitive object={geometry} />
        <meshStandardMaterial color="#8B5CF6" />
      </mesh>
    );
  } catch (error) {
    console.error('STL loading error:', error);
    return null;
  }
}

function OBJModel({ url }: { url: string }) {
  try {
    const obj = useLoader(OBJLoader, url);
    return <primitive object={obj} />;
  } catch (error) {
    console.error('OBJ loading error:', error);
    return null;
  }
}

// Error boundary wrapper for model loading
function ModelErrorBoundary({ children, fallback }: { children: React.ReactNode, fallback: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  
  React.useEffect(() => {
    setHasError(false);
  }, [children]);
  
  if (hasError) {
    return <>{fallback}</>;
  }
  
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('Model loading error:', error);
    setHasError(true);
    return <>{fallback}</>;
  }
}

function SafeModelRenderer({
  url,
  fileType,
  position,
  rotation,
  scale
}: {
  url: string;
  fileType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const fallbackMesh = (
    <mesh>
      <boxGeometry args={[10, 10, 10]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );

  if (!url) {
    return <group position={position} rotation={rotation} scale={scale}>
        <mesh>
          <boxGeometry args={[10, 5, 10]} />
          <meshStandardMaterial color="#94a3b8" opacity={0.7} transparent />
        </mesh>
        <mesh position={[0, 3, 0]}>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>;
  }

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <ModelErrorBoundary fallback={fallbackMesh}>
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[5, 5, 5]} />
            <meshStandardMaterial color="#6b7280" />
          </mesh>
        }>
          {/* Handle GLTF/GLB files */}
          {(fileType === 'gltf' || fileType === 'glb') && (() => {
            const { scene } = useGLTF(url);
            return <primitive object={scene} />;
          })()}
          
          {/* Handle FBX files */}
          {fileType === 'fbx' && (() => {
            const fbx = useFBX(url);
            return <primitive object={fbx} />;
          })()}
          
          {/* Handle STL files */}
          {fileType === 'stl' && <STLModel url={url} />}
          
          {/* Handle OBJ files */}
          {fileType === 'obj' && <OBJModel url={url} />}
          
          {/* Default fallback for unknown types */}
          {!['gltf', 'glb', 'fbx', 'stl', 'obj'].includes(fileType) && fallbackMesh}
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

function ModelRenderer(props: {
  url: string;
  fileType: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <Suspense fallback={
      <group position={props.position} rotation={props.rotation} scale={props.scale}>
        <mesh>
          <boxGeometry args={[5, 5, 5]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
      </group>
    }>
      <SafeModelRenderer {...props} />
    </Suspense>
  );
}

function BuildVolume({
  sizeX = 200,
  sizeY = 200,
  sizeZ = 200
}: {
  sizeX?: number;
  sizeY?: number;
  sizeZ?: number;
}) {
  return <mesh position={[0, sizeZ / 2, 0]}>
      <boxGeometry args={[sizeX, sizeZ, sizeY]} />
      <meshBasicMaterial wireframe color="#6366f1" opacity={0.3} transparent />
    </mesh>;
}

interface Model3DViewerProps {
  buildVolumeX?: number;
  buildVolumeY?: number;
  buildVolumeZ?: number;
  selectedMachineId?: string;
  selectedEndpoint?: string;
  printParams?: any;
}

export const Model3DViewer = ({
  buildVolumeX = 200,
  buildVolumeY = 200,
  buildVolumeZ = 200,
  selectedMachineId,
  selectedEndpoint,
  printParams
}: Model3DViewerProps) => {
  const [modelData, setModelData] = useState<Array<{
    url: string;
    file: File;
    fileType: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    storagePath?: string;
  }>>([]);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Type guard function to check if an object is StoredModelData
  const isStoredModelData = (obj: any): obj is StoredModelData => {
    return obj && 
           typeof obj === 'object' && 
           typeof obj.filename === 'string' &&
           typeof obj.fileType === 'string' &&
           Array.isArray(obj.position) &&
           Array.isArray(obj.rotation) &&
           Array.isArray(obj.scale) &&
           typeof obj.storagePath === 'string';
  };

  // Load configuration on mount
  useEffect(() => {
    const loadConfiguration = async () => {
      if (!selectedMachineId) {
        setModelData([]);
        return;
      }

      setModelData([]);
      
      try {
        const { data, error } = await supabase
          .from('printer_3d_configurations')
          .select('*')
          .eq('printer_id', selectedMachineId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading configuration:', error);
          return;
        }

        if (data && data.models_with_files) {
          // Type check and filter valid stored models
          const rawModels = Array.isArray(data.models_with_files) ? data.models_with_files : [];
          const savedModels = (rawModels.filter(isStoredModelData) as unknown) as StoredModelData[];
          
          // Load actual models from storage
          const loadedModels = [];
          for (const model of savedModels) {
            if (model.storagePath) {
              const { data: publicUrl } = supabase.storage
                .from('3d-models')
                .getPublicUrl(model.storagePath);
                
              if (publicUrl.publicUrl) {
                // Create a fake File object for display purposes
                const fakeFile = new File([''], model.filename, { type: 'application/octet-stream' });
                
                loadedModels.push({
                  url: publicUrl.publicUrl,
                  file: fakeFile,
                  fileType: model.fileType,
                  position: model.position,
                  rotation: model.rotation,
                  scale: model.scale,
                  storagePath: model.storagePath
                });
              }
            }
          }
          
          setModelData(loadedModels);
          
          if (loadedModels.length > 0) {
            toast({
              title: "Configuration Loaded",
              description: `Loaded ${loadedModels.length} model(s) from previous session.`
            });
          }
        }
      } catch (error) {
        console.error('Error loading configuration:', error);
      }
    };
    loadConfiguration();
  }, [selectedMachineId, toast]);

  // Upload file to Supabase Storage
  const uploadFileToStorage = async (file: File): Promise<string | null> => {
    const fileName = `${selectedMachineId}/${Date.now()}-${file.name}`;
    
    try {
      const { data, error } = await supabase.storage
        .from('3d-models')
        .upload(fileName, file);
        
      if (error) {
        console.error('Storage upload error:', error);
        return null;
      }
      
      return data.path;
    } catch (error) {
      console.error('Storage upload error:', error);
      return null;
    }
  };

  // Save configuration whenever data changes
  useEffect(() => {
    const saveConfiguration = async () => {
      if (!selectedMachineId || modelData.length === 0) return;
      
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
        })),
        models_with_files: modelData.map(model => ({
          filename: model.file.name,
          fileType: model.fileType,
          position: model.position,
          rotation: model.rotation,
          scale: model.scale,
          storagePath: model.storagePath
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
        }
      } catch (error) {
        console.error('Error saving configuration:', error);
      }
    };
    
    const timeoutId = setTimeout(saveConfiguration, 1000);
    return () => clearTimeout(timeoutId);
  }, [selectedMachineId, selectedEndpoint, buildVolumeX, buildVolumeY, buildVolumeZ, modelData]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    
    const newFiles = Array.from(files);
    
    // File validation with size check
    const validFiles = newFiles.filter(file => {
      const extension = file.name.toLowerCase();
      const isValidType = extension.endsWith('.gltf') || extension.endsWith('.glb') || extension.endsWith('.fbx') || extension.endsWith('.obj') || extension.endsWith('.stl');
      
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum size is 100MB.`,
          variant: "destructive"
        });
        return false;
      }
      
      return isValidType;
    });
    
    if (validFiles.length !== newFiles.length) {
      const invalidFiles = newFiles.filter(file => {
        const extension = file.name.toLowerCase();
        return !(extension.endsWith('.gltf') || extension.endsWith('.glb') || extension.endsWith('.fbx') || extension.endsWith('.obj') || extension.endsWith('.stl'));
      });
      
      if (invalidFiles.length > 0) {
        toast({
          title: "Invalid file format",
          description: "Please upload .gltf, .glb, .fbx, .obj, or .stl files only",
          variant: "destructive"
        });
      }
    }
    
    if (validFiles.length > 0) {
      setIsUploading(true);
      
      for (const file of validFiles) {
        try {
          // Upload to storage first
          const storagePath = await uploadFileToStorage(file);
          
          if (storagePath) {
            // Get the public URL
            const { data: publicUrl } = supabase.storage
              .from('3d-models')
              .getPublicUrl(storagePath);
              
            if (publicUrl.publicUrl) {
              const fileType = file.name.split('.').pop()?.toLowerCase() || '';
              setModelData(prev => [...prev, {
                url: publicUrl.publicUrl,
                file,
                fileType,
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                storagePath
              }]);
            }
          } else {
            toast({
              title: "Upload failed",
              description: `Could not upload ${file.name}`,
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error('Error processing file:', file.name, error);
          toast({
            title: "File processing error",
            description: `Could not process ${file.name}`,
            variant: "destructive"
          });
        }
      }
      
      setIsUploading(false);
      
      if (validFiles.length > 0) {
        toast({
          title: "Files uploaded",
          description: `${validFiles.length} file(s) uploaded and saved to storage`
        });
      }
    }
  }, [toast, selectedMachineId]);

  const handleRemoveModel = async (index: number) => {
    const modelToRemove = modelData[index];
    if (modelToRemove) {
      // Clean up local URL if it exists
      if (modelToRemove.url && modelToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(modelToRemove.url);
      }
      
      // Remove from storage if it has a storage path
      if (modelToRemove.storagePath) {
        try {
          const { error } = await supabase.storage
            .from('3d-models')
            .remove([modelToRemove.storagePath]);
            
          if (error) {
            console.error('Error removing from storage:', error);
          }
        } catch (error) {
          console.error('Error removing from storage:', error);
        }
      }
    }
    
    setModelData(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Model removed",
      description: "Model has been removed and deleted from storage"
    });
  };

  const downloadModels = () => {
    if (modelData.length === 0) {
      toast({
        title: "No models to download",
        description: "Upload some models first",
        variant: "destructive"
      });
      return;
    }

    modelData.forEach((model, index) => {
      const link = document.createElement('a');
      link.href = model.url;
      link.download = model.file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: "Models downloaded",
      description: `Downloaded ${modelData.length} model file(s)`
    });
  };

  const generateGCode = () => {
    if (modelData.length === 0) return '';

    let gcode = `; Generated 3D Printer G-Code\n`;
    gcode += `; Printer: ${selectedMachineId || 'Unknown'}\n`;
    gcode += `; Date: ${new Date().toISOString()}\n`;
    gcode += `; Models: ${modelData.length}\n`;
    gcode += 'G21 ; Set units to millimeters\n';
    gcode += 'G90 ; Absolute positioning\n';
    gcode += `M104 S${printParams?.printTemperature || 200} ; Set hotend temperature\n`;
    gcode += `M140 S${printParams?.bedTemperature || 60} ; Set bed temperature\n`;
    gcode += 'M190 ; Wait for bed temperature\n';
    gcode += 'M109 ; Wait for hotend temperature\n';
    gcode += 'G28 ; Home all axes\n';
    gcode += 'G1 Z15.0 F6000 ; Move platform down\n';
    
    // Add model positions as comments for reference
    modelData.forEach((model, index) => {
      const x = typeof model.position[0] === 'number' ? model.position[0] : 0;
      const y = typeof model.position[1] === 'number' ? model.position[1] : 0;
      const z = typeof model.position[2] === 'number' ? model.position[2] : 0;
      gcode += `; Model ${index + 1}: ${model.file.name} at X${x.toFixed(3)} Y${y.toFixed(3)} Z${z.toFixed(3)}\n`;
    });

    gcode += '; [SLICING REQUIRED - Models need to be processed by slicer]\n';
    gcode += 'M104 S0 ; Turn off hotend\n';
    gcode += 'M140 S0 ; Turn off bed\n';
    gcode += 'G28 X0 ; Home X axis\n';
    gcode += 'M84 ; Disable steppers\n';

    return gcode;
  };

  const downloadGCode = () => {
    const gcode = generateGCode();
    const blob = new Blob([gcode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `3d-print-${Date.now()}.gcode`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendModelToEndpoint = async () => {
    if (!selectedEndpoint || modelData.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select an endpoint and upload models first",
        variant: "destructive"
      });
      return;
    }

    const payload = {
      type: 'model',
      models: modelData.map(model => ({
        filename: model.file.name,
        fileType: model.fileType,
        position: model.position.map(p => (typeof p === 'number' ? p : 0).toFixed(3)),
        rotation: model.rotation.map(r => (typeof r === 'number' ? r : 0).toFixed(3)),
        scale: model.scale.map(s => (typeof s === 'number' ? s : 1).toFixed(3))
      })),
      buildVolume: {
        x: buildVolumeX,
        y: buildVolumeY,
        z: buildVolumeZ
      },
      machine_id: selectedMachineId,
      timestamp: new Date().toISOString()
    };

    try {
      toast({
        title: "Sending Model...",
        description: `Please wait while we send your 3D models`,
      });

      const response = await fetch(selectedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast({
          title: "✅ Model Sent Successfully",
          description: `${modelData.length} model(s) sent to ${new URL(selectedEndpoint).hostname}`,
        });
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      toast({
        title: "❌ Model Send Failed",
        description: `Failed to send model: ${error instanceof Error ? error.message : 'Network error occurred'}`,
        variant: "destructive"
      });
    }
  };

  const sendConfigurationToEndpoint = async () => {
    if (!selectedEndpoint || !selectedMachineId) {
      toast({
        title: "Missing Information",
        description: "Please select both a machine and an endpoint first",
        variant: "destructive"
      });
      return;
    }

    const gcode = generateGCode();
    const payload = {
      type: 'configuration',
      gcode,
      parameters: printParams || {
        layerHeight: 0.2,
        printSpeed: 50,
        infillDensity: 20,
        printTemperature: 200,
        bedTemperature: 60,
        filamentType: 'PLA'
      },
      models: modelData.map(model => ({
        filename: model.file.name,
        fileType: model.fileType,
        position: model.position.map(p => (typeof p === 'number' ? p : 0).toFixed(3)),
        rotation: model.rotation.map(r => (typeof r === 'number' ? r : 0).toFixed(3)),
        scale: model.scale.map(s => (typeof s === 'number' ? s : 1).toFixed(3))
      })),
      buildVolume: {
        x: buildVolumeX,
        y: buildVolumeY,
        z: buildVolumeZ
      },
      machine_id: selectedMachineId,
      machine_type: '3d_printer',
      timestamp: new Date().toISOString()
    };

    try {
      toast({
        title: "Sending Configuration...",
        description: `Please wait while we send your 3D printer configuration`,
      });

      const response = await fetch(selectedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        toast({
          title: "✅ Configuration Sent Successfully",
          description: `3D printer configuration with ${modelData.length} model(s) sent to ${new URL(selectedEndpoint).hostname}`,
        });
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      toast({
        title: "❌ Configuration Send Failed",
        description: `Failed to send configuration: ${error instanceof Error ? error.message : 'Network error occurred'}`,
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
        return {
          ...model,
          position: newPosition
        };
      }
      return model;
    }));
  };

  const updateModelRotation = (index: number, axis: 'x' | 'y' | 'z', value: number) => {
    setModelData(prev => prev.map((model, i) => {
      if (i === index) {
        const newRotation = [...model.rotation] as [number, number, number];
        const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
        newRotation[axisIndex] = value * Math.PI / 180; // Convert degrees to radians
        return {
          ...model,
          rotation: newRotation
        };
      }
      return model;
    }));
  };

  return <div className="space-y-4">
      <Card className="p-4 py-[59px]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3">3D Model Viewer</h3>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => fileInputRef.current?.click()} size="sm" variant="outline" disabled={isUploading}>
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? "Uploading..." : "Upload Model"}
            </Button>
            {modelData.length > 0 && (
              <>
                <Button
                  onClick={downloadModels}
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Models
                </Button>
                <Button
                  onClick={downloadGCode}
                  size="sm"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download G-Code
                </Button>
                <Button
                  onClick={sendModelToEndpoint}
                  disabled={!selectedEndpoint}
                  size="sm"
                  variant="outline"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Model
                </Button>
                <Button
                  onClick={sendConfigurationToEndpoint}
                  disabled={!selectedEndpoint || !selectedMachineId}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Send Configuration
                </Button>
              </>
            )}
          </div>
        </div>

        <input ref={fileInputRef} type="file" multiple accept=".gltf,.glb,.fbx,.obj,.stl" onChange={handleFileUpload} className="hidden" />

        {/* Show configuration status */}
        {modelData.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Configuration Status:</span>
              <div className="flex items-center gap-2">
                <span className={selectedMachineId ? "text-green-600" : "text-orange-600"}>
                  Machine: {selectedMachineId ? "Selected" : "Not Selected"}
                </span>
                <span>•</span>
                <span className={selectedEndpoint ? "text-green-600" : "text-orange-600"}>
                  Endpoint: {selectedEndpoint ? "Selected" : "Not Selected"}
                </span>
              </div>
            </div>
          </div>
        )}

        {modelData.length > 0 && <div className="mb-4 space-y-4">
            <h4 className="text-sm font-medium">Loaded Models:</h4>
            {modelData.map((model, index) => <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{model.file.name}</span>
                  <div className="flex gap-2">
                    <Button onClick={() => setSelectedModelIndex(selectedModelIndex === index ? null : index)} size="sm" variant={selectedModelIndex === index ? "default" : "outline"}>
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleRemoveModel(index)} size="sm" variant="ghost">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedModelIndex === index && <div className="space-y-4 pt-3 border-t">
                    <div>
                      <h5 className="text-sm font-medium mb-3">Position</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">X Position</label>
                          <Slider value={[model.position[0]]} onValueChange={([value]) => updateModelPosition(index, 'x', value)} min={-buildVolumeX / 2} max={buildVolumeX / 2} step={1} />
                          <span className="text-xs text-gray-500">{model.position[0].toFixed(1)}mm</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Y Position</label>
                          <Slider value={[model.position[1]]} onValueChange={([value]) => updateModelPosition(index, 'y', value)} min={0} max={buildVolumeZ} step={1} />
                          <span className="text-xs text-gray-500">{model.position[1].toFixed(1)}mm</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Z Position</label>
                          <Slider value={[model.position[2]]} onValueChange={([value]) => updateModelPosition(index, 'z', value)} min={-buildVolumeY / 2} max={buildVolumeY / 2} step={1} />
                          <span className="text-xs text-gray-500">{model.position[2].toFixed(1)}mm</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-3">Rotation</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium">X Rotation</label>
                          <Slider value={[model.rotation[0] * 180 / Math.PI]} onValueChange={([value]) => updateModelRotation(index, 'x', value)} min={-180} max={180} step={1} />
                          <span className="text-xs text-gray-500">{(model.rotation[0] * 180 / Math.PI).toFixed(0)}°</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Y Rotation</label>
                          <Slider value={[model.rotation[1] * 180 / Math.PI]} onValueChange={([value]) => updateModelRotation(index, 'y', value)} min={-180} max={180} step={1} />
                          <span className="text-xs text-gray-500">{(model.rotation[1] * 180 / Math.PI).toFixed(0)}°</span>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium">Z Rotation</label>
                          <Slider value={[model.rotation[2] * 180 / Math.PI]} onValueChange={([value]) => updateModelRotation(index, 'z', value)} min={-180} max={180} step={1} />
                          <span className="text-xs text-gray-500">{(model.rotation[2] * 180 / Math.PI).toFixed(0)}°</span>
                        </div>
                      </div>
                    </div>
                  </div>}
              </div>)}
          </div>}

        <div className="h-96 bg-gray-50 rounded-lg border">
          <Canvas 
            camera={{
              position: [5, 5, 5],
              fov: 50
            }}
            onError={(error) => {
              console.error('Canvas error:', error);
              toast({
                title: "3D Viewer Error",
                description: "Failed to render 3D models. Please try reloading or use smaller files.",
                variant: "destructive"
              });
            }}
          >
            <Suspense fallback={null}>
              <Stage adjustCamera intensity={1} shadows="contact" environment="city">
                {/* Build volume visualization */}
                <BuildVolume sizeX={buildVolumeX} sizeY={buildVolumeY} sizeZ={buildVolumeZ} />
                
                {/* Render all uploaded models */}
                {modelData.map((model, index) => <ModelRenderer key={index} url={model.url} fileType={model.fileType} position={model.position} rotation={model.rotation} scale={model.scale} />)}
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
    </div>;
};
