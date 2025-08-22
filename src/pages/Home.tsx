
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wrench, Monitor, Brain, GitBranch } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Industrial Control Portal
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive control and monitoring system for hardware, software, AI services, and workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Hardware Portal */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Hardware Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Control industrial machines, robotic arms, vision systems, and manufacturing equipment
              </p>
              <Link to="/hardware">
                <Button className="w-full">
                  Access Hardware Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Software Portal */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Monitor className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Software Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Manage integrations, automation, app building, and software services
              </p>
              <Link to="/software">
                <Button className="w-full">
                  Access Software Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Portal */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl">AI Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Computer vision, NLP, chat bots, and AI-powered analysis services
              </p>
              <Link to="/ai">
                <Button className="w-full">
                  Access AI Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Workflows Portal */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Workflows Portal</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Design, execute, and monitor automated workflows and business processes
              </p>
              <Link to="/workflows">
                <Button className="w-full">
                  Access Workflows Portal
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
