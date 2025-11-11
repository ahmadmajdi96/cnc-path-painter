
import React from 'react';
import { AutomationControlSystem } from '@/components/AutomationControlSystem';

interface AutomationPageProps {
  projectId?: string;
}

const AutomationPage = ({ projectId }: AutomationPageProps) => {
  return (
    <div className="container mx-auto px-6 py-8">
      <AutomationControlSystem projectId={projectId} />
    </div>
  );
};

export default AutomationPage;
