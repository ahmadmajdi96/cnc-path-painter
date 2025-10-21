
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HardwarePortal from "./pages/HardwarePortal";
import SoftwarePortal from "./pages/SoftwarePortal";
import AIPortal from "./pages/AIPortal";
import WorkflowsPortal from "./pages/WorkflowsPortal";
import CortanexHome from "./pages/CortanexHome";
import CortanexCNC from "./pages/CortanexCNC";
import Cortanex3DPrinting from "./pages/Cortanex3DPrinting";
import CortanexRoboticArms from "./pages/CortanexRoboticArms";
import CortanexLaser from "./pages/CortanexLaser";
import CortanexVision from "./pages/CortanexVision";
import CortanexConveyor from "./pages/CortanexConveyor";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hardware/*" element={<HardwarePortal />} />
          <Route path="/software/*" element={<SoftwarePortal />} />
          <Route path="/ai/*" element={<AIPortal />} />
          <Route path="/workflows/*" element={<WorkflowsPortal />} />
          <Route path="/cortanex" element={<CortanexHome />} />
          <Route path="/cortanex/cnc" element={<CortanexCNC />} />
          <Route path="/cortanex/3d-printing" element={<Cortanex3DPrinting />} />
          <Route path="/cortanex/robotic-arms" element={<CortanexRoboticArms />} />
          <Route path="/cortanex/laser-marking" element={<CortanexLaser />} />
          <Route path="/cortanex/vision-systems" element={<CortanexVision />} />
          <Route path="/cortanex/conveyor" element={<CortanexConveyor />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
