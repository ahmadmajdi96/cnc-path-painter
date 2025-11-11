
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowsNavigation } from '@/components/WorkflowsNavigation';
import { WorkflowDesigner } from '@/components/WorkflowDesigner';
import { WorkflowsList } from '@/components/WorkflowsList';
import { WorkflowExecutions } from '@/components/WorkflowExecutions';

const WorkflowsPortal = () => {
  return (
    <div className="min-h-screen bg-background">
      <WorkflowsNavigation />
      <Routes>
        <Route path="/" element={<WorkflowsList />} />
        <Route path="/designer/:workflowId?" element={<WorkflowDesigner />} />
        <Route path="/executions" element={<WorkflowExecutions />} />
        <Route path="*" element={<Navigate to="/workflows" replace />} />
      </Routes>
    </div>
  );
};

export default WorkflowsPortal;
