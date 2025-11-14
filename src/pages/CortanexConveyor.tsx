import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Box, ArrowRight, Gauge, Network, Zap, Activity } from 'lucide-react';
import conveyorSystem from '@/assets/conveyor-system.jpg';

const CortanexConveyor = () => {
  const features = [
    'Variable speed control (0-300 m/min)',
    'Multi-zone tracking system',
    'Load balancing automation',
    'RFID product identification',
    'Predictive maintenance alerts',
    'Emergency stop systems',
    'Accumulation zone management',
    'Production line synchronization'
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Optimized Flow',
      description: 'Intelligent speed control and routing algorithms maximize throughput while minimizing jams and stops.'
    },
    {
      icon: Activity,
      title: 'Real-time Tracking',
      description: 'Track every product through your facility with RFID and sensor integration for complete visibility.'
    },
    {
      icon: Gauge,
      title: 'Energy Efficient',
      description: 'Smart motor control reduces energy consumption by 40% through demand-based speed adjustment.'
    }
  ];

  const systemTypes = [
    {
      title: 'Belt Conveyors',
      description: 'Flexible material handling for boxes, packages, and light products with adjustable speed zones.',
      applications: ['Package distribution', 'Assembly lines', 'Sorting operations']
    },
    {
      title: 'Roller Conveyors',
      description: 'Heavy-duty transport for pallets and large items with minimal maintenance requirements.',
      applications: ['Warehouse operations', 'Loading docks', 'Pallet handling']
    },
    {
      title: 'Chain Conveyors',
      description: 'Robust handling of heavy loads and high-temperature materials in demanding environments.',
      applications: ['Automotive assembly', 'Metal fabrication', 'Heavy manufacturing']
    },
    {
      title: 'Smart Sorting',
      description: 'Automated routing and diversion systems for multi-destination material flow.',
      applications: ['Distribution centers', 'Order fulfillment', 'Logistics hubs']
    }
  ];

  const stats = [
    { value: '300+', label: 'Systems Installed' },
    { value: '99.8%', label: 'Uptime Rate' },
    { value: '40%', label: 'Energy Savings' },
    { value: '24/7', label: 'Monitoring' }
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
                <Box className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-gray-700">Material Flow Automation</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Conveyor Systems<br />
                <span className="text-emerald-600">Material Flow</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Intelligent material flow automation with dynamic speed control, advanced tracking systems, 
                and seamless production line integration for efficient, reliable operations.
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
                src={conveyorSystem} 
                alt="Conveyor System"
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
              Advanced <span className="text-emerald-600">Control Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete conveyor automation for modern production facilities
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
              System <span className="text-emerald-600">Benefits</span>
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
              Conveyor <span className="text-emerald-600">Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tailored systems for every material handling requirement
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {systemTypes.map((system, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all bg-gradient-to-br from-white to-emerald-50/30">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center flex-shrink-0">
                    <Network className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{system.title}</h3>
                    <p className="text-gray-600 mb-4">{system.description}</p>
                  </div>
                </div>
                <div className="pl-16">
                  <div className="text-sm font-medium text-gray-700 mb-2">Common Applications:</div>
                  <ul className="space-y-1">
                    {system.applications.map((app, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {app}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Proven <span className="text-emerald-600">Performance</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-xl transition-all bg-white/80">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-sky-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-sky-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Automate Your Material Flow</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Deploy intelligent conveyor systems with CORTANEX 4.0
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

export default CortanexConveyor;
