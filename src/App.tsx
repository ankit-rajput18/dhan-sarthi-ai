import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import SmartPlanner from "./pages/SmartPlanner";
import LoanAnalyzer from "./pages/LoanAnalyzer";
// Keep LoanAnalyzer UI and wire it to backend instead of replacing with LoanManager
import TaxTips from "./pages/TaxTips";
import ExpenseCalendar from "./pages/ExpenseCalendar";
import AIMentor from "./pages/AIMentor";
import Transactions from "./pages/Transactions";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected app routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={
              <DashboardLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/planner" element={<SmartPlanner />} />
                  <Route path="/loans" element={<LoanAnalyzer />} />
                  <Route path="/tax-tips" element={<TaxTips />} />
                  <Route path="/calendar" element={<ExpenseCalendar />} />
                  <Route path="/ai-mentor" element={<AIMentor />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DashboardLayout>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
