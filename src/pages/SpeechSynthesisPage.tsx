import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Download, AlertCircle, Volume2 } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const SpeechSynthesisPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Speech Synthesis</h1>
        <p className="text-muted-foreground">
          Convert text to natural-sounding speech using text-to-speech (TTS) AI models
        </p>
      </div>

      {/* Synthesis Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Text to Speech</CardTitle>
          <CardDescription>Enter text and configure voice parameters for speech synthesis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Text Input</label>
            <Textarea 
              rows={6}
              placeholder="Enter the text you want to convert to speech..."
              defaultValue="Hello, this is a demonstration of text to speech synthesis using artificial intelligence."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Voice</label>
              <Select defaultValue="female-1">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female-1">Female Voice 1 (US)</SelectItem>
                  <SelectItem value="male-1">Male Voice 1 (US)</SelectItem>
                  <SelectItem value="female-2">Female Voice 2 (UK)</SelectItem>
                  <SelectItem value="male-2">Male Voice 2 (UK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select defaultValue="en-us">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-us">English (US)</SelectItem>
                  <SelectItem value="en-uk">English (UK)</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Speed</label>
                <span className="text-sm text-muted-foreground">{speed[0].toFixed(1)}x</span>
              </div>
              <Slider 
                value={speed}
                onValueChange={setSpeed}
                min={0.5}
                max={2.0}
                step={0.1}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">Pitch</label>
                <span className="text-sm text-muted-foreground">{pitch[0].toFixed(1)}x</span>
              </div>
              <Slider 
                value={pitch}
                onValueChange={setPitch}
                min={0.5}
                max={2.0}
                step={0.1}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button disabled={!selectedModel}>
              <Play className="w-4 h-4 mr-2" />
              Generate Speech
            </Button>
            <Button variant="outline" disabled={!selectedModel}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {!selectedModel && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              Please select an AI model below to start synthesis
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Audio Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Audio</CardTitle>
          <CardDescription>Listen to or download the synthesized speech</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Volume2 className="w-8 h-8 text-muted-foreground" />
              <div className="flex-1">
                <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-primary rounded-full" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0:02</span>
                  <span>0:06</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Play className="w-4 h-4 mr-2" />
                Play
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download MP3
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="speech_synthesis"
          title="AI Models"
          description="Select or configure speech synthesis models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="speech_synthesis"
        />
      </div>


      {/* Performance Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">MOS Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">4.6/5.0</div>
            <p className="text-sm text-muted-foreground mt-1">Mean Opinion Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Synthesis Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">0.2x</div>
            <p className="text-sm text-muted-foreground mt-1">Real-time factor</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Audio Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">3,245</div>
            <p className="text-sm text-muted-foreground mt-1">Total hours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpeechSynthesisPage;
