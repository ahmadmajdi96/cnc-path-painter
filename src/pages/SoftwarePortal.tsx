
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import ServicesPage from './ServicesPage';
import ServersPage from './ServersPage';
import AutomationPage from './AutomationPage';
import AppBuilderPage from './AppBuilderPage';
import NotFound from './NotFound';
import WorkflowsPortal from './WorkflowsPortal';

const SoftwarePortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareNavigation />
      <Routes>
        <Route path="/" element={<ServicesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/servers" element={<ServersPage />} />
        <Route path="/automation/*" element={<AutomationPage />} />
        <Route path="/app-builder/*" element={<AppBuilderPage />} />
        <Route path="/workflows/*" element={<WorkflowsPortal />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default SoftwarePortal;
