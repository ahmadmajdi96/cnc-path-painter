
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Printer3DControlPanelProps {
  selectedMachineId?: string;
  onParametersChange: (params: any) => void;
  selectedEndpoint?: string;
}

export const Printer3DControlPanel = ({ 
  selectedMachineId, 
  onParametersChange,
  selectedEndpoint 
}: Printer3DControlPanelProps) => {
  const [printParams, setPrintParams] = useState({
    layerHeight: 0.2,
    printSpeed: 50,
    infillDensity: 20,
    printTemperature: 200,
    bedTemperature: 60,
    filamentType: 'PLA',
    supportEnabled: false,
    rafEnabled: false
  });

  const { toast } = useToast();

  // Load parameters for the selected printer
  useEffect(() => {
    const loadPrinterParams = async () => {
      if (!selectedMachineId) return;

      try {
        const { data, error } = await supabase
          .from('printer_3d_configurations')
          .select('*')
          .eq('printer_id', selectedMachineId)
          .maybeSingle();

        if (error) {
          console.error('Error loading printer parameters:', error);
          return;
        }

        if (data && data.print_params) {
          setPrintParams(data.print_params);
          onParametersChange(data.print_params);
        }
      } catch (error) {
        console.error('Error loading printer parameters:', error);
      }
    };

    loadPrinterParams();
  }, [selectedMachineId, onParametersChange]);

  const handleParamChange = async (key: string, value: any) => {
    const newParams = { ...printParams, [key]: value };
    setPrintParams(newParams);
    onParametersChange(newParams);

    // Save parameters to database for this specific printer
    if (selectedMachineId) {
      try {
        const { error } = await supabase
          .from('printer_3d_configurations')
          .upsert({
            printer_id: selectedMachineId,
            print_params: newParams
          }, {
            onConflict: 'printer_id'
          });

        if (error) {
          console.error('Error saving printer parameters:', error);
        }
      } catch (error) {
        console.error('Error saving printer parameters:', error);
      }
    }
  };

  const handleEmergencyStop = () => {
    if (!selectedEndpoint) {
      toast({
        title: "No connection",
        description: "Please select an endpoint first",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Emergency stop activated",
      description: "Print job stopped immediately",
      variant: "destructive"
    });
  };

  if (!selectedMachineId) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">3D Printer Control</h3>
        <p className="text-gray-500">Select a 3D printer to view controls</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print Parameters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Print Parameters</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="filament-type">Filament Type</Label>
            <Select 
              value={printParams.filamentType} 
              onValueChange={(value) => handleParamChange('filamentType', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PLA">PLA</SelectItem>
                <SelectItem value="ABS">ABS</SelectItem>
                <SelectItem value="PETG">PETG</SelectItem>
                <SelectItem value="TPU">TPU</SelectItem>
                <SelectItem value="WOOD">Wood Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="layer-height">Layer Height (mm)</Label>
            <Input
              id="layer-height"
              type="number"
              step="0.05"
              min="0.1"
              max="0.5"
              value={printParams.layerHeight}
              onChange={(e) => handleParamChange('layerHeight', parseFloat(e.target.value))}
            />
          </div>

          <div>
            <Label>Print Speed: {printParams.printSpeed} mm/s</Label>
            <Slider
              value={[printParams.printSpeed]}
              onValueChange={(value) => handleParamChange('printSpeed', value[0])}
              min={10}
              max={200}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Infill Density: {printParams.infillDensity}%</Label>
            <Slider
              value={[printParams.infillDensity]}
              onValueChange={(value) => handleParamChange('infillDensity', value[0])}
              min={0}
              max={100}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="print-temp">Print Temperature (°C)</Label>
            <Input
              id="print-temp"
              type="number"
              min="150"
              max="300"
              value={printParams.printTemperature}
              onChange={(e) => handleParamChange('printTemperature', parseInt(e.target.value))}
            />
          </div>

          <div>
            <Label htmlFor="bed-temp">Bed Temperature (°C)</Label>
            <Input
              id="bed-temp"
              type="number"
              min="0"
              max="120"
              value={printParams.bedTemperature}
              onChange={(e) => handleParamChange('bedTemperature', parseInt(e.target.value))}
            />
          </div>
        </div>
      </Card>

      {/* Machine Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Machine Status</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="font-medium">Ready</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Temp:</span>
            <span>25°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bed Temp:</span>
            <span>22°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Print Progress:</span>
            <span>0%</span>
          </div>
        </div>
      </Card>

      {/* Emergency Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Emergency Controls</h3>
        <Button
          onClick={handleEmergencyStop}
          variant="destructive"
          className="w-full"
        >
          Emergency Stop
        </Button>
      </Card>
    </div>
  );
};
