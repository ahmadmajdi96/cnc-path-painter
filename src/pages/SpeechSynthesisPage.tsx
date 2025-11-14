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

interface SpeechSynthesisPageProps {
  projectId?: string;
}

const SpeechSynthesisPage = ({ projectId }: SpeechSynthesisPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([1.0]);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Speech Synthesis</h1>
          <p className="text-muted-foreground">Convert text to natural-sounding speech using text-to-speech (TTS) AI models</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Synthesis Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Text to Speech
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  rows={6}
                  placeholder="Enter the text you want to convert to speech..."
                  defaultValue="Hello, this is a demonstration of text to speech synthesis using artificial intelligence."
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Voice</label>
                    <Select defaultValue="female-1">
                      <SelectTrigger className="mt-1">
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
                  <div>
                    <label className="text-sm font-medium">Language</label>
                    <Select defaultValue="en-us">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-us">English (US)</SelectItem>
                        <SelectItem value="en-uk">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
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
              </div>
              
              {selectedModel ? (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Selected Model:</p>
                  <p className="text-sm text-blue-700">{selectedModel.name}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Please select a speech synthesis model below</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated Audio Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Audio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <Volume2 className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500">Enter text and click "Generate Speech" to create audio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager 
            modelType="speech_synthesis"
            title="Speech Synthesis"
            description="AI models for text-to-speech generation"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector 
            modelId={selectedModel?.id || null}
            modelType="speech_synthesis"
            projectId={projectId}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>MOS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">4.6/5.0</div>
              <p className="text-sm text-muted-foreground">Mean Opinion Score</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Synthesis Speed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">0.2x</div>
              <p className="text-sm text-muted-foreground">Real-time factor</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Audio Generated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">3,245</div>
              <p className="text-sm text-muted-foreground">Total hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">18</div>
              <p className="text-sm text-muted-foreground">Supported languages</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeechSynthesisPage;

