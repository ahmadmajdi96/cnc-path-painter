
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainNavigation } from '@/components/MainNavigation';
import Index from './Index';
import LaserControl from './LaserControl';
import LaserMarking from './LaserMarking';
import Printer3D from './Printer3D';
import RoboticArms from './RoboticArms';
import VisionSystem from './VisionSystem';
import ConveyorBelts from './ConveyorBelts';
import NotFound from './NotFound';

const HardwarePortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/laser-control" element={<LaserControl />} />
        <Route path="/laser-marking" element={<LaserMarking />} />
        <Route path="/3d-printer" element={<Printer3D />} />
        <Route path="/robotic-arms" element={<RoboticArms />} />
        <Route path="/vision-system" element={<VisionSystem />} />
        <Route path="/conveyor-belts" element={<ConveyorBelts />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default HardwarePortal;
