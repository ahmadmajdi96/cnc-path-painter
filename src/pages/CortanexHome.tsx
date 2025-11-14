import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { 
  Factory, Cpu, Eye, Zap, Shield, TrendingUp, 
  CheckCircle2, ArrowRight, Wrench, Printer, Box, 
  Sparkles, BarChart, Users, Globe
} from 'lucide-react';
import heroImage from '@/assets/cortanex-hero.jpg';
import cncFeature from '@/assets/cnc-feature.jpg';
import printerFeature from '@/assets/3d-printer-feature.jpg';
import roboticFeature from '@/assets/robotic-arms-feature.jpg';

const CortanexHome = () => {
  const solutions = [
    {
      icon: Wrench,
      title: 'CNC Control',
      description: 'Precision machining with real-time monitoring, automated toolpath generation, and full G-code control.',
      link: '/cortanex/cnc',
      image: cncFeature,
      color: 'sky'
    },
    {
      icon: Printer,
      title: '3D Printing',
      description: 'Additive manufacturing management with multi-model support, slicing automation, and print monitoring.',
      link: '/cortanex/3d-printing',
      image: printerFeature,
      color: 'emerald'
    },
    {
      icon: Factory,
      title: 'Robotic Arms',
      description: 'Multi-axis robot control with 3D visualization, motion sequencing, and precision positioning.',
      link: '/cortanex/robotic-arms',
      image: roboticFeature,
      color: 'sky'
    },
    {
      icon: Zap,
      title: 'Laser Marking',
      description: 'High-precision laser engraving with path planning, power control, and material optimization.',
      link: '/cortanex/laser-marking',
      color: 'emerald'
    },
    {
      icon: Eye,
      title: 'Vision Systems',
      description: 'AI-powered quality inspection with image processing, defect detection, and real-time analysis.',
      link: '/cortanex/vision-systems',
      color: 'sky'
    },
    {
      icon: Box,
      title: 'Conveyor Systems',
      description: 'Material flow automation with speed control, tracking systems, and production line integration.',
      link: '/cortanex/conveyor',
      color: 'emerald'
    }
  ];

  const benefits = [
    { icon: Sparkles, title: 'Fully Functional', description: 'Complete end-to-end automation solutions ready to deploy' },
    { icon: Cpu, title: 'Intelligent Control', description: 'AI-powered optimization and predictive maintenance' },
    { icon: BarChart, title: 'Real-time Visibility', description: 'Complete production line transparency and monitoring' },
    { icon: Shield, title: 'Enterprise Security', description: 'Bank-level security for your industrial operations' },
    { icon: Users, title: 'Easy to Build', description: 'Intuitive interfaces that reduce training time by 80%' },
    { icon: Globe, title: 'Scalable Platform', description: 'Grows from single machine to entire factory floor' }
  ];

  const stats = [
    { value: '99.9%', label: 'System Uptime' },
    { value: '45%', label: 'Cost Reduction' },
    { value: '3x', label: 'Faster Setup' },
    { value: '24/7', label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/30 to-emerald-50/30">
      <CortanexNavigation />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/5 via-transparent to-emerald-600/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-100 to-emerald-100 rounded-full">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-sm font-medium text-gray-700">Industry 4.0 Ready</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Transform Your</span>
                <br />
                <span className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Production Line
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                CORTANEX 4.0 delivers fully functional, efficient, and easy-to-build industrial automation solutions. 
                Create transparent production lines with complete visibility and control.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white shadow-xl text-lg px-8">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-2 text-lg px-8">
                  Watch Demo
                </Button>
              </div>

              <div className="flex gap-8 pt-4">
                {stats.slice(0, 2).map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-emerald-400/20 blur-3xl" />
              <img 
                src={heroImage} 
                alt="Industrial Automation" 
                loading="eager"
                className="relative rounded-2xl shadow-2xl w-full animate-scale-in"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Why Choose <span className="text-sky-600">CORTANEX 4.0</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The most comprehensive industrial automation platform designed for modern manufacturing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-sky-200 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7 text-sky-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-gradient-to-b from-sky-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">
              Complete <span className="text-emerald-600">Automation Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From CNC machining to vision systems, we provide integrated solutions for every aspect of your production line
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <Link key={index} to={solution.link}>
                <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300 border-2 hover:border-sky-200 h-full">
                  {solution.image && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={solution.image} 
                        alt={solution.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${solution.color}-100 to-${solution.color === 'sky' ? 'emerald' : 'sky'}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <solution.icon className={`w-6 h-6 text-${solution.color}-600`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-sky-600 transition-colors">
                      {solution.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{solution.description}</p>
                    <div className="flex items-center text-sky-600 font-medium group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-sky-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Manufacturing?</h2>
          <p className="text-xl mb-8 text-sky-50">
            Join industry leaders who trust CORTANEX 4.0 for their automation needs
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="bg-white text-sky-600 hover:bg-gray-100 text-lg px-8">
              Request Demo
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 text-lg px-8">
              Contact Sales
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-12 border-t border-white/20">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-sky-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CortanexFooter />
    </div>
  );
};

export default CortanexHome;
