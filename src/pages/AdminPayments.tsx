import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdminNavbar from '@/components/AdminNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string | null;
  transaction_id: string | null;
  due_date: string | null;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  clients: {
    company_name: string;
  };
  projects: {
    name: string;
  } | null;
}

interface Client {
  id: string;
  company_name: string;
}

interface Project {
  id: string;
  name: string;
  client_id: string;
}

const AdminPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_id: '',
    project_id: '',
    amount: '',
    currency: 'USD',
    status: 'pending',
    payment_method: '',
    transaction_id: '',
    due_date: '',
    paid_date: '',
    notes: '',
  });

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.client_id) {
      const filtered = projects.filter((p) => p.client_id === formData.client_id);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects([]);
    }
  }, [formData.client_id, projects]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/admin/login');
      return;
    }

    // Use security definer function to check admin status
    const { data: isAdmin } = await supabase
      .rpc('is_admin', { check_user_id: session.user.id });

    if (!isAdmin) {
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      // Fetch payments with client and project info
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            company_name
          ),
          projects (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;
      setPayments(paymentsData || []);

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id, company_name')
        .eq('status', 'active')
        .order('company_name');

      if (clientsError) throw clientsError;
      setClients(clientsData || []);

      // Fetch all projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, name, client_id')
        .order('name');

      if (projectsError) throw projectsError;
      setProjects(projectsData || []);
    } catch (error: any) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('payments').insert([
        {
          client_id: formData.client_id,
          project_id: formData.project_id || null,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          status: formData.status,
          payment_method: formData.payment_method || null,
          transaction_id: formData.transaction_id || null,
          due_date: formData.due_date || null,
          paid_date: formData.paid_date || null,
          notes: formData.notes || null,
        },
      ]);

      if (error) throw error;

      toast.success('Payment record created successfully!');
      setIsAddDialogOpen(false);
      setFormData({
        client_id: '',
        project_id: '',
        amount: '',
        currency: 'USD',
        status: 'pending',
        payment_method: '',
        transaction_id: '',
        due_date: '',
        paid_date: '',
        notes: '',
      });
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment');
      console.error(error);
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment record?')) return;

    try {
      const { error } = await supabase.from('payments').delete().eq('id', id);

      if (error) throw error;
      toast.success('Payment deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error('Failed to delete payment');
      console.error(error);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      payment.clients?.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: 'secondary',
      completed: 'default',
      failed: 'destructive',
      refunded: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Payments Management</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage client payments
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record New Payment</DialogTitle>
                <DialogDescription>
                  Add a new payment record for a client
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id">Client</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client_id: value, project_id: '' })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project_id">Project (Optional)</Label>
                  <Select
                    value={formData.project_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, project_id: value })
                    }
                    disabled={!formData.client_id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProjects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) =>
                        setFormData({ ...formData, amount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={formData.currency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, currency: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Input
                    id="payment_method"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({ ...formData, payment_method: e.target.value })
                    }
                    placeholder="e.g., Credit Card, Bank Transfer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transaction_id">Transaction ID</Label>
                  <Input
                    id="transaction_id"
                    value={formData.transaction_id}
                    onChange={(e) =>
                      setFormData({ ...formData, transaction_id: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) =>
                        setFormData({ ...formData, due_date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paid_date">Paid Date</Label>
                    <Input
                      id="paid_date"
                      type="date"
                      value={formData.paid_date}
                      onChange={(e) =>
                        setFormData({ ...formData, paid_date: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Payment</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.clients?.company_name}
                      </TableCell>
                      <TableCell>{payment.projects?.name || '-'}</TableCell>
                      <TableCell>
                        {payment.currency} {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{payment.payment_method || '-'}</TableCell>
                      <TableCell>
                        {payment.due_date
                          ? new Date(payment.due_date).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {payment.paid_date
                          ? new Date(payment.paid_date).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePayment(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;
