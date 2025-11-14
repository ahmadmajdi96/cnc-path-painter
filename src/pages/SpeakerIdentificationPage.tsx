import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Mic, AlertCircle, UserCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

interface SpeakerIdentificationPageProps {
  projectId?: string;
}

const SpeakerIdentificationPage = ({ projectId }: SpeakerIdentificationPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Speaker Identification</h1>
          <p className="text-muted-foreground">Identify speakers by voice using speaker embeddings and voice biometrics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Identification Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Speaker Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Mic className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Upload audio or record speaker's voice</p>
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
                  <p className="text-sm text-orange-700">Please select a speaker identification model below</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Identification Results */}
          <Card>
            <CardHeader>
              <CardTitle>Identification Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <UserCircle className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                  <p className="text-gray-500">Upload audio or record voice to identify speaker</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Model and Dataset Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AIModelManager 
            modelType="speaker_identification"
            title="Speaker Identification"
            description="AI models for voice biometrics and speaker recognition"
            onModelSelect={setSelectedModel}
            selectedModelId={selectedModel?.id}
            projectId={projectId}
          />
          <AIModelDatasetSelector 
            modelId={selectedModel?.id || null}
            modelType="speaker_identification"
            projectId={projectId}
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Identification Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">97.8%</div>
              <p className="text-sm text-muted-foreground">Correct identification</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>EER</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">2.1%</div>
              <p className="text-sm text-muted-foreground">Equal Error Rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Speakers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">248</div>
              <p className="text-sm text-muted-foreground">Voice profiles</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Processing Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">120ms</div>
              <p className="text-sm text-muted-foreground">Per identification</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SpeakerIdentificationPage;
