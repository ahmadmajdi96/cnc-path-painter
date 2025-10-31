import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, Upload, Plus, Trash2, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MapboxMap from '@/components/MapboxMap';
import { supabase } from '@/integrations/supabase/client';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  type?: 'start' | 'stop' | 'end';
}

const LocationsDatasetPage = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [datasetName, setDatasetName] = useState('');
  const { toast } = useToast();

  // Load locations from database on mount
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedLocations: Location[] = data.map(loc => ({
          id: loc.id,
          name: loc.name,
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address || undefined,
          type: (loc.type as 'start' | 'stop' | 'end') || 'stop'
        }));
        setLocations(formattedLocations);
      }
    } catch (error: any) {
      toast({
        title: "Error Loading Locations",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newLocations: Location[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',');
          const location: Location = {
            id: `loc-${Date.now()}-${i}`,
            name: values[headers.indexOf('name')] || `Location ${i}`,
            latitude: parseFloat(values[headers.indexOf('latitude')]) || 0,
            longitude: parseFloat(values[headers.indexOf('longitude')]) || 0,
            address: values[headers.indexOf('address')] || '',
            type: values[headers.indexOf('type')] as 'start' | 'stop' | 'end' || 'stop'
          };
          newLocations.push(location);
        }
        
        setLocations(newLocations);
        toast({
          title: "CSV Loaded",
          description: `Successfully imported ${newLocations.length} locations`
        });
      };
      reader.readAsText(file);
    }
  };

  const addManualLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: `Location ${locations.length + 1}`,
          latitude: 0,
          longitude: 0,
          type: 'stop'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newLocation: Location = {
          id: data.id,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || undefined,
          type: (data.type as 'start' | 'stop' | 'end') || 'stop'
        };
        setLocations([...locations, newLocation]);
      }
    } catch (error: any) {
      toast({
        title: "Error Adding Location",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleMapLocationSelect = async (lng: number, lat: number) => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: `Location ${locations.length + 1}`,
          latitude: lat,
          longitude: lng,
          type: 'stop'
        }])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newLocation: Location = {
          id: data.id,
          name: data.name,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || undefined,
          type: (data.type as 'start' | 'stop' | 'end') || 'stop'
        };
        setLocations([...locations, newLocation]);
        toast({
          title: "Location Added",
          description: `Added location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`
        });
      }
    } catch (error: any) {
      toast({
        title: "Error Adding Location",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateLocation = async (id: string, field: keyof Location, value: any) => {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;

      setLocations(locations.map(loc => 
        loc.id === id ? { ...loc, [field]: value } : loc
      ));
    } catch (error: any) {
      toast({
        title: "Error Updating Location",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeLocation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLocations(locations.filter(loc => loc.id !== id));
      toast({
        title: "Location Deleted",
        description: "Location removed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Location",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveDataset = () => {
    if (!datasetName) {
      toast({
        title: "Dataset Name Required",
        description: "Please enter a name for your dataset",
        variant: "destructive"
      });
      return;
    }

    if (locations.length === 0) {
      toast({
        title: "No Locations",
        description: "Please add at least one location to your dataset",
        variant: "destructive"
      });
      return;
    }

    // Here you would save to database/backend
    toast({
      title: "Dataset Saved",
      description: `Dataset "${datasetName}" saved with ${locations.length} locations`
    });
  };

  const exportDataset = () => {
    if (locations.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please add locations before exporting",
        variant: "destructive"
      });
      return;
    }

    const csvContent = [
      'name,latitude,longitude,address,type',
      ...locations.map(loc => 
        `${loc.name},${loc.latitude},${loc.longitude},${loc.address || ''},${loc.type}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${datasetName || 'locations'}-dataset.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Locations Dataset</h1>
          <p className="text-muted-foreground">Create and manage location datasets with coordinates for path optimization and routing</p>
        </div>

        {/* Map View - Moved to top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Map View</CardTitle>
          </CardHeader>
          <CardContent>
            <MapboxMap 
              locations={locations}
              onLocationSelect={handleMapLocationSelect}
              interactive={true}
              height="h-[500px]"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Dataset Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Dataset Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dataset-name">Dataset Name</Label>
                  <Input
                    id="dataset-name"
                    placeholder="Enter dataset name"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                  />
                </div>

                <Tabs defaultValue="csv" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="csv">Upload CSV</TabsTrigger>
                    <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="csv" className="space-y-4">
                    <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload CSV with columns: name, latitude, longitude, address, type
                      </p>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        id="csv-upload"
                      />
                      <label htmlFor="csv-upload">
                        <Button asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload CSV
                          </span>
                        </Button>
                      </label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="manual" className="space-y-4">
                    <Button onClick={addManualLocation} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Location
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button onClick={saveDataset} className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    Save Dataset
                  </Button>
                  <Button onClick={exportDataset} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dataset Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Dataset Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Locations</span>
                  <Badge variant="secondary" className="text-lg">{locations.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Start Points</span>
                  <Badge variant="secondary">{locations.filter(l => l.type === 'start').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stops</span>
                  <Badge variant="secondary">{locations.filter(l => l.type === 'stop').length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">End Points</span>
                  <Badge variant="secondary">{locations.filter(l => l.type === 'end').length}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations List */}
        <Card>
          <CardHeader>
            <CardTitle>Locations in Dataset ({locations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No locations added yet. Upload a CSV or add locations manually.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {locations.map((location) => (
                  <div key={location.id} className="border rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={location.name}
                          onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Latitude</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={location.latitude}
                          onChange={(e) => updateLocation(location.id, 'latitude', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Longitude</Label>
                        <Input
                          type="number"
                          step="0.000001"
                          value={location.longitude}
                          onChange={(e) => updateLocation(location.id, 'longitude', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <select
                          value={location.type}
                          onChange={(e) => updateLocation(location.id, 'type', e.target.value)}
                          className="w-full h-8 border rounded px-2 text-sm"
                        >
                          <option value="start">Start</option>
                          <option value="stop">Stop</option>
                          <option value="end">End</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeLocation(location.id)}
                          className="h-8 w-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Datasets Created</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">24</div>
              <p className="text-sm text-muted-foreground">Total location datasets</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">1,847</div>
              <p className="text-sm text-muted-foreground">Across all datasets</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Countries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">12</div>
              <p className="text-sm text-muted-foreground">Geographic coverage</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Used in Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">456</div>
              <p className="text-sm text-muted-foreground">Optimized routes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocationsDatasetPage;
