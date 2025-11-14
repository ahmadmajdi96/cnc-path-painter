import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Eye, Camera, Cpu, TrendingUp, Shield, ArrowRight } from 'lucide-react';
import visionSystem from '@/assets/vision-inspection-system.jpg';

const CortanexVision = () => {
  const features = [
    'AI-powered defect detection',
    'Multi-camera synchronization',
    'Real-time image processing',
    'Dimensional measurement',
    'Color and texture analysis',
    'OCR and barcode reading',
    'Pattern matching algorithms',
    'Automated pass/fail decisions'
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Zero-Defect Quality',
      description: 'Catch 99.9% of defects that human inspectors miss. AI identifies subtle flaws invisible to the naked eye.'
    },
    {
      icon: TrendingUp,
      title: '24/7 Inspection',
      description: 'Tireless automated inspection at production speeds, eliminating bottlenecks and fatigue-related errors.'
    },
    {
      icon: Cpu,
      title: 'Smart Learning',
      description: 'System continuously improves accuracy through machine learning, adapting to new defect types automatically.'
    }
  ];

  const capabilities = [
    {
      title: 'Defect Detection',
      items: ['Surface scratches and dents', 'Color inconsistencies', 'Missing components', 'Assembly errors', 'Contamination'],
      icon: Camera
    },
    {
      title: 'Measurements',
      items: ['Dimensional accuracy', 'Gap and flush analysis', 'Position verification', 'Tolerance checking', 'Profile matching'],
      icon: Eye
    }
  ];

  const industries = [
    { name: 'Automotive', stat: '100%', metric: 'Inspection Coverage' },
    { name: 'Electronics', stat: '50%', metric: 'Cost Reduction' },
    { name: 'Pharmaceuticals', stat: '99.9%', metric: 'Accuracy Rate' },
    { name: 'Food & Beverage', stat: '3x', metric: 'Faster Inspection' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/30 to-emerald-50/30">
      <CortanexNavigation />
      
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-emerald-600/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 to-emerald-100 rounded-full">
                <Eye className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-gray-700">Computer Vision Technology</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Vision Systems<br />
                <span className="text-sky-600">Quality Inspection</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                AI-powered quality inspection with advanced image processing, intelligent defect detection, 
                and real-time analysis for zero-defect manufacturing and complete production line transparency.
              </p>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-emerald-400/20 blur-3xl" />
              <img 
                src={visionSystem} 
                alt="Vision Inspection System"
                loading="eager"
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Powerful <span className="text-sky-600">Vision Capabilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete AI-powered inspection system for automated quality control
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg hover:bg-sky-50/50 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-sky-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Inspection <span className="text-sky-600">Excellence</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2 hover:border-sky-200 bg-white/80 backdrop-blur-sm">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {capabilities.map((capability, index) => (
              <Card key={index} className="p-8 bg-gradient-to-br from-white to-sky-50/30">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
                    <capability.icon className="w-6 h-6 text-sky-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">{capability.title}</h3>
                </div>
                <ul className="space-y-3">
                  {capability.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-sky-600 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Industry <span className="text-sky-600">Results</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Proven performance across demanding manufacturing environments
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-xl transition-all bg-gradient-to-br from-white to-sky-50/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {industry.stat}
                </div>
                <div className="text-sm text-gray-600 mb-3">{industry.metric}</div>
                <div className="text-lg font-semibold text-gray-900">{industry.name}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">See Every Detail</h2>
          <p className="text-xl mb-8 text-sky-50">
            Deploy intelligent vision inspection with CORTANEX 4.0
          </p>
          <Button size="lg" className="bg-white text-sky-600 hover:bg-gray-100">
            Request Demo
          </Button>
        </div>
      </section>

      <CortanexFooter />
    </div>
  );
};

export default CortanexVision;
