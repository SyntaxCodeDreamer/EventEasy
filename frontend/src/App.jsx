import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { EventProvider } from "./context/EventContext";

import LandingPage from "./pages/LandingPage";
import { Login, Register } from "./pages/AuthPages";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import CreateEventPage from "./pages/CreateEventPage";
import AIEventPlannerPage from "./pages/AIEventPlannerPage";
import WhatIfSimulatorPage from "./pages/WhatIfSimulatorPage";
import ThemeStudioPage from "./pages/ThemeStudioPage";
import BudgetStudioPage from "./pages/BudgetStudioPage";
import SmartTimelinePage from "./pages/SmartTimelinePage";
import VendorHubPage from "./pages/VendorHubPage";
import GuestManagementPage from "./pages/GuestManagementPage";
import RiskManagementPage from "./pages/RiskManagementPage";
import CommunityEventPage from "./pages/CommunityEventPage";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center text-purple-400 font-semibold text-sm">
        Authenticating EventEase Session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EventProvider>
          <Routes>
            {/* Public Marketing & Auth */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected SaaS App Workspace */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="create-event" element={<CreateEventPage />} />
              <Route path="planner" element={<AIEventPlannerPage />} />
              <Route path="simulator" element={<WhatIfSimulatorPage />} />
              <Route path="theme-studio" element={<ThemeStudioPage />} />
              <Route path="budget" element={<BudgetStudioPage />} />
              <Route path="timeline" element={<SmartTimelinePage />} />
              <Route path="vendors" element={<VendorHubPage />} />
              <Route path="guests" element={<GuestManagementPage />} />
              <Route path="risks" element={<RiskManagementPage />} />
              <Route path="community" element={<CommunityEventPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </EventProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

