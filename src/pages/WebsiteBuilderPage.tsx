import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProjectId } from '@/hooks/useProjectId';
import { Plus, Trash2, Loader2, Layout, LayoutDashboard, FileText, ShoppingCart, Globe, Palette } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Feature {
  page: string;
  features: string[];
}

interface Redirection {
  from: string;
  to: string;
}

const websiteTypes = [
  { id: 'landing', label: 'Landing Page', icon: Layout, description: 'Single page focused on conversion' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Data visualization and management' },
  { id: 'blog', label: 'Blog', icon: FileText, description: 'Content-focused website' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, description: 'Online store and shopping' },
  { id: 'corporate', label: 'Corporate', icon: Globe, description: 'Professional business website' },
];

const WebsiteBuilderPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { projectId } = useProjectId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [websiteType, setWebsiteType] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#8b5cf6');
  const [accentColor, setAccentColor] = useState('#ec4899');
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
      const additionalDetailsObj = {
        colors: {
          primary: primaryColor,
          secondary: secondaryColor,
          accent: accentColor,
        },
        ...(additionalDetails ? JSON.parse(additionalDetails) : {}),
      };

      const { data: buildData, error: insertError } = await supabase
        .from('website_builds')
        .insert([{
          project_id: projectId,
          website_type: websiteType,
          use_cases: useCases,
          features: features as any,
          redirections: redirections as any,
          additional_details: additionalDetailsObj as any,
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
            additional_details: additionalDetailsObj,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Website Designer</h1>
          <p className="text-muted-foreground mt-2">Design your website with AI - choose a type, customize colors, and define features</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[calc(100vh-140px)]">
          {/* Left Panel - Configuration */}
          <div className="border-r border-border bg-card overflow-y-auto">
            <div className="p-8 space-y-8">
              
              {/* Website Type Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Website Type *</Label>
                <div className="grid grid-cols-2 gap-4">
                  {websiteTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setWebsiteType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left hover:border-primary ${
                          websiteType === type.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mb-2 ${websiteType === type.id ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="font-semibold text-foreground">{type.label}</div>
                        <div className="text-sm text-muted-foreground mt-1">{type.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-muted-foreground" />
                  <Label className="text-lg font-semibold">Color Scheme</Label>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-12 h-12 rounded border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-12 rounded border-2 border-border cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs for advanced settings */}
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Features</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="useCases">Use Cases & Description *</Label>
                    <Textarea
                      id="useCases"
                      value={useCases}
                      onChange={(e) => setUseCases(e.target.value)}
                      placeholder="Describe the purpose and main use cases for your website..."
                      rows={8}
                      required
                      className="resize-none"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Label>Pages & Features</Label>
                    <Button type="button" onClick={addFeaturePage} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Add Page
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {features.map((feature, pageIndex) => (
                      <Card key={pageIndex} className="p-4 bg-background">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Page name (e.g., Home, About)"
                              value={feature.page}
                              onChange={(e) => updateFeaturePage(pageIndex, e.target.value)}
                              className="font-semibold"
                            />
                            <Button
                              type="button"
                              onClick={() => removeFeaturePage(pageIndex)}
                              size="icon"
                              variant="ghost"
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
                                className="text-sm"
                              />
                              <Button
                                type="button"
                                onClick={() => removeFeature(pageIndex, featIndex)}
                                size="icon"
                                variant="ghost"
                              >
                                <Trash2 className="h-3 w-3" />
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
                            <Plus className="h-3 w-3 mr-1" /> Add Feature
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Redirections</Label>
                        <Button type="button" onClick={addRedirection} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>
                      
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {redirections.map((redirect, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Input
                              placeholder="From"
                              value={redirect.from}
                              onChange={(e) => updateRedirection(index, 'from', e.target.value)}
                              className="text-sm"
                            />
                            <span className="text-muted-foreground">→</span>
                            <Input
                              placeholder="To"
                              value={redirect.to}
                              onChange={(e) => updateRedirection(index, 'to', e.target.value)}
                              className="text-sm"
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="additionalDetails">Additional Details (JSON)</Label>
                      <Textarea
                        id="additionalDetails"
                        value={additionalDetails}
                        onChange={(e) => setAdditionalDetails(e.target.value)}
                        placeholder='{"theme": "modern"}'
                        rows={6}
                        className="font-mono text-sm resize-none"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-muted/30 overflow-y-auto">
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Preview</h3>
                  <div className="rounded-lg border-2 border-border bg-background p-8 min-h-[400px]">
                    {/* Color Preview */}
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div 
                          className="w-20 h-20 rounded-lg shadow-md border-2 border-border"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div 
                          className="w-20 h-20 rounded-lg shadow-md border-2 border-border"
                          style={{ backgroundColor: secondaryColor }}
                        />
                        <div 
                          className="w-20 h-20 rounded-lg shadow-md border-2 border-border"
                          style={{ backgroundColor: accentColor }}
                        />
                      </div>

                      {/* Website Type Preview */}
                      {websiteType && (
                        <div className="mt-6">
                          <div className="text-sm text-muted-foreground mb-2">Selected Type</div>
                          <div className="text-xl font-bold" style={{ color: primaryColor }}>
                            {websiteTypes.find(t => t.id === websiteType)?.label || 'Not selected'}
                          </div>
                        </div>
                      )}

                      {/* Mock preview layout */}
                      {websiteType && (
                        <div className="mt-8 space-y-3">
                          <div 
                            className="h-12 rounded-md" 
                            style={{ backgroundColor: `${primaryColor}20` }}
                          />
                          <div className="grid grid-cols-3 gap-3">
                            <div 
                              className="h-24 rounded-md" 
                              style={{ backgroundColor: `${secondaryColor}20` }}
                            />
                            <div 
                              className="h-24 rounded-md" 
                              style={{ backgroundColor: `${accentColor}20` }}
                            />
                            <div 
                              className="h-24 rounded-md" 
                              style={{ backgroundColor: `${primaryColor}20` }}
                            />
                          </div>
                          <div 
                            className="h-32 rounded-md" 
                            style={{ backgroundColor: `${secondaryColor}20` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pages List */}
                {features.some(f => f.page) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-foreground">Pages</h3>
                    <div className="space-y-2">
                      {features.filter(f => f.page).map((feature, idx) => (
                        <div key={idx} className="p-3 rounded-md bg-card border border-border">
                          <div className="font-medium text-foreground">{feature.page}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {feature.features.filter(f => f).length} features
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {websiteType ? 'Ready to build' : 'Select a website type to continue'}
            </div>
            <Button type="submit" disabled={isSubmitting || !websiteType} size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Building Website...
                </>
              ) : (
                'Generate Website'
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WebsiteBuilderPage;