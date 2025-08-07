
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import { IntegrationControlSystem } from '@/components/IntegrationControlSystem';
import { AutomationControlSystem } from '@/components/AutomationControlSystem';

const SoftwarePortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareNavigation />
      <div className="container mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<IntegrationControlSystem />} />
          <Route path="/integrations" element={<IntegrationControlSystem />} />
          <Route path="/automation" element={<AutomationControlSystem />} />
          <Route path="*" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Coming Soon</h2>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default SoftwarePortal;
