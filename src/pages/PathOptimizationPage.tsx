import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, TrendingDown, Clock } from 'lucide-react';
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
          <CardDescription>AI-generated optimal paths with metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: 'Fastest Route', distance: '12.4 km', time: '18 min', traffic: 'Light', savings: '5 min' },
              { name: 'Shortest Route', distance: '10.8 km', time: '22 min', traffic: 'Moderate', savings: '2.1 km' },
              { name: 'Eco-Friendly', distance: '13.1 km', time: '20 min', traffic: 'Light', savings: '15% fuel' },
            ].map((route, idx) => (
              <div key={idx} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={idx === 0 ? 'default' : 'outline'}>{route.name}</Badge>
                    <Badge variant="secondary">{route.traffic} Traffic</Badge>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Saves {route.savings}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{route.distance}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{route.time}</span>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Dataset Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Dataset Requirements</CardTitle>
          <CardDescription>Training data for path optimization models</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Required Data:</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
              <div>dataset/</div>
              <div>├── road_network/</div>
              <div>│   ├── nodes.csv (intersections)</div>
              <div>│   └── edges.csv (road segments)</div>
              <div>├── traffic_data/</div>
              <div>│   ├── historical_traffic.csv</div>
              <div>│   └── real_time_traffic.csv</div>
              <div>└── routes/</div>
              <div>    └── optimal_routes.json</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Data Format (edges.csv):</h4>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm">
              <div>edge_id,from_node,to_node,distance,speed_limit,avg_traffic</div>
              <div>1,101,102,1.5,50,0.7</div>
              <div>2,102,103,2.3,60,0.5</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Optimization Factors:</h4>
            <div className="flex flex-wrap gap-2">
              {['Distance', 'Time', 'Traffic', 'Fuel Consumption', 'Road Conditions', 'Tolls'].map(factor => (
                <Badge key={factor} variant="outline">{factor}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
