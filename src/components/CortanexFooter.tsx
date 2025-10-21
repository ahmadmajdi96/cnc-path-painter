import { Link } from 'react-router-dom';
import { Factory, Mail, Phone, MapPin, Linkedin, Twitter } from 'lucide-react';

export const CortanexFooter = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Factory className="w-8 h-8 text-sky-400" />
              <div>
                <h3 className="text-xl font-bold">CORTANEX 4.0</h3>
                <p className="text-xs text-emerald-400">Industrial Automation</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Building the future of manufacturing with intelligent automation solutions that transform production lines into fully visible, efficient operations.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-sky-600/20 hover:bg-sky-600 flex items-center justify-center transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-sky-600/20 hover:bg-sky-600 flex items-center justify-center transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-400">Solutions</h4>
            <ul className="space-y-3">
              <li><Link to="/cortanex/cnc" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">CNC Control</Link></li>
              <li><Link to="/cortanex/3d-printing" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">3D Printing</Link></li>
              <li><Link to="/cortanex/robotic-arms" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Robotic Arms</Link></li>
              <li><Link to="/cortanex/laser-marking" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Laser Marking</Link></li>
              <li><Link to="/cortanex/vision-systems" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Vision Systems</Link></li>
              <li><Link to="/cortanex/conveyor" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Conveyor Belts</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-400">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Partners</a></li>
              <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Case Studies</a></li>
              <li><a href="#" className="text-gray-400 hover:text-sky-400 transition-colors text-sm">Support</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-emerald-400">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-sky-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <a href="mailto:info@cortanex.com" className="text-sm text-white hover:text-sky-400">info@cortanex.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-sky-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <a href="tel:+1234567890" className="text-sm text-white hover:text-sky-400">+1 (234) 567-890</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sky-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-sm text-white">Industrial Park, Tech City</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 CORTANEX 4.0. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-sky-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-sky-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-sky-400 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
