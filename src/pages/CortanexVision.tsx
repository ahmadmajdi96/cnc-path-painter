import { CortanexNavigation } from '@/components/CortanexNavigation';
import { CortanexFooter } from '@/components/CortanexFooter';
import { Button } from '@/components/ui/button';
import { Eye, ArrowRight } from 'lucide-react';

const CortanexVision = () => (
  <div className="min-h-screen bg-gradient-to-b from-white via-sky-50/20 to-white">
    <CortanexNavigation />
    <section className="pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Eye className="w-16 h-16 text-sky-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold mb-6">Vision Systems<br /><span className="text-sky-600">Quality Inspection</span></h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">AI-powered quality inspection with image processing, defect detection, and real-time analysis for zero-defect manufacturing.</p>
        <Button size="lg" className="bg-gradient-to-r from-sky-600 to-emerald-600">Get Started <ArrowRight className="ml-2" /></Button>
      </div>
    </section>
    <CortanexFooter />
  </div>
);

export default CortanexVision;
