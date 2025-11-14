import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Factory, Target, Repeat, Gauge, ArrowRight, Navigation } from 'lucide-react';
import roboticFeature from '@/assets/robotic-arms-feature.jpg';
import roboticInterface from '@/assets/robotic-arm-interface.jpg';

const CortanexRoboticArms = () => {
  const features = [
    '6-axis robotic arm control',
    'Real-time 3D visualization',
    'Motion sequence programming',
    'Inverse kinematics calculation',
    'Collision detection and avoidance',
    'Multi-robot coordination',
    'Teaching and playback modes',
    'Integration with conveyor systems'
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Precision Automation',
      description: 'Achieve repeatable accuracy within 0.05mm for complex assembly and pick-and-place operations.'
    },
    {
      icon: Repeat,
      title: 'Flexible Programming',
      description: 'Easy-to-use visual programming with motion sequencing and real-time path visualization.'
    },
    {
      icon: Gauge,
      title: 'Maximum Productivity',
      description: 'Increase throughput by 200% with optimized motion paths and multi-robot coordination.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/20 to-white">
      <CortanexNavigation />
      
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 rounded-full">
                <Factory className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-sky-700">Robotic Automation</span>
              </div>
              
              <h1 className="text-5xl font-bold leading-tight text-gray-900">
                Advanced Robotic<br />
                <span className="text-sky-600">Arm Control</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Multi-axis robotic control with 3D visualization, motion sequencing, precision positioning, 
                and seamless integration with your production line.
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
                src={roboticFeature} 
                alt="Robotic Arm System"
                loading="eager"
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
              Powerful <span className="text-sky-600">Capabilities</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Complete robotic control suite for industrial automation applications
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
              Automation <span className="text-sky-600">Excellence</span>
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

      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Advanced <span className="text-sky-600">Robot Control</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Visualize and control every joint with our intuitive 3D interface
            </p>
          </div>

          <Card className="overflow-hidden hover:shadow-2xl transition-all">
            <img 
              src={roboticInterface} 
              alt="Robotic Arm Control Interface"
              loading="lazy"
              className="w-full"
            />
            <div className="p-8 bg-gradient-to-br from-white to-sky-50/30">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">3D Path Planning</h4>
                    <p className="text-sm text-gray-600">Visualize motion paths with collision avoidance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Joint Control</h4>
                    <p className="text-sm text-gray-600">Precise positioning with real-time feedback</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                    <Repeat className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Motion Sequencing</h4>
                    <p className="text-sm text-gray-600">Program complex sequences with teaching mode</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Automate Your Production Line</h2>
          <p className="text-xl mb-8">
            Deploy intelligent robotic solutions with CORTANEX 4.0
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

export default CortanexRoboticArms;
