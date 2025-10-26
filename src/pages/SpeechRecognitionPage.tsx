import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Mic, AlertCircle, Copy } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import { useToast } from '@/hooks/use-toast';

const SpeechRecognitionPage = () => {
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
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Speech Recognition</h1>
        <p className="text-muted-foreground">
          Convert speech to text using automatic speech recognition (ASR) with support for multiple languages
        </p>
      </div>

      {/* Recognition Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Speech to Text</CardTitle>
          <CardDescription>Upload audio files or use live microphone for speech recognition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload audio file or start live recording
            </p>
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
          {!selectedModel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Please select an AI model below to start recognition
            </div>
          )}
          {selectedModel && (
            <div className="text-sm text-muted-foreground">
              Using model: <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transcription Results */}
      <Card>
        <CardHeader>
          <CardTitle>Transcription Results</CardTitle>
          <CardDescription>Speech transcriptions will appear here after processing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transcriptions yet. Upload audio or start recording to transcribe speech.</p>
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="speech_recognition"
          title="AI Models"
          description="Select or configure speech recognition models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="speech_recognition"
        />
      </div>


      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Word Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">4.2%</div>
            <p className="text-sm text-muted-foreground mt-1">Lower is better</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Real-time Factor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">0.3x</div>
            <p className="text-sm text-muted-foreground mt-1">Processing speed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hours Transcribed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1,847</div>
            <p className="text-sm text-muted-foreground mt-1">Total audio processed</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpeechRecognitionPage;
