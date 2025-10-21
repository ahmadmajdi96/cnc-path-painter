import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Wrench, Zap, BarChart, Shield, ArrowRight, Code2, Gauge, Target } from 'lucide-react';
import cncFeature from '@/assets/cnc-feature.jpg';
import cncInterface from '@/assets/cnc-control-interface.jpg';

const CortanexCNC = () => {
  const features = [
    'Real-time G-code generation and execution',
    '2D/3D toolpath visualization',
    'Multi-axis CNC machine support',
    'Automatic toolpath optimization',
    'Material-specific parameter presets',
    'Live machine status monitoring',
    'Remote control and configuration',
    'Comprehensive error detection'
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Accelerated Production',
      description: 'Reduce setup time by 65% with automated toolpath generation and intelligent parameter optimization.'
    },
    {
      icon: BarChart,
      title: 'Enhanced Precision',
      description: 'Achieve micron-level accuracy with advanced motion control and real-time feedback systems.'
    },
    {
      icon: Shield,
      title: 'Operational Safety',
      description: 'Comprehensive safety protocols with collision detection, emergency stops, and safe zone monitoring.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/20 to-white">
      <CortanexNavigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full">
                <Wrench className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">CNC Control System</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Precision CNC<br />
                <span className="text-sky-600">Machining Control</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Complete CNC control solution with real-time monitoring, automated toolpath generation, 
                and seamless integration with your existing production line.
              </p>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800">
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
                src={cncFeature} 
                alt="CNC Control System" 
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Complete <span className="text-sky-600">Feature Set</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for professional CNC machine control and monitoring
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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Business <span className="text-sky-600">Benefits</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2 hover:border-sky-200">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interface Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Intuitive <span className="text-sky-600">Control Interface</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor and control your entire CNC operation from our comprehensive dashboard
            </p>
          </div>

          <Card className="overflow-hidden hover:shadow-2xl transition-all">
            <img 
              src={cncInterface} 
              alt="CNC Control Interface Dashboard" 
              className="w-full"
            />
            <div className="p-8 bg-gradient-to-br from-white to-sky-50/30">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Real-time Monitoring</h4>
                    <p className="text-sm text-gray-600">Live toolpath visualization with position tracking</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Gauge className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Performance Analytics</h4>
                    <p className="text-sm text-gray-600">Track efficiency and identify optimization opportunities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Precision Control</h4>
                    <p className="text-sm text-gray-600">Sub-micron accuracy with advanced compensation</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Precision Starts Here</h2>
          <p className="text-xl mb-8">
            Deploy advanced CNC automation with CORTANEX 4.0
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

export default CortanexCNC;
