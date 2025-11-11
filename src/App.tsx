
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
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminClients from "./pages/AdminClients";
import AdminProjects from "./pages/AdminProjects";
import AdminPayments from "./pages/AdminPayments";
import AdminEmployees from "./pages/AdminEmployees";
import AdminExpenses from "./pages/AdminExpenses";
import ProjectDashboard from "./pages/ProjectDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/home" element={<Home />} />
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
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/clients" element={<AdminClients />} />
          <Route path="/admin/employees" element={<AdminEmployees />} />
          <Route path="/admin/expenses" element={<AdminExpenses />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/project/:projectId/*" element={<ProjectDashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
