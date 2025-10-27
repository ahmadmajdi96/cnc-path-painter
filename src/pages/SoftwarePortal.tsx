
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SoftwareNavigation } from '@/components/SoftwareNavigation';
import ServicesPage from './ServicesPage';
import AutomationPage from './AutomationPage';
import AppBuilderPage from './AppBuilderPage';
import IntegrationsPage from './IntegrationsPage';
import NotFound from './NotFound';

const SoftwarePortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SoftwareNavigation />
      <Routes>
        <Route path="/" element={<ServicesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/automation/*" element={<AutomationPage />} />
        <Route path="/app-builder/*" element={<AppBuilderPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default SoftwarePortal;
