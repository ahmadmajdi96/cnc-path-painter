import React from 'react';
import { IntegrationControlSystem } from '@/components/IntegrationControlSystem';

const IntegrationsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <IntegrationControlSystem />
      </div>
    </div>
  );
};

export default IntegrationsPage;
