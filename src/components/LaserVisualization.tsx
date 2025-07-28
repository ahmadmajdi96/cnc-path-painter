
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EndpointManager } from './EndpointManager';
import { Laser2DVisualization } from './Laser2DVisualization';

interface Point2D {
  x: number;
  y: number;
}

interface LaserVisualizationProps {
  selectedMachineId?: string;
  selectedEndpoint?: string;
  laserParams?: any;
  onEndpointSelect?: (endpoint: string) => void;
}

export const LaserVisualization = ({ 
  selectedMachineId, 
  selectedEndpoint, 
  laserParams,
  onEndpointSelect 
}: LaserVisualizationProps) => {
  const [points, setPoints] = useState<Point2D[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPoint, setCurrentPoint] = useState(0);

  // Fetch selected machine data
  const { data: selectedMachine } = useQuery({
    queryKey: ['laser_machine', selectedMachineId],
    queryFn: async () => {
      if (!selectedMachineId) return null;
      const { data, error } = await supabase
        .from('laser_machines')
        .select('*')
        .eq('id', selectedMachineId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMachineId
  });

  // Auto-simulation effect
  useEffect(() => {
    if (isSimulating && points.length > 0) {
      const interval = setInterval(() => {
        setCurrentPoint(prev => {
          if (prev >= points.length - 1) {
            setIsSimulating(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isSimulating, points.length]);

  const handleSimulationToggle = () => {
    if (points.length === 0) return;
    
    if (isSimulating) {
      setIsSimulating(false);
    } else {
      setCurrentPoint(0);
      setIsSimulating(true);
    }
  };

  const handleReset = () => {
    setIsSimulating(false);
    setCurrentPoint(0);
  };

  const handleAddPoint = (point: Point2D) => {
    setPoints(prev => [...prev, point]);
  };

  const handleClearPoints = () => {
    setPoints([]);
    setCurrentPoint(0);
    setIsSimulating(false);
  };

  const getDefaultLaserParams = () => ({
    laserPower: 50,
    pulseFrequency: 1000,
    markingSpeed: 500,
    pulseDuration: 100,
    beamDiameter: 0.1,
    material: 'steel',
    materialWidth: 300,
    materialHeight: 200
  });

  const effectiveLaserParams = laserParams || getDefaultLaserParams();

  return (
    <div className="space-y-6">
      {/* Endpoint Manager */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Endpoint Manager</h3>
        <EndpointManager 
          selectedMachineId={selectedMachineId}
          selectedEndpoint={selectedEndpoint}
          onEndpointSelect={onEndpointSelect}
        />
      </Card>

      {/* 2D Laser Visualization */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">
          Laser Marking - 2D Visualization
          {selectedMachine && (
            <span className="text-sm font-normal text-gray-600 ml-2">
              ({selectedMachine.name} - {selectedMachine.model})
            </span>
          )}
        </h3>
        <Laser2DVisualization
          points={points}
          isSimulating={isSimulating}
          currentPoint={currentPoint}
          onSimulationToggle={handleSimulationToggle}
          onReset={handleReset}
          onAddPoint={handleAddPoint}
          onClearPoints={handleClearPoints}
          laserParams={effectiveLaserParams}
          machineName={selectedMachine?.name || 'Laser Machine'}
        />
      </Card>
    </div>
  );
};
