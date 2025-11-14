import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap, Target, Settings, Clock, Shield, ArrowRight } from 'lucide-react';
import laserSystem from '@/assets/laser-marking-system.jpg';

const CortanexLaser = () => {
  const features = [
    'High-speed fiber laser marking',
    'Precision vector path generation',
    'Multi-material compatibility',
    'Real-time power adjustment',
    'Automated focus calibration',
    'Barcode and QR code marking',
    '2D/3D marking capabilities',
    'Production line integration'
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Permanent Traceability',
      description: 'Create indelible marks that withstand harsh conditions, ensuring lifelong product identification and compliance.'
    },
    {
      icon: Clock,
      title: 'Lightning Fast',
      description: 'Mark thousands of parts per hour with speeds up to 7000mm/s, dramatically increasing throughput.'
    },
    {
      icon: Settings,
      title: 'Material Versatility',
      description: 'Mark metals, plastics, ceramics, and more with the same system. Automatic parameter optimization for each material.'
    }
  ];

  const applications = [
    {
      title: 'Automotive Components',
      description: 'VIN numbers, serial codes, and safety markings on engine parts, chassis components, and electronic modules.'
    },
    {
      title: 'Medical Devices',
      description: 'UDI codes, lot numbers, and instrument identification with FDA-compliant permanent marking.'
    },
    {
      title: 'Electronics',
      description: 'Circuit board marking, component identification, and branding on consumer electronics.'
    },
    {
      title: 'Aerospace Parts',
      description: 'Critical part tracking with deep engraving that meets strict aerospace traceability standards.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-sky-50/30">
      <CortanexNavigation />
      
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-sky-600/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-sky-100 rounded-full">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Laser Precision Technology</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Laser Marking<br />
                <span className="text-emerald-600">Precision Control</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                High-precision laser engraving with intelligent path planning, dynamic power control, and 
                material optimization for permanent, high-quality marking solutions across all industries.
              </p>

              <div className="flex gap-4 pt-4">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700">
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
                src={laserSystem} 
                alt="Laser Marking System"
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
              Advanced <span className="text-emerald-600">Marking Capabilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete laser marking solution for industrial traceability and branding
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
              Marking <span className="text-emerald-600">Excellence</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all border-2 hover:border-emerald-200 bg-white/80 backdrop-blur-sm">
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

      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Industry <span className="text-emerald-600">Applications</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by leading manufacturers across critical industries
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {applications.map((app, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all bg-gradient-to-br from-white to-emerald-50/30">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{app.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{app.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Mark with Precision</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Deploy permanent marking solutions with CORTANEX 4.0
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

export default CortanexLaser;
