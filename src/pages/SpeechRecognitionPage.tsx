import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Mic, AlertCircle, Copy } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useToast } from '@/hooks/use-toast';
import { useProjectId } from '@/hooks/useProjectId';

const SpeechRecognitionPage = () => {
  const { projectId } = useProjectId();
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transcription copied to clipboard"
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Speech Recognition</h1>
          <p className="text-muted-foreground">Convert speech to text using automatic speech recognition (ASR) with support for multiple languages</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recognition Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Speech to Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload audio file or start live recording</p>
                  <div className="flex gap-2 justify-center">
                    <Button disabled={!selectedModel}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio
                    </Button>
                    <Button variant="outline" disabled={!selectedModel}>
                      <Mic className="w-4 h-4 mr-2" />
                      Live Recording
                    </Button>
                  </div>
                </div>
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select a speech recognition model below</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transcription Results */}
          <Card>
            <CardHeader>
              <CardTitle>Transcription Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500">No transcriptions yet. Upload audio or start recording.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager 
            modelType="speech_recognition"
            title="Speech Recognition"
            description="AI models for automatic speech recognition"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector 
            modelId={selectedModel?.id || null}
            modelType="speech_recognition"
            projectId={projectId}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Word Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">4.2%</div>
              <p className="text-sm text-muted-foreground">Lower is better</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Real-time Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0.3x</div>
              <p className="text-sm text-muted-foreground">Processing speed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hours Transcribed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,847</div>
              <p className="text-sm text-muted-foreground">Total audio processed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">45</div>
              <p className="text-sm text-muted-foreground">Supported languages</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeechRecognitionPage;
