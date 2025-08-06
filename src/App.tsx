
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import Index from "./pages/Index";
import LaserControl from "./pages/LaserControl";
import LaserMarking from "./pages/LaserMarking";
import Printer3D from "./pages/Printer3D";
import RoboticArms from "./pages/RoboticArms";
import VisionSystem from "./pages/VisionSystem";
import ConveyorBelts from "./pages/ConveyorBelts";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/laser-control" element={<LaserControl />} />
          <Route path="/laser-marking" element={<LaserMarking />} />
          <Route path="/3d-printer" element={<Printer3D />} />
          <Route path="/robotic-arms" element={<RoboticArms />} />
          <Route path="/vision-system" element={<VisionSystem />} />
          <Route path="/conveyor-belts" element={<ConveyorBelts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
