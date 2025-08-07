
import React from 'react';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import { AutomationControlSystem } from '@/components/AutomationControlSystem';

const AutomationPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareNavigation />
      <div className="container mx-auto px-6 py-8">
        <AutomationControlSystem />
      </div>
    </div>
  );
};

export default AutomationPage;
