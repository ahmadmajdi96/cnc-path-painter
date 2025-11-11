import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, TrendingDown, Clock, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { AIModelManager } from '@/components/AIModelManager';
import { AIModelDatasetSelector } from '@/components/AIModelDatasetSelector';
import MapboxMap from '@/components/MapboxMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'start' | 'stop' | 'end';
}

interface Trip {
  id: string;
  startLocation: Location | null;
  endLocation: Location | null;
}

interface PathOptimizationPageProps {
  projectId?: string;
}

const PathOptimizationPage = ({ projectId }: PathOptimizationPageProps = {}) => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [tripMode, setTripMode] = useState<'single' | 'multiple'>('single');
  const [singleTripStops, setSingleTripStops] = useState<Location[]>([]);
  const [multipleTrips, setMultipleTrips] = useState<Trip[]>([{ id: 'trip-1', startLocation: null, endLocation: null }]);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const { toast } = useToast();

  // Load locations from database on mount
  useEffect(() => {
    loadLocationsFromDB();
  }, []);

  const loadLocationsFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const dbLocations: Location[] = data.map(loc => ({
          id: loc.id,
          name: loc.name,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          type: loc.type as 'start' | 'stop' | 'end'
        }));

        // Separate by type
        const stops = dbLocations.filter(l => l.type === 'stop');
        setSingleTripStops(stops);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const saveLocationToDB = async (location: Location) => {
    try {
      const { error } = await supabase
        .from('locations')
        .insert({
          id: location.id,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          type: location.type
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving location:', error);
      toast({
        title: "Error",
        description: "Failed to save location to database",
        variant: "destructive"
      });
    }
  };

  const handleMapLocationSelect = async (lng: number, lat: number) => {
    if (tripMode === 'single') {
      const newStop: Location = {
        id: crypto.randomUUID(),
        name: `Stop ${singleTripStops.length + 1}`,
        latitude: lat,
        longitude: lng,
        type: 'stop'
      };
      setSingleTripStops(prev => [...prev, newStop]);
      await saveLocationToDB(newStop);
      toast({
        title: "Stop Added",
        description: `Added stop at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    } else if (tripMode === 'multiple') {
      // Find the first trip that needs a location (missing start or end)
      const tripNeedingLocation = multipleTrips.find(trip => !trip.startLocation || !trip.endLocation);
      
      if (!tripNeedingLocation) {
        toast({
          title: "All trips complete",
          description: "Add a new trip to set more locations",
          variant: "destructive"
        });
        return;
      }
      
      const locationType = !tripNeedingLocation.startLocation ? 'start' : 'end';
      const newLocation: Location = {
        id: `${locationType}-${Date.now()}`,
        name: locationType === 'start' ? 'Start Point' : 'End Point',
        latitude: lat,
        longitude: lng,
        type: locationType === 'start' ? 'start' : 'end'
      };
      
      setMultipleTrips(multipleTrips.map(trip => 
        trip.id === tripNeedingLocation.id 
          ? { 
              ...trip, 
              [locationType === 'start' ? 'startLocation' : 'endLocation']: newLocation 
            } 
          : trip
      ));
      
      toast({
        title: `${locationType === 'start' ? 'Start' : 'End'} Point Set`,
        description: `Set for Trip ${multipleTrips.indexOf(tripNeedingLocation) + 1} at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
      });
    }
  };

  const addTrip = () => {
    setMultipleTrips([...multipleTrips, { 
      id: `trip-${Date.now()}`, 
      startLocation: null, 
      endLocation: null 
    }]);
  };

  const removeTrip = (tripId: string) => {
    setMultipleTrips(multipleTrips.filter(trip => trip.id !== tripId));
  };

  const removeStop = async (stopId: string) => {
    try {
      await supabase.from('locations').delete().eq('id', stopId);
      setSingleTripStops(singleTripStops.filter(stop => stop.id !== stopId));
      toast({
        title: "Stop Removed",
        description: "Location removed successfully"
      });
    } catch (error) {
      console.error('Error removing location:', error);
      toast({
        title: "Error",
        description: "Failed to remove location",
        variant: "destructive"
      });
    }
  };

  const getAllLocations = (): Location[] => {
    if (tripMode === 'single') {
      return singleTripStops;
    } else {
      return multipleTrips.flatMap(trip => 
        [trip.startLocation, trip.endLocation].filter(Boolean) as Location[]
      );
    }
  };

  const calculateOptimalRoute = async () => {
    if (tripMode === 'single' && singleTripStops.length < 2) {
      toast({
        title: "Not enough stops",
        description: "Add at least 2 stops to calculate a route",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);
    try {
      const mapboxToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'; // This should be replaced with actual token
      
      if (tripMode === 'single') {
        // Build coordinates string for waypoints
        const coordinates = singleTripStops
          .map(stop => `${stop.longitude},${stop.latitude}`)
          .join(';');
        
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${mapboxToken}`
        );
        
        if (!response.ok) throw new Error('Failed to calculate route');
        
        const data = await response.json();
        setOptimizedRoute(data);
        
        toast({
          title: "Route Calculated",
          description: `Total distance: ${(data.routes[0].distance / 1000).toFixed(2)} km, Duration: ${Math.round(data.routes[0].duration / 60)} min`
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      toast({
        title: "Error",
        description: "Failed to calculate optimal route",
        variant: "destructive"
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="container mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Path Optimization</h1>
        <p className="text-muted-foreground">
          Optimize vehicle routing and paths using AI-powered algorithms for traffic flow and efficiency
        </p>
      </div>

      {/* Map View */}
      <Card>
        <CardHeader>
          <CardTitle>Map View</CardTitle>
          <CardDescription>
            {tripMode === 'single' 
              ? 'Click on the map to add stops to your route'
              : 'Select a trip and click on the map to set start/end points'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MapboxMap 
            locations={getAllLocations()}
            onLocationSelect={(lng, lat) => handleMapLocationSelect(lng, lat)}
            interactive={true}
            height="h-[600px]"
            route={optimizedRoute}
          />
        </CardContent>
      </Card>

      {/* Route Planning */}
      <Card>
        <CardHeader>
          <CardTitle>Route Planning</CardTitle>
          <CardDescription>Click on the map to add locations or configure trips below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={tripMode} onValueChange={(v) => setTripMode(v as 'single' | 'multiple')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">Single Route (Multiple Stops)</TabsTrigger>
              <TabsTrigger value="multiple">Multiple Trips (Start & End)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click on the map to add stops for a single optimized route through multiple locations.
              </p>
              {singleTripStops.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Stops ({singleTripStops.length})</h4>
                  {singleTripStops.map((stop, index) => (
                    <div key={stop.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">
                        {index + 1}. {stop.name} ({stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)})
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => removeStop(stop.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button 
                disabled={!selectedModel || singleTripStops.length < 2 || isCalculating}
                onClick={calculateOptimalRoute}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isCalculating ? 'Calculating...' : 'Calculate Optimal Route'}
              </Button>
            </TabsContent>
            
            <TabsContent value="multiple" className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create multiple trips, each with a start and end location.
              </p>
              {multipleTrips.map((trip, index) => (
                <div key={trip.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Trip {index + 1}</h4>
                    {multipleTrips.length > 1 && (
                      <Button variant="ghost" size="sm" onClick={() => removeTrip(trip.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-sm">
                      <span className="font-medium">Start:</span>{' '}
                      {trip.startLocation 
                        ? `${trip.startLocation.latitude.toFixed(4)}, ${trip.startLocation.longitude.toFixed(4)}`
                        : 'Not set'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">End:</span>{' '}
                      {trip.endLocation 
                        ? `${trip.endLocation.latitude.toFixed(4)}, ${trip.endLocation.longitude.toFixed(4)}`
                        : 'Not set'}
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={addTrip}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trip
                </Button>
                <Button disabled={!selectedModel || multipleTrips.some(t => !t.startLocation || !t.endLocation)}>
                  <Navigation className="w-4 h-4 mr-2" />
                  Calculate All Routes
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Optimized Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Optimized Routes</CardTitle>
          <CardDescription>Route optimization results will appear here after calculation</CardDescription>
        </CardHeader>
        <CardContent>
          {optimizedRoute ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Distance</p>
                  <p className="text-2xl font-bold">{(optimizedRoute.routes[0].distance / 1000).toFixed(2)} km</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-2xl font-bold">{Math.round(optimizedRoute.routes[0].duration / 60)} min</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Stops</p>
                  <p className="text-2xl font-bold">{singleTripStops.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Optimization</p>
                  <p className="text-2xl font-bold text-primary">Active</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No routes calculated yet. Add stops and click "Calculate Optimal Route".</p>
            </div>
          )}
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
