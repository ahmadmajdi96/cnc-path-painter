import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Edit2, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';

interface FunctionGroup {
  id: string;
  name: string;
  description: string | null;
  color: string;
  project_id: string | null;
}

interface FunctionGroupManagerProps {
  projectId: string | null;
  selectedGroup: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onGroupsChange: () => void;
}

export const FunctionGroupManager: React.FC<FunctionGroupManagerProps> = ({
  projectId,
  selectedGroup,
  onSelectGroup,
  onGroupsChange
}) => {
  const [groups, setGroups] = useState<FunctionGroup[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<FunctionGroup | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', color: '#6366f1' });

  useEffect(() => {
    if (projectId) {
      fetchGroups();
    }
  }, [projectId]);

  const fetchGroups = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('function_groups')
      .select('*')
      .eq('project_id', projectId)
      .order('name');

    if (error) {
      console.error('Error fetching groups:', error);
      return;
    }

    setGroups(data || []);
  };

  const handleSave = async () => {
    if (!projectId || !newGroup.name) {
      toast.error('Group name is required');
      return;
    }

    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('function_groups')
          .update({
            name: newGroup.name,
            description: newGroup.description || null,
            color: newGroup.color
          })
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast.success('Group updated');
      } else {
        const { error } = await supabase
          .from('function_groups')
          .insert([{
            project_id: projectId,
            name: newGroup.name,
            description: newGroup.description || null,
            color: newGroup.color
          }]);

        if (error) throw error;
        toast.success('Group created');
      }

      setIsOpen(false);
      setEditingGroup(null);
      setNewGroup({ name: '', description: '', color: '#6366f1' });
      fetchGroups();
      onGroupsChange();
    } catch (error) {
      console.error('Error saving group:', error);
      toast.error('Failed to save group');
    }
  };

  const handleDelete = async (groupId: string) => {
    const { error } = await supabase
      .from('function_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
      return;
    }

    if (selectedGroup === groupId) {
      onSelectGroup(null);
    }
    toast.success('Group deleted');
    fetchGroups();
    onGroupsChange();
  };

  const openEdit = (group: FunctionGroup) => {
    setEditingGroup(group);
    setNewGroup({ name: group.name, description: group.description || '', color: group.color });
    setIsOpen(true);
  };

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase">Groups</Label>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingGroup(null);
            setNewGroup({ name: '', description: '', color: '#6366f1' });
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <Plus className="h-3 w-3" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Group' : 'New Group'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="Group name"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${newGroup.color === color ? 'border-foreground' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewGroup({ ...newGroup, color })}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingGroup ? 'Update' : 'Create'} Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors ${
          selectedGroup === null ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
        }`}
        onClick={() => onSelectGroup(null)}
      >
        <FolderOpen className="h-4 w-4" />
        <span className="text-sm">All Functions</span>
      </div>

      {groups.map((group) => (
        <div
          key={group.id}
          className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors group ${
            selectedGroup === group.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
          }`}
          onClick={() => onSelectGroup(group.id)}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm">{group.name}</span>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(group);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(group.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
