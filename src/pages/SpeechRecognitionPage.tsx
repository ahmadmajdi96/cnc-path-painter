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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transcription Results</CardTitle>
              <CardDescription>Recognized text with confidence scores and timestamps</CardDescription>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => copyToClipboard("The quick brown fox jumps over the lazy dog.")}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            rows={6}
            readOnly
            value="The quick brown fox jumps over the lazy dog. This is a sample transcription that would appear after audio processing."
            className="font-mono"
          />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Segments with Timestamps:</h4>
            {[
              { text: 'The quick brown fox', time: '0:00-0:02', confidence: 0.98 },
              { text: 'jumps over the lazy dog', time: '0:02-0:04', confidence: 0.96 },
              { text: 'This is a sample transcription', time: '0:05-0:07', confidence: 0.94 },
            ].map((segment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="text-sm">{segment.text}</div>
                  <div className="text-xs text-muted-foreground mt-1">{segment.time}</div>
                </div>
                <Badge variant="secondary">{(segment.confidence * 100).toFixed(1)}%</Badge>
              </div>
            ))}
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

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>Audio files with text transcriptions for ASR training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── audio/</div>
              <div>│   ├── train/</div>
              <div>│   │   ├── speaker_001.wav</div>
              <div>│   │   └── ...</div>
              <div>│   └── val/</div>
              <div>└── transcripts/</div>
              <div>    └── transcripts.csv</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Annotation Format:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div># filename, transcription, duration</div>
              <div>speaker_001.wav,"Hello world",2.5</div>
              <div>speaker_002.wav,"How are you",1.8</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Audio Specifications:</h4>
            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <div><span className="font-medium">Format:</span> WAV, FLAC, MP3</div>
              <div><span className="font-medium">Sample Rate:</span> 16kHz or 48kHz</div>
              <div><span className="font-medium">Channels:</span> Mono preferred</div>
              <div><span className="font-medium">Bit Depth:</span> 16-bit or 24-bit</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Preprocessing:</h4>
            <div className="flex flex-wrap gap-2">
              {['Noise Reduction', 'Normalization', 'Silence Removal', 'Resampling', 'MFCC Features'].map(process => (
                <Badge key={process} variant="outline">{process}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
