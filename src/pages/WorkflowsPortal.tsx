
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { WorkflowsNavigation } from '@/components/WorkflowsNavigation';
import { WorkflowDesigner } from '@/components/WorkflowDesigner';
import { WorkflowsList } from '@/components/WorkflowsList';
import { WorkflowExecutions } from '@/components/WorkflowExecutions';

interface WorkflowsPortalProps {
  projectId?: string;
  hideNavigation?: boolean;
}

const WorkflowsPortal = ({ projectId, hideNavigation }: WorkflowsPortalProps) => {
  return (
    <div className="min-h-screen bg-background">
      {!hideNavigation && <WorkflowsNavigation projectId={projectId} />}
      <Routes>
        <Route path="/" element={<WorkflowsList projectId={projectId} />} />
        <Route path="/designer/:workflowId?" element={<WorkflowDesigner projectId={projectId} />} />
        <Route path="/executions" element={<WorkflowExecutions projectId={projectId} />} />
        <Route path="*" element={<Navigate to="/workflows" replace />} />
      </Routes>
    </div>
  );
};

export default WorkflowsPortal;
