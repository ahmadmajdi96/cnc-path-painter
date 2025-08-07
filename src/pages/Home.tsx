
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Zap, Code, Network, HardDrive, Cpu } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Control System Portal</h1>
          <p className="text-xl text-gray-600">Choose your control environment</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <HardDrive className="w-8 h-8 text-blue-600" />
                <CardTitle className="text-2xl">Industrial Hardware Portal</CardTitle>
              </div>
              <CardDescription className="text-base">
                Control and monitor your industrial hardware systems including CNC machines, 
                lasers, 3D printers, robotic arms, vision systems, and conveyor belts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="w-4 h-4" />
                  CNC Control
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4" />
                  Laser Systems
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Cpu className="w-4 h-4" />
                  3D Printing
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Network className="w-4 h-4" />
                  Automation
                </div>
              </div>
              <Link to="/hardware">
                <Button className="w-full" size="lg">
                  Enter Hardware Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-8 h-8 text-green-600" />
                <CardTitle className="text-2xl">Software Portal</CardTitle>
              </div>
              <CardDescription className="text-base">
                Manage software integrations, API connections, data flows, and 
                communication protocols between different systems and platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Network className="w-4 h-4" />
                  Integrations
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Code className="w-4 h-4" />
                  API Management
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Settings className="w-4 h-4" />
                  Protocols
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="w-4 h-4" />
                  Data Flow
                </div>
              </div>
              <Link to="/software">
                <Button className="w-full" size="lg" variant="outline">
                  Enter Software Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
