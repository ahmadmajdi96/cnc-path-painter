import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProjectId } from '@/hooks/useProjectId';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface Feature {
  page: string;
  features: string[];
}

interface Redirection {
  from: string;
  to: string;
}

const WebsiteBuilderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projectId } = useProjectId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [websiteType, setWebsiteType] = useState('');
  const [useCases, setUseCases] = useState('');
  const [features, setFeatures] = useState<Feature[]>([{ page: '', features: [''] }]);
  const [redirections, setRedirections] = useState<Redirection[]>([{ from: '', to: '' }]);
  const [additionalDetails, setAdditionalDetails] = useState('');

  const addFeaturePage = () => {
    setFeatures([...features, { page: '', features: [''] }]);
  };

  const removeFeaturePage = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeaturePage = (index: number, page: string) => {
    const updated = [...features];
    updated[index].page = page;
    setFeatures(updated);
  };

  const addFeatureToPage = (pageIndex: number) => {
    const updated = [...features];
    updated[pageIndex].features.push('');
    setFeatures(updated);
  };

  const updateFeature = (pageIndex: number, featureIndex: number, value: string) => {
    const updated = [...features];
    updated[pageIndex].features[featureIndex] = value;
    setFeatures(updated);
  };

  const removeFeature = (pageIndex: number, featureIndex: number) => {
    const updated = [...features];
    updated[pageIndex].features = updated[pageIndex].features.filter((_, i) => i !== featureIndex);
    setFeatures(updated);
  };

  const addRedirection = () => {
    setRedirections([...redirections, { from: '', to: '' }]);
  };

  const removeRedirection = (index: number) => {
    setRedirections(redirections.filter((_, i) => i !== index));
  };

  const updateRedirection = (index: number, field: 'from' | 'to', value: string) => {
    const updated = [...redirections];
    updated[index][field] = value;
    setRedirections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!websiteType || !useCases) {
      toast({
        title: "Missing Information",
        description: "Please fill in website type and use cases.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the build record
      const { data: buildData, error: insertError } = await supabase
        .from('website_builds')
        .insert([{
          website_type: websiteType,
          use_cases: useCases,
          features: features as any,
          redirections: redirections as any,
          additional_details: (additionalDetails ? JSON.parse(additionalDetails) : {}) as any,
          status: 'building',
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Call the edge function to start building
      const { error: functionError } = await supabase.functions.invoke('build-website', {
        body: {
          buildId: buildData.id,
          websiteData: {
            website_type: websiteType,
            use_cases: useCases,
            features: features,
            redirections: redirections,
            additional_details: additionalDetails ? JSON.parse(additionalDetails) : {},
          },
        },
      });

      if (functionError) throw functionError;

      toast({
        title: "Website Build Started",
        description: "Your website is being generated. You'll be redirected to the websites list.",
      });

      // Redirect to websites list
      setTimeout(() => {
        navigate('/software/websites');
      }, 1500);
    } catch (error) {
      console.error('Error starting website build:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start website build",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Website Builder</CardTitle>
          <CardDescription>
            Design your website by providing detailed specifications. Our AI will generate a complete website based on your requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Website Type */}
            <div className="space-y-2">
              <Label htmlFor="websiteType">Website Type *</Label>
              <Input
                id="websiteType"
                value={websiteType}
                onChange={(e) => setWebsiteType(e.target.value)}
                placeholder="e.g., E-commerce, Portfolio, Blog, Corporate"
                required
              />
            </div>

            {/* Use Cases */}
            <div className="space-y-2">
              <Label htmlFor="useCases">Use Cases & Description *</Label>
              <Textarea
                id="useCases"
                value={useCases}
                onChange={(e) => setUseCases(e.target.value)}
                placeholder="Describe the purpose and main use cases for your website..."
                rows={6}
                required
              />
            </div>

            {/* Features per Page */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Features per Page</Label>
                <Button type="button" onClick={addFeaturePage} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Page
                </Button>
              </div>
              
              {features.map((feature, pageIndex) => (
                <Card key={pageIndex} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Page name (e.g., Home, About, Contact)"
                        value={feature.page}
                        onChange={(e) => updateFeaturePage(pageIndex, e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() => removeFeaturePage(pageIndex)}
                        size="icon"
                        variant="destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {feature.features.map((feat, featIndex) => (
                      <div key={featIndex} className="flex items-center gap-2 ml-4">
                        <Input
                          placeholder="Feature description"
                          value={feat}
                          onChange={(e) => updateFeature(pageIndex, featIndex, e.target.value)}
                        />
                        <Button
                          type="button"
                          onClick={() => removeFeature(pageIndex, featIndex)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      onClick={() => addFeatureToPage(pageIndex)}
                      size="sm"
                      variant="outline"
                      className="ml-4"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Feature
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            {/* Redirections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Redirections</Label>
                <Button type="button" onClick={addRedirection} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" /> Add Redirection
                </Button>
              </div>
              
              {redirections.map((redirect, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder="From path"
                    value={redirect.from}
                    onChange={(e) => updateRedirection(index, 'from', e.target.value)}
                  />
                  <span>→</span>
                  <Input
                    placeholder="To path"
                    value={redirect.to}
                    onChange={(e) => updateRedirection(index, 'to', e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={() => removeRedirection(index)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Additional Details */}
            <div className="space-y-2">
              <Label htmlFor="additionalDetails">Additional Details (JSON format)</Label>
              <Textarea
                id="additionalDetails"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder='{"theme": "modern", "colors": ["blue", "white"]}'
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Build...
                </>
              ) : (
                'Build Website'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebsiteBuilderPage;