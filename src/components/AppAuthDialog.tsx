import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { CustomApp, AppUser } from './AppBuilderControlSystem';

interface AppAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app: CustomApp | null;
  onUpdateUsers: (appId: string, users: AppUser[]) => void;
}

export const AppAuthDialog: React.FC<AppAuthDialogProps> = ({
  open,
  onOpenChange,
  app,
  onUpdateUsers,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (app) {
      setUsers(app.users || []);
    }
  }, [app]);

  if (!app || !app.requiresAuth) return null;

  const handleAddUser = () => {
    if (!newUsername.trim() || !newPassword.trim()) return;

    const newUser: AppUser = {
      id: Date.now().toString(),
      username: newUsername.trim(),
      password: newPassword.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    setNewUsername('');
    setNewPassword('');
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
  };

  const handleSave = () => {
    onUpdateUsers(app.id, users);
    onOpenChange(false);
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage App Users - {app.name}</DialogTitle>
          <DialogDescription>
            Add, edit, or remove users who can access this application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Add New User */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newUsername">Username</Label>
                  <Input
                    id="newUsername"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              <Button 
                onClick={handleAddUser}
                disabled={!newUsername.trim() || !newPassword.trim()}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </CardContent>
          </Card>

          {/* Existing Users */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Existing Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users added yet. Add users above to allow access to this app.
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">Password:</span>
                          <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                            {showPasswords[user.id] ? user.password : '••••••••'}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="h-6 w-6 p-0"
                          >
                            {showPasswords[user.id] ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
