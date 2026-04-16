import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProviderDetail from "./pages/ProviderDetail.tsx";
import Quiz from "./pages/Quiz.tsx";
import Search from "./pages/Search.tsx";
import Book from "./pages/Book.tsx";
import ParentDashboard from "./pages/ParentDashboard.tsx";
import Messages from "./pages/Messages.tsx";
import ProviderDashboard from "./pages/ProviderDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import ProviderOnboarding from "./pages/ProviderOnboarding.tsx";
import EnterCode from "./pages/EnterCode.tsx";
import TeacherDashboard from "./pages/TeacherDashboard.tsx";
import IconShowcase from "./pages/IconShowcase.tsx";
import ClaimDaycare from "./pages/ClaimDaycare.tsx";
import Notifications from "./pages/Notifications.tsx";
import FormBuilder from "./pages/FormBuilder.tsx";
import ApplicationInbox from "./pages/ApplicationInbox.tsx";
import EnrollmentForm from "./pages/EnrollmentForm.tsx";
import CapacityDashboard from "./pages/CapacityDashboard.tsx";
import PaymentDashboard from "./pages/PaymentDashboard.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/search" element={<Search />} />
            <Route path="/provider/:slug" element={<ProviderDetail />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/enter-code" element={<EnterCode />} />
            <Route path="/icons" element={<IconShowcase />} />
            <Route path="/claim/:id" element={<ClaimDaycare />} />
            <Route path="/notifications" element={
              <ProtectedRoute><Notifications /></ProtectedRoute>
            } />
            <Route path="/teacher/dashboard" element={
              <ProtectedRoute allowedRoles={["teacher"]}><TeacherDashboard /></ProtectedRoute>
            } />
            <Route path="/provider/onboarding" element={
              <ProtectedRoute><ProviderOnboarding /></ProtectedRoute>
            } />
            <Route path="/book/:slug" element={
              <ProtectedRoute><Book /></ProtectedRoute>
            } />
            <Route path="/parent/dashboard" element={
              <ProtectedRoute allowedRoles={["parent"]}><ParentDashboard /></ProtectedRoute>
            } />
            <Route path="/parent/messages" element={
              <ProtectedRoute allowedRoles={["parent", "provider"]}><Messages /></ProtectedRoute>
            } />
            <Route path="/provider/dashboard" element={
              <ProtectedRoute allowedRoles={["provider"]}><ProviderDashboard /></ProtectedRoute>
            } />
            <Route path="/provider/form-builder" element={
              <ProtectedRoute allowedRoles={["provider"]}><FormBuilder /></ProtectedRoute>
            } />
            <Route path="/provider/applications" element={
              <ProtectedRoute allowedRoles={["provider"]}><ApplicationInbox /></ProtectedRoute>
            } />
            <Route path="/provider/capacity" element={
              <ProtectedRoute allowedRoles={["provider"]}><CapacityDashboard /></ProtectedRoute>
            } />
            <Route path="/provider/payments" element={
              <ProtectedRoute allowedRoles={["provider"]}><PaymentDashboard /></ProtectedRoute>
            } />
            <Route path="/enroll/:token" element={<EnrollmentForm />} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
