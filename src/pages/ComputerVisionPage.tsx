
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Eye, Upload, Settings, Play, Image } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { useAIModelProcessor } from '@/hooks/useAIModelProcessor';
import { useToast } from '@/hooks/use-toast';

const ComputerVisionPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const { processWithModel, isProcessing, result } = useAIModelProcessor();
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!imageUrl) {
      toast({
        title: "No image uploaded",
        description: "Please upload an image first",
        variant: "destructive"
      });
      return;
    }

    try {
      await processWithModel(selectedModel?.id, 'computer_vision', {
        image: imageUrl,
        prompt: customPrompt || 'Analyze this image for objects, scenes, and activities. Provide detailed descriptions.'
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Computer Vision</h1>
          <p className="text-gray-600">Analyze and process images with AI-powered computer vision models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Image Processing Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Image Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {imageUrl ? (
                  <div className="border rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="Uploaded" className="w-full h-48 object-cover" />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload image for computer vision analysis</p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                  </label>
                  <Button 
                    onClick={handleAnalyzeImage}
                    disabled={!selectedModel || !imageUrl || isProcessing}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>

                <Textarea
                  placeholder="Optional: Add custom analysis prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select a computer vision model to start analyzing images</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card>
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Processing image...</span>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Analysis Complete</h4>
                    <p className="text-sm text-green-800">{result.result}</p>
                  </div>
                  {result.confidence && (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">Confidence Score</span>
                      <Badge variant="default">{(result.confidence * 100).toFixed(1)}%</Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Processing Time</span>
                    <span className="text-sm text-gray-600">
                      {result.processing_time ? `${Date.now() - result.processing_time}ms` : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Upload an image and click "Analyze" to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Model Manager */}
        <AIModelManager
          modelType="computer_vision"
          title="Computer Vision"
          description="AI models for image analysis and object detection"
          onModelSelect={setSelectedModel}
          selectedModelId={selectedModel?.id}
        />

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detection Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">94.2%</div>
              <p className="text-sm text-gray-500">Overall detection accuracy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Images Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">2,847</div>
              <p className="text-sm text-gray-500">In the last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">0.8s</div>
              <p className="text-sm text-gray-500">Average processing time</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComputerVisionPage;
