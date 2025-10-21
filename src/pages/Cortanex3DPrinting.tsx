import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Printer, Layers, Box, Clock, ArrowRight } from 'lucide-react';
import printerFeature from '@/assets/3d-printer-feature.jpg';

const Cortanex3DPrinting = () => {
  const features = [
    'Multi-format 3D model support (STL, OBJ, GLTF, FBX)',
    'Advanced build volume visualization',
    'Real-time print monitoring and control',
    'Automated G-code generation',
    'Multi-printer management dashboard',
    'Print queue and scheduling system',
    'Material usage tracking',
    'Remote print control and monitoring'
  ];

  const benefits = [
    {
      icon: Clock,
      title: 'Rapid Prototyping',
      description: 'Accelerate product development with streamlined 3D printing workflows and automated slicing.'
    },
    {
      icon: Layers,
      title: 'Quality Assurance',
      description: 'Monitor every layer with real-time visualization and automatic error detection systems.'
    },
    {
      icon: Box,
      title: 'Production Scaling',
      description: 'Manage multiple printers simultaneously with centralized control and intelligent job distribution.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white">
      <CortanexNavigation />
      
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
                <Printer className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Additive Manufacturing</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Professional 3D<br />
                <span className="text-emerald-600">Printing Management</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive 3D printing solution with model management, automated slicing, 
                real-time monitoring, and multi-printer orchestration capabilities.
              </p>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                  View Demo
                </Button>
              </div>
            </div>

            <div className="relative animate-scale-in">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-sky-400/20 blur-3xl" />
              <img 
                src={printerFeature} 
                alt="3D Printing System" 
                className="relative rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Advanced <span className="text-emerald-600">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade 3D printing tools for additive manufacturing excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 rounded-lg hover:bg-emerald-50/50 transition-colors">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Transform Your <span className="text-emerald-600">Production</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2 hover:border-emerald-200">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center mb-6">
                  <benefit.icon className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Your 3D Printing Journey</h2>
          <p className="text-xl mb-8">
            Experience the future of additive manufacturing with CORTANEX 4.0
          </p>
          <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
            Request Demo
          </Button>
        </div>
      </section>

      <CortanexFooter />
    </div>
  );
};

export default Cortanex3DPrinting;
