import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, TrendingDown, Clock, AlertCircle } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';

const PathOptimizationPage = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Path Optimization</h1>
        <p className="text-muted-foreground">
          Optimize vehicle routing and paths using AI-powered algorithms for traffic flow and efficiency
        </p>
      </div>

      {/* Route Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Route Planning</CardTitle>
          <CardDescription>Configure start and end points for optimal path calculation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Location</label>
              <Input placeholder="Enter start address or coordinates" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Location</label>
              <Input placeholder="Enter destination address or coordinates" />
            </div>
          </div>
          <div className="flex gap-2">
            <Button disabled={!selectedModel}>
              <Navigation className="w-4 h-4 mr-2" />
              Calculate Optimal Route
            </Button>
            <Button variant="outline" disabled={!selectedModel}>
              Add Waypoint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Optimized Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Optimized Routes</CardTitle>
          <CardDescription>Route optimization results will appear here after calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No routes calculated yet. Enter start and end locations to generate optimal routes.</p>
          </div>
        </CardContent>
      </Card>

      {/* Model and Dataset Management */}
      <div className="grid md:grid-cols-2 gap-6">
        <AIModelManager 
          modelType="path_optimization"
          title="AI Models"
          description="Select or configure path optimization models"
          onModelSelect={setSelectedModel}
        />
        <AIModelDatasetSelector 
          modelId={selectedModel?.id || null}
          modelType="path_optimization"
        />
      </div>


      {/* Performance Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Routes Optimized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">1,847</div>
            <p className="text-sm text-muted-foreground mt-1">Total optimizations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">8.5 min</div>
            <p className="text-sm text-muted-foreground mt-1">Per route</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distance Reduced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">12.3%</div>
            <p className="text-sm text-muted-foreground mt-1">Average reduction</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Computation Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">180ms</div>
            <p className="text-sm text-muted-foreground mt-1">Per route calculation</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PathOptimizationPage;
