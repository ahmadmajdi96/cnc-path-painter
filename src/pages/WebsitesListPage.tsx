import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProjectId } from '@/hooks/useProjectId';
import { Download, Loader2, CheckCircle2, XCircle, Clock, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WebsiteBuild {
  id: string;
  website_type: string;
  use_cases: string;
  status: string;
  result_file_url: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

const WebsitesListPage = () => {
  const { toast } = useToast();
  const { projectId } = useProjectId();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<WebsiteBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBuilds = async () => {
    try {
      const { data, error } = await supabase
        .from('website_builds')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBuilds(data || []);
    } catch (error) {
      console.error('Error fetching builds:', error);
      toast({
        title: "Error",
        description: "Failed to fetch website builds",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();

    // Set up real-time subscription
    const subscription = supabase
      .channel('website_builds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_builds',
          filter: `project_id=eq.${projectId}`,
        },
        () => {
          fetchBuilds();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [projectId]);

  const handleDownload = (build: WebsiteBuild) => {
    if (!build.result_file_url) return;

    // Create a download link
    const link = document.createElement('a');
    link.href = build.result_file_url;
    link.download = `website-${build.website_type}-${build.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your website code is being downloaded.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'building':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            Building
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Website Builds</h1>
          <p className="text-muted-foreground mt-1">
            Track your website generation progress and download completed builds
          </p>
        </div>
        <Button onClick={() => navigate('/software/website-builder')}>
          <Plus className="h-4 w-4 mr-2" />
          New Website
        </Button>
      </div>

      {builds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Website Builds Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start building your first website using our AI-powered builder
            </p>
            <Button onClick={() => navigate('/software/website-builder')}>
              <Plus className="h-4 w-4 mr-2" />
              Build Your First Website
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {builds.map((build) => (
            <Card key={build.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {build.website_type}
                      {getStatusBadge(build.status)}
                    </CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {build.use_cases}
                    </CardDescription>
                  </div>
                  {build.status === 'completed' && build.result_file_url && (
                    <Button onClick={() => handleDownload(build)} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Created: {new Date(build.created_at).toLocaleString()}</span>
                  {build.completed_at && (
                    <span>Completed: {new Date(build.completed_at).toLocaleString()}</span>
                  )}
                </div>
                {build.error_message && (
                  <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{build.error_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WebsitesListPage;