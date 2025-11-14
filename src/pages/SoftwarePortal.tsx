
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import AutomationPage from './AutomationPage';
import IntegrationsPage from './IntegrationsPage';
import IntegrationUIBuilder from './IntegrationUIBuilder';
import WorkflowsPortal from './WorkflowsPortal';
import NotFound from './NotFound';

interface SoftwarePortalProps {
  hideNavigation?: boolean;
}

const SoftwarePortal = ({ hideNavigation }: SoftwarePortalProps) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <SoftwareNavigation />}
      <Routes>
        <Route path="/" element={<IntegrationsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/ui-builder" element={<IntegrationUIBuilder />} />
        <Route path="/automation/*" element={<AutomationPage />} />
        <Route path="/workflows/*" element={<WorkflowsPortal hideNavigation={true} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default SoftwarePortal;
