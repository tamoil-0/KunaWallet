import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ToastContainer } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Landing = lazy(() => import("@/pages/Landing"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const AIAdvisor = lazy(() => import("@/pages/AIAdvisor"));
const Goals = lazy(() => import("@/pages/Goals"));
const Transactions = lazy(() => import("@/pages/Transactions"));
const Learn = lazy(() => import("@/pages/Learn"));
const Invest = lazy(() => import("@/pages/Invest"));
const Profile = lazy(() => import("@/pages/Profile"));

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-gold flex items-center justify-center font-display font-bold text-bg-primary text-xl animate-pulse-slow">
          K
        </div>
        <p className="text-sm text-text-secondary">Cargando...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/ai-advisor" element={<AIAdvisor />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/invest" element={<Invest />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
