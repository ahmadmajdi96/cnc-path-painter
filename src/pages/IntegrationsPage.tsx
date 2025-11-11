import React from 'react';
import { IntegrationControlSystem } from '@/components/IntegrationControlSystem';

interface IntegrationsPageProps {
  projectId?: string;
}

const IntegrationsPage = ({ projectId }: IntegrationsPageProps) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <IntegrationControlSystem projectId={projectId} />
      </div>
    </div>
  );
};

export default IntegrationsPage;
