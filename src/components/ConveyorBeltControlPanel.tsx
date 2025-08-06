
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  Zap,
  Thermometer,
  Gauge,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface ConveyorBelt {
  id: string;
  name: string;
  type: 'flat' | 'modular' | 'cleated' | 'inclined' | 'curved' | 'roller';
  status: 'running' | 'idle' | 'error' | 'maintenance';
  speed: number;
  length: number;
  width: number;
  load: number;
  maxCapacity: number;
  direction: 'forward' | 'reverse' | 'stopped';
  motor: {
    power: number;
    voltage: number;
    current: number;
    temperature: number;
  };
  sensors: {
    photoelectric: boolean;
    proximity: boolean;
    loadCell: boolean;
    encoder: boolean;
  };
  location: string;
  manufacturer: string;
  model: string;
  installDate: string;
}

interface ConveyorBeltControlPanelProps {
  conveyorBelt: ConveyorBelt | null;
  onSpeedChange: (speed: number) => void;
  onDirectionChange: (direction: 'forward' | 'reverse' | 'stopped') => void;
}

export const ConveyorBeltControlPanel = ({
  conveyorBelt,
  onSpeedChange,
  onDirectionChange
}: ConveyorBeltControlPanelProps) => {
  const { toast } = useToast();
  const [targetSpeed, setTargetSpeed] = useState(0);

  if (!conveyorBelt) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a conveyor belt to access controls
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleStart = () => {
    onSpeedChange(targetSpeed || 10);
    onDirectionChange('forward');
    toast({
      title: "Belt started",
      description: `${conveyorBelt.name} is now running forward`
    });
  };

  const handleStop = () => {
    onSpeedChange(0);
    onDirectionChange('stopped');
    toast({
      title: "Belt stopped",
      description: `${conveyorBelt.name} has been stopped`
    });
  };

  const handleReverse = () => {
    onSpeedChange(targetSpeed || 10);
    onDirectionChange('reverse');
    toast({
      title: "Belt reversed",
      description: `${conveyorBelt.name} is now running in reverse`
    });
  };

  const handleSpeedAdjust = (newSpeed: number[]) => {
    const speed = newSpeed[0];
    setTargetSpeed(speed);
    if (conveyorBelt.status === 'running') {
      onSpeedChange(speed);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'maintenance': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const loadPercentage = (conveyorBelt.load / conveyorBelt.maxCapacity) * 100;
  const tempStatus = conveyorBelt.motor.temperature > 80 ? 'high' : 
                    conveyorBelt.motor.temperature > 60 ? 'medium' : 'normal';

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status</span>
            <Badge className={`${getStatusColor(conveyorBelt.status)} text-white`}>
              {conveyorBelt.status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Direction</span>
            <div className="flex items-center gap-2">
              {conveyorBelt.direction === 'forward' && <ArrowRight className="w-4 h-4 text-green-500" />}
              {conveyorBelt.direction === 'reverse' && <ArrowLeft className="w-4 h-4 text-red-500" />}
              <span className="text-sm capitalize">{conveyorBelt.direction}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleStart}
              disabled={conveyorBelt.status === 'error' || conveyorBelt.status === 'maintenance'}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
            <Button 
              onClick={handleStop}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="w-4 h-4" />
              Stop
            </Button>
          </div>
          
          <Button 
            onClick={handleReverse}
            disabled={conveyorBelt.status === 'error' || conveyorBelt.status === 'maintenance'}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reverse Direction
          </Button>
        </CardContent>
      </Card>

      {/* Speed Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Speed Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm">Current Speed: {conveyorBelt.speed} m/min</Label>
            <div className="mt-2">
              <Label className="text-sm">Target Speed</Label>
              <Slider
                value={[targetSpeed]}
                onValueChange={handleSpeedAdjust}
                max={50}
                min={0}
                step={1}
                className="mt-2"
                disabled={conveyorBelt.status === 'error' || conveyorBelt.status === 'maintenance'}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0 m/min</span>
                <span>50 m/min</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motor Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Motor Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Power</span>
              <span className="text-sm font-medium">{conveyorBelt.motor.power} kW</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Current</span>
              <span className="text-sm font-medium">{conveyorBelt.motor.current.toFixed(1)} A</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Voltage</span>
              <span className="text-sm font-medium">{conveyorBelt.motor.voltage} V</span>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">Temperature</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{conveyorBelt.motor.temperature}°C</span>
                  {tempStatus === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                </div>
              </div>
              <Progress 
                value={(conveyorBelt.motor.temperature / 100) * 100} 
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0°C</span>
                <span>100°C</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Load Status */}
      <Card>
        <CardHeader>
          <CardTitle>Load Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Current Load</span>
              <span className="text-sm font-medium">{conveyorBelt.load} kg</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Capacity</span>
              <span className="text-sm font-medium">{conveyorBelt.maxCapacity} kg</span>
            </div>
            
            <div>
              <Progress value={loadPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>{loadPercentage.toFixed(1)}%</span>
                <span>100%</span>
              </div>
            </div>
            
            {loadPercentage > 90 && (
              <div className="flex items-center gap-2 text-orange-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Near capacity limit</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sensors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${conveyorBelt.sensors.photoelectric ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Photoelectric</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${conveyorBelt.sensors.proximity ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Proximity</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${conveyorBelt.sensors.loadCell ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Load Cell</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${conveyorBelt.sensors.encoder ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Encoder</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Belt Information */}
      <Card>
        <CardHeader>
          <CardTitle>Belt Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Length:</span>
              <span>{conveyorBelt.length}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Width:</span>
              <span>{conveyorBelt.width}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>{conveyorBelt.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model:</span>
              <span>{conveyorBelt.model}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
