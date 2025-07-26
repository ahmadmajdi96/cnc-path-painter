import React, { useRef, useState, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, useFBX } from '@react-three/drei';
import { STLLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';
import { useLoader } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Model3DViewerProps {
  buildVolumeX?: number;
  buildVolumeY?: number;
  buildVolumeZ?: number;
}

function ModelRenderer({ url }: { url: string }) {
  try {
    const fileExtension = url.toLowerCase();
    
    // Handle GLTF/GLB files
    if (fileExtension.includes('.gltf') || fileExtension.includes('.glb')) {
      const { scene } = useGLTF(url);
      return <primitive object={scene} />;
    }
    
    // Handle FBX files
    if (fileExtension.includes('.fbx')) {
      const fbx = useFBX(url);
      return <primitive object={fbx} />;
    }
    
    // Handle STL files
    if (fileExtension.includes('.stl')) {
      const geometry = useLoader(STLLoader, url);
      return (
        <mesh>
          <primitive object={geometry} />
          <meshStandardMaterial color="#606060" />
        </mesh>
      );
    }
    
    // Handle OBJ files
    if (fileExtension.includes('.obj')) {
      const obj = useLoader(OBJLoader, url);
      return <primitive object={obj} />;
    }
    
    // Default fallback for unknown formats
    return null;
  } catch (error) {
    console.error('Error loading 3D model:', error);
    return null;
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

export const Model3DViewer = ({ buildVolumeX = 200, buildVolumeY = 200, buildVolumeZ = 200 }: Model3DViewerProps) => {
  const [modelUrls, setModelUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
        setModelUrls(prev => [...prev, url]);
        setUploadedFiles(prev => [...prev, file]);
      });

      toast({
        title: "Files uploaded",
        description: `${validFiles.length} file(s) added to the viewer`,
      });
    }
  }, [toast]);

  const handleRemoveModel = (index: number) => {
    const urlToRevoke = modelUrls[index];
    URL.revokeObjectURL(urlToRevoke);
    
    setModelUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    
    toast({
      title: "Model removed",
      description: "Model has been removed from the viewer",
    });
  };

  const handleClearAll = () => {
    modelUrls.forEach(url => URL.revokeObjectURL(url));
    setModelUrls([]);
    setUploadedFiles([]);
    
    toast({
      title: "All models cleared",
      description: "All models have been removed from the viewer",
    });
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
            {modelUrls.length > 0 && (
              <Button
                onClick={handleClearAll}
                size="sm"
                variant="outline"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
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

        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Loaded Models:</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    onClick={() => handleRemoveModel(index)}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-96 bg-gray-50 rounded-lg border">
          <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Stage adjustCamera intensity={1} shadows="contact" environment="city">
                {/* Build volume visualization */}
                <BuildVolume sizeX={buildVolumeX} sizeY={buildVolumeY} sizeZ={buildVolumeZ} />
                
                {/* Render all uploaded models */}
                {modelUrls.map((url, index) => (
                  <group key={index} position={[index * 50 - (modelUrls.length - 1) * 25, 0, 0]}>
                    <ModelRenderer url={url} />
                  </group>
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