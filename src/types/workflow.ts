
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'error';
  trigger_type: 'manual' | 'schedule' | 'webhook' | 'event' | 'file_change';
  trigger_config: any;
  created_at: string;
  updated_at: string;
  last_run?: string;
  next_run?: string;
  run_count: number;
  success_count: number;
  error_count: number;
  is_active: boolean;
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_type: 'trigger' | 'action' | 'condition' | 'delay' | 'loop' | 'end';
  component_type: 'cnc' | 'laser' | 'printer3d' | 'robotic_arm' | 'conveyor' | 'vision_system' | 'chatbot' | 'automation' | 'integration' | 'manual';
  component_id?: string;
  position_x: number;
  position_y: number;
  config: any;
  name: string;
  description?: string;
  created_at: string;
}

export interface WorkflowConnection {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  condition_type: 'always' | 'success' | 'error' | 'conditional';
  condition_value: any;
  created_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_data: any;
  duration_ms?: number;
  workflow?: {
    name: string;
    description?: string;
  };
}
