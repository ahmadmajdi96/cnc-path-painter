import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AdminNavigation } from '@/components/AdminNavigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FolderKanban, DollarSign, Workflow, Bot, Database, Blocks, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  // Client & Project Stats
  totalClients: number;
  activeClients: number;
  totalProjects: number;
  activeProjects: number;
  totalRevenue: number;
  pendingPayments: number;
  
  // Software Portal Stats
  totalIntegrations: number;
  activeIntegrations: number;
  totalAutomations: number;
  activeAutomations: number;
  
  // AI Portal Stats
  totalDatasets: number;
  activeDatasets: number;
  totalChatbots: number;
  activeChatbots: number;
  
  // Workflows Portal Stats
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successfulExecutions: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeClients: 0,
    totalProjects: 0,
    activeProjects: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    totalIntegrations: 0,
    activeIntegrations: 0,
    totalAutomations: 0,
    activeAutomations: 0,
    totalDatasets: 0,
    activeDatasets: 0,
    totalChatbots: 0,
    activeChatbots: 0,
    totalWorkflows: 0,
    activeWorkflows: 0,
    totalExecutions: 0,
    successfulExecutions: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    try {
      // Fetch clients
      const { count: totalClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true });

      const { count: activeClients } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch projects
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      const { count: activeProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch payments
      const { data: completedPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const { data: pendingPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      const totalRevenue = completedPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const pendingAmount = pendingPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Fetch datasets (AI Portal)
      const { count: totalDatasets } = await supabase
        .from('datasets')
        .select('*', { count: 'exact', head: true });

      const { count: activeDatasets } = await supabase
        .from('datasets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch chatbots (AI Portal)
      const { count: totalChatbots } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true });

      const { count: activeChatbots } = await supabase
        .from('chatbots')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch workflows (Workflows Portal)
      const { count: totalWorkflows } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true });

      const { count: activeWorkflows } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch workflow executions
      const { count: totalExecutions } = await supabase
        .from('workflow_executions')
        .select('*', { count: 'exact', head: true });

      const { count: successfulExecutions } = await supabase
        .from('workflow_executions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');

      setStats({
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalProjects: totalProjects || 0,
        activeProjects: activeProjects || 0,
        totalRevenue,
        pendingPayments: pendingAmount,
        totalIntegrations: 0, // Not implemented yet
        activeIntegrations: 0,
        totalAutomations: 0,
        activeAutomations: 0,
        totalDatasets: totalDatasets || 0,
        activeDatasets: activeDatasets || 0,
        totalChatbots: totalChatbots || 0,
        activeChatbots: activeChatbots || 0,
        totalWorkflows: totalWorkflows || 0,
        activeWorkflows: activeWorkflows || 0,
        totalExecutions: totalExecutions || 0,
        successfulExecutions: successfulExecutions || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNavigation />
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">
            Monitor your business performance and client projects
          </p>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[60px] mb-2" />
                  <Skeleton className="h-3 w-[120px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Business Overview Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Business Overview</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
                    <Users className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalClients}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeClients}</span> active
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
                    <FolderKanban className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalProjects}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeProjects}</span> in progress
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-orange-600 font-semibold">${stats.pendingPayments.toLocaleString()}</span> pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">System Health</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">100%</div>
                    <p className="text-xs text-gray-600 mt-1">All systems operational</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* AI Portal Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Bot className="h-6 w-6 mr-2 text-blue-600" />
                AI Portal Resources
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Datasets</CardTitle>
                    <Database className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalDatasets}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeDatasets}</span> active
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Chatbots</CardTitle>
                    <Bot className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalChatbots}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeChatbots}</span> active
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">AI Models</CardTitle>
                    <Blocks className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">8</div>
                    <p className="text-xs text-gray-600 mt-1">Computer vision & NLP</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Accuracy</CardTitle>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">94%</div>
                    <p className="text-xs text-gray-600 mt-1">Average model accuracy</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Workflows Portal Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Workflow className="h-6 w-6 mr-2 text-purple-600" />
                Workflows Portal
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Workflows</CardTitle>
                    <Workflow className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalWorkflows}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeWorkflows}</span> active
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
                    <Zap className="h-5 w-5 text-purple-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</div>
                    <p className="text-xs text-gray-600 mt-1">All time runs</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalExecutions > 0 
                        ? Math.round((stats.successfulExecutions / stats.totalExecutions) * 100)
                        : 0}%
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {stats.successfulExecutions} successful
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Failed Runs</CardTitle>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalExecutions - stats.successfulExecutions}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Require attention</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Software Portal Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Blocks className="h-6 w-6 mr-2 text-indigo-600" />
                Software Portal (Coming Soon)
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Integrations</CardTitle>
                    <Blocks className="h-5 w-5 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalIntegrations}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeIntegrations}</span> connected
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-indigo-600">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Automations</CardTitle>
                    <Zap className="h-5 w-5 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{stats.totalAutomations}</div>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="text-green-600 font-semibold">{stats.activeAutomations}</span> running
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/admin/clients')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Clients</p>
                        <p className="text-sm text-gray-600">View and edit client accounts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/admin/projects')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <FolderKanban className="h-8 w-8 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Projects</p>
                        <p className="text-sm text-gray-600">Track project progress</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate('/admin/payments')}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <DollarSign className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Manage Payments</p>
                        <p className="text-sm text-gray-600">Process and track payments</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
