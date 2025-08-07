
import React from 'react';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import { IntegrationControlSystem } from '@/components/IntegrationControlSystem';

const SoftwarePortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareNavigation />
      <div className="container mx-auto px-6 py-8">
        <IntegrationControlSystem />
      </div>
    </div>
  );
};

export default SoftwarePortal;
