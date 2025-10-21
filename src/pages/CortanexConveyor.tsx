import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Button } from '@/components/ui/button';
import { Box, ArrowRight } from 'lucide-react';

const CortanexConveyor = () => (
  <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white">
    <CortanexNavigation />
    <section className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Box className="w-16 h-16 text-emerald-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-6">Conveyor Systems<br /><span className="text-emerald-600">Material Flow</span></h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">Material flow automation with speed control, tracking systems, and production line integration for seamless operations.</p>
        <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-sky-600">Get Started <ArrowRight className="ml-2" /></Button>
      </div>
    </section>
    <CortanexFooter />
  </div>
);

export default CortanexConveyor;
