
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import AutomationPage from './AutomationPage';
import IntegrationsPage from './IntegrationsPage';
import IntegrationUIBuilder from './IntegrationUIBuilder';
import WorkflowsPortal from './WorkflowsPortal';
import NotFound from './NotFound';

interface SoftwarePortalProps {
  projectId?: string;
  hideNavigation?: boolean;
}

const SoftwarePortal = ({ projectId, hideNavigation }: SoftwarePortalProps) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <SoftwareNavigation projectId={projectId} />}
      <Routes>
        <Route path="/" element={<IntegrationsPage projectId={projectId} />} />
        <Route path="/integrations" element={<IntegrationsPage projectId={projectId} />} />
        <Route path="/ui-builder" element={<IntegrationUIBuilder projectId={projectId} />} />
        <Route path="/automation/*" element={<AutomationPage projectId={projectId} />} />
        <Route path="/workflows/*" element={<WorkflowsPortal projectId={projectId} hideNavigation />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default SoftwarePortal;
