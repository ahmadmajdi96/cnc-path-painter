import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Mic, AlertCircle, UserCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const SpeakerIdentificationPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Speaker Identification</h1>
        <p className="text-muted-foreground">
          Identify speakers by voice using speaker embeddings and voice biometrics
        </p>
      </div>

      {/* Identification Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Speaker Identification</CardTitle>
          <CardDescription>Upload audio files or record live to identify speakers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
            <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Upload audio or start recording for speaker identification
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
              Please select an AI model below to start identification
            </div>
          )}
          {selectedModel && (
            <div className="text-sm text-muted-foreground">
              Using model: <Badge variant="secondary">{selectedModel.name}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Identification Results */}
      <Card>
        <CardHeader>
          <CardTitle>Identification Results</CardTitle>
          <CardDescription>Identified speakers with confidence scores and voice characteristics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: 'SPK001', name: 'John Doe', confidence: 0.96, gender: 'Male', language: 'English', segment: '0:00-0:15' },
              { id: 'SPK002', name: 'Jane Smith', confidence: 0.93, gender: 'Female', language: 'English', segment: '0:15-0:28' },
              { id: 'SPK003', name: 'Robert Johnson', confidence: 0.89, gender: 'Male', language: 'English', segment: '0:28-0:42' },
            ].map((speaker) => (
              <div key={speaker.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <UserCircle className="w-10 h-10 text-muted-foreground" />
                    <div>
                      <div className="font-semibold">{speaker.name}</div>
                      <div className="text-sm text-muted-foreground">ID: {speaker.id}</div>
                    </div>
                  </div>
                  <Badge variant="default">{(speaker.confidence * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{speaker.gender}</Badge>
                  <Badge variant="outline">{speaker.language}</Badge>
                  <Badge variant="secondary">Segment: {speaker.segment}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Speakers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Enrolled Speakers</CardTitle>
              <CardDescription>Registered voice profiles in the database</CardDescription>
            </div>
            <Button size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Enroll New Speaker
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { id: 'SPK001', name: 'John Doe', samples: 15 },
              { id: 'SPK002', name: 'Jane Smith', samples: 12 },
              { id: 'SPK003', name: 'Robert Johnson', samples: 18 },
              { id: 'SPK004', name: 'Emily Davis', samples: 14 },
              { id: 'SPK005', name: 'Michael Wilson', samples: 20 },
              { id: 'SPK006', name: 'Sarah Brown', samples: 16 },
            ].map((speaker) => (
              <div key={speaker.id} className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <UserCircle className="w-8 h-8 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{speaker.name}</div>
                    <div className="text-xs text-muted-foreground">{speaker.id}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">{speaker.samples} samples</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="speaker_identification"
          title="AI Models"
          description="Select or configure speaker identification models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="speaker_identification"
        />
      </div>

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>Speaker audio samples for voice embedding training</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Structure:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── speaker_001/</div>
              <div>│   ├── utterance_001.wav</div>
              <div>│   ├── utterance_002.wav</div>
              <div>│   └── ...</div>
              <div>├── speaker_002/</div>
              <div>│   └── ...</div>
              <div>└── metadata.json</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Metadata Format:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>{'{'}</div>
              <div>  "speaker_001": {'{'}</div>
              <div>    "name": "John Doe",</div>
              <div>    "gender": "male",</div>
              <div>    "age": 35,</div>
              <div>    "num_samples": 50</div>
              <div>  {'}'}</div>
              <div>{'}'}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Audio Requirements:</h4>
            <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
              <div><span className="font-medium">Samples per Speaker:</span> Minimum 10-20 utterances</div>
              <div><span className="font-medium">Duration:</span> 3-10 seconds per sample</div>
              <div><span className="font-medium">Sample Rate:</span> 16kHz</div>
              <div><span className="font-medium">Format:</span> WAV, FLAC</div>
              <div><span className="font-medium">Quality:</span> Clean speech, minimal noise</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Feature Extraction:</h4>
            <div className="flex flex-wrap gap-2">
              {['MFCC', 'i-vectors', 'x-vectors', 'd-vectors', 'Speaker Embeddings'].map(feature => (
                <Badge key={feature} variant="outline">{feature}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identification Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">97.8%</div>
            <p className="text-sm text-muted-foreground mt-1">Correct identification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">EER</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">2.1%</div>
            <p className="text-sm text-muted-foreground mt-1">Equal Error Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrolled Speakers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">248</div>
            <p className="text-sm text-muted-foreground mt-1">Voice profiles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">120ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per identification</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SpeakerIdentificationPage;
