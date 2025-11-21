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

interface WebsiteSection {
  id: string;
  type: 'hero' | 'features' | 'gallery' | 'testimonials' | 'cta' | 'footer' | 'content';
  title: string;
  content: string;
  imageUrl?: string;
  layout?: 'single' | 'grid' | 'columns';
}

const websiteTypes = [
  { id: 'landing', label: 'Landing Page', icon: Layout, description: 'Single page focused on conversion' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Data visualization and management' },
  { id: 'blog', label: 'Blog', icon: FileText, description: 'Content-focused website' },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, description: 'Online store and shopping' },
  { id: 'corporate', label: 'Corporate', icon: Globe, description: 'Professional business website' },
];

const sectionTypes = [
  { id: 'hero', label: 'Hero Section', description: 'Large header with CTA', defaultLayout: 'single' },
  { id: 'features', label: 'Features', description: 'Product/service features grid', defaultLayout: 'grid' },
  { id: 'gallery', label: 'Gallery', description: 'Image showcase', defaultLayout: 'grid' },
  { id: 'testimonials', label: 'Testimonials', description: 'Customer reviews', defaultLayout: 'columns' },
  { id: 'cta', label: 'Call to Action', description: 'Conversion focused section', defaultLayout: 'single' },
  { id: 'content', label: 'Content Block', description: 'Text and media content', defaultLayout: 'columns' },
  { id: 'footer', label: 'Footer', description: 'Bottom navigation and info', defaultLayout: 'columns' },
] as const;

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
  const [sections, setSections] = useState<WebsiteSection[]>([
    { id: '1', type: 'hero', title: 'Hero Section', content: 'Main headline and call to action', layout: 'single' }
  ]);
  const [features, setFeatures] = useState<Feature[]>([{ page: '', features: [''] }]);
  const [redirections, setRedirections] = useState<Redirection[]>([{ from: '', to: '' }]);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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

  const addSection = (type: typeof sectionTypes[number]['id']) => {
    const sectionType = sectionTypes.find(st => st.id === type);
    const newSection: WebsiteSection = {
      id: Date.now().toString(),
      type: type as WebsiteSection['type'],
      title: sectionType?.label || 'New Section',
      content: sectionType?.description || '',
      layout: sectionType?.defaultLayout as WebsiteSection['layout'],
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const removeSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection === id) {
      setSelectedSection(null);
    }
  };

  const updateSection = (id: string, updates: Partial<WebsiteSection>) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      setSections(newSections);
    } else if (direction === 'down' && index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      setSections(newSections);
    }
  };

  const getSectionPreviewStyle = (section: WebsiteSection) => {
    const baseClasses = "rounded-lg p-6 border-2 transition-all";
    const layoutClasses = {
      single: "flex flex-col items-center text-center",
      grid: "grid grid-cols-3 gap-4",
      columns: "flex gap-4"
    };
    return `${baseClasses} ${layoutClasses[section.layout || 'single']}`;
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
        sections: sections,
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
              <Tabs defaultValue="sections" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="features">Pages</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="sections" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">Add Section</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {sectionTypes.map((sectionType) => (
                          <Button
                            key={sectionType.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addSection(sectionType.id)}
                            className="justify-start text-left h-auto py-3"
                          >
                            <div>
                              <div className="font-semibold text-xs">{sectionType.label}</div>
                              <div className="text-xs text-muted-foreground">{sectionType.description}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                      <Label>Current Sections ({sections.length})</Label>
                      {sections.map((section, index) => (
                        <div
                          key={section.id}
                          className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedSection === section.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedSection(section.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-foreground">{section.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">{section.type} • {section.layout}</div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'up'); }}
                                disabled={index === 0}
                              >
                                ↑
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); moveSection(section.id, 'down'); }}
                                disabled={index === sections.length - 1}
                              >
                                ↓
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Section Editor */}
                          {selectedSection === section.id && (
                            <div className="mt-3 pt-3 border-t border-border space-y-3">
                              <div>
                                <Label className="text-xs">Title</Label>
                                <Input
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                  className="mt-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Content</Label>
                                <Textarea
                                  value={section.content}
                                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                  className="mt-1"
                                  rows={3}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">Layout</Label>
                                <select
                                  value={section.layout}
                                  onChange={(e) => updateSection(section.id, { layout: e.target.value as WebsiteSection['layout'] })}
                                  className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <option value="single">Single Column</option>
                                  <option value="columns">Two Columns</option>
                                  <option value="grid">Grid Layout</option>
                                </select>
                              </div>
                              <div>
                                <Label className="text-xs">Image URL (optional)</Label>
                                <Input
                                  value={section.imageUrl || ''}
                                  onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                                  placeholder="https://example.com/image.jpg"
                                  className="mt-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

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

          {/* Right Panel - Live Preview */}
          <div className="bg-muted/30 overflow-y-auto">
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-foreground">Live Preview</h3>
                  
                  {/* Browser-like preview container */}
                  <div className="rounded-lg border-2 border-border bg-background overflow-hidden shadow-xl">
                    {/* Browser chrome */}
                    <div className="bg-muted border-b border-border px-4 py-3 flex items-center gap-2">
                      <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <div className="flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground ml-3">
                        {websiteTypes.find(t => t.id === websiteType)?.label || 'Your Website'}.com
                      </div>
                    </div>

                    {/* Website preview content */}
                    <div className="min-h-[600px] max-h-[800px] overflow-y-auto bg-white">
                      {/* Navigation bar mockup */}
                      <div 
                        className="h-16 flex items-center justify-between px-8 border-b"
                        style={{ 
                          backgroundColor: primaryColor,
                          borderColor: `${primaryColor}40`
                        }}
                      >
                        <div className="font-bold text-white text-lg">Logo</div>
                        <div className="flex gap-6 text-sm text-white/90">
                          <span>Home</span>
                          <span>About</span>
                          <span>Services</span>
                          <span>Contact</span>
                        </div>
                      </div>

                      {/* Render sections */}
                      {sections.map((section) => (
                        <div 
                          key={section.id}
                          className={`relative ${
                            section.type === 'hero' ? 'min-h-[400px]' : 'min-h-[200px]'
                          }`}
                          style={{
                            backgroundColor: section.type === 'footer' ? '#1a1a1a' : 
                                          section.type === 'hero' ? `${primaryColor}10` :
                                          section.type === 'cta' ? `${accentColor}10` : 'white'
                          }}
                        >
                          <div className="p-12">
                            {/* Hero Section */}
                            {section.type === 'hero' && (
                              <div className="text-center max-w-3xl mx-auto">
                                <h1 
                                  className="text-5xl font-bold mb-6"
                                  style={{ color: primaryColor }}
                                >
                                  {section.title}
                                </h1>
                                <p className="text-xl text-gray-600 mb-8">{section.content}</p>
                                {section.imageUrl && (
                                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-6" />
                                )}
                                <div className="flex gap-4 justify-center">
                                  <div 
                                    className="px-8 py-3 rounded-lg font-semibold text-white"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    Get Started
                                  </div>
                                  <div 
                                    className="px-8 py-3 rounded-lg font-semibold border-2"
                                    style={{ 
                                      borderColor: primaryColor,
                                      color: primaryColor 
                                    }}
                                  >
                                    Learn More
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Features Section */}
                            {section.type === 'features' && (
                              <div className="max-w-6xl mx-auto">
                                <h2 
                                  className="text-3xl font-bold mb-4 text-center"
                                  style={{ color: primaryColor }}
                                >
                                  {section.title}
                                </h2>
                                <p className="text-gray-600 text-center mb-12">{section.content}</p>
                                <div className={`grid ${section.layout === 'grid' ? 'grid-cols-3' : 'grid-cols-2'} gap-8`}>
                                  {[1, 2, 3, 4, 5, 6].slice(0, section.layout === 'grid' ? 6 : 4).map((i) => (
                                    <div key={i} className="p-6 rounded-lg bg-white border-2 border-gray-200">
                                      <div 
                                        className="w-12 h-12 rounded-lg mb-4"
                                        style={{ backgroundColor: `${secondaryColor}40` }}
                                      />
                                      <h3 className="font-semibold mb-2">Feature {i}</h3>
                                      <p className="text-sm text-gray-600">Feature description goes here</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Gallery Section */}
                            {section.type === 'gallery' && (
                              <div className="max-w-6xl mx-auto">
                                <h2 
                                  className="text-3xl font-bold mb-4 text-center"
                                  style={{ color: primaryColor }}
                                >
                                  {section.title}
                                </h2>
                                <p className="text-gray-600 text-center mb-12">{section.content}</p>
                                <div className="grid grid-cols-3 gap-4">
                                  {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Testimonials Section */}
                            {section.type === 'testimonials' && (
                              <div className="max-w-6xl mx-auto">
                                <h2 
                                  className="text-3xl font-bold mb-4 text-center"
                                  style={{ color: primaryColor }}
                                >
                                  {section.title}
                                </h2>
                                <p className="text-gray-600 text-center mb-12">{section.content}</p>
                                <div className="grid grid-cols-3 gap-8">
                                  {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-6 rounded-lg bg-white border-2 border-gray-200">
                                      <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-300" />
                                        <div>
                                          <div className="font-semibold">Customer {i}</div>
                                          <div className="text-sm text-gray-500">Position</div>
                                        </div>
                                      </div>
                                      <p className="text-sm text-gray-600">"Great service and product!"</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* CTA Section */}
                            {section.type === 'cta' && (
                              <div className="text-center max-w-3xl mx-auto">
                                <h2 
                                  className="text-4xl font-bold mb-6"
                                  style={{ color: accentColor }}
                                >
                                  {section.title}
                                </h2>
                                <p className="text-xl text-gray-600 mb-8">{section.content}</p>
                                <div 
                                  className="inline-block px-12 py-4 rounded-lg font-bold text-white text-lg"
                                  style={{ backgroundColor: accentColor }}
                                >
                                  Get Started Now
                                </div>
                              </div>
                            )}

                            {/* Content Section */}
                            {section.type === 'content' && (
                              <div className="max-w-6xl mx-auto">
                                <div className={`flex ${section.layout === 'columns' ? 'flex-row' : 'flex-col'} gap-8 items-center`}>
                                  <div className="flex-1">
                                    <h2 
                                      className="text-3xl font-bold mb-4"
                                      style={{ color: primaryColor }}
                                    >
                                      {section.title}
                                    </h2>
                                    <p className="text-gray-600 text-lg leading-relaxed">{section.content}</p>
                                  </div>
                                  {section.imageUrl && (
                                    <div className="flex-1 h-64 bg-gray-200 rounded-lg" />
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Footer Section */}
                            {section.type === 'footer' && (
                              <div className="max-w-6xl mx-auto">
                                <div className="grid grid-cols-4 gap-8 text-white">
                                  <div>
                                    <h3 className="font-bold mb-4">{section.title}</h3>
                                    <p className="text-sm text-gray-400">{section.content}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Product</h4>
                                    <div className="space-y-2 text-sm text-gray-400">
                                      <div>Features</div>
                                      <div>Pricing</div>
                                      <div>Security</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Company</h4>
                                    <div className="space-y-2 text-sm text-gray-400">
                                      <div>About</div>
                                      <div>Blog</div>
                                      <div>Careers</div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-3">Support</h4>
                                    <div className="space-y-2 text-sm text-gray-400">
                                      <div>Help Center</div>
                                      <div>Contact</div>
                                      <div>Status</div>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                                  © 2024 Company Name. All rights reserved.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Empty state */}
                      {sections.length === 0 && (
                        <div className="flex items-center justify-center min-h-[400px] text-gray-400">
                          <div className="text-center">
                            <Layout className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Add sections to see your website preview</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color palette reference */}
                <div className="bg-card rounded-lg border border-border p-4">
                  <Label className="text-sm mb-3 block">Color Palette</Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <div 
                        className="w-full h-16 rounded-lg shadow-sm border border-border mb-2"
                        style={{ backgroundColor: primaryColor }}
                      />
                      <div className="text-xs text-center text-muted-foreground">Primary</div>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="w-full h-16 rounded-lg shadow-sm border border-border mb-2"
                        style={{ backgroundColor: secondaryColor }}
                      />
                      <div className="text-xs text-center text-muted-foreground">Secondary</div>
                    </div>
                    <div className="flex-1">
                      <div 
                        className="w-full h-16 rounded-lg shadow-sm border border-border mb-2"
                        style={{ backgroundColor: accentColor }}
                      />
                      <div className="text-xs text-center text-muted-foreground">Accent</div>
                    </div>
                  </div>
                </div>
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