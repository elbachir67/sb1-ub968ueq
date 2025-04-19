import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import GoalsExplorerPage from "./pages/GoalsExplorerPage";
import GoalDetailPage from "./pages/GoalDetailPage";
import AssessmentPage from "./pages/AssessmentPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardPage from "./pages/DashboardPage";
import PathwayPage from "./pages/PathwayPage";
import QuizPage from "./pages/QuizPage";
import QuizResultsPage from "./pages/QuizResultsPage";
import ConceptAssessmentPage from "./pages/ConceptAssessmentPage";
import ConceptAssessmentResultsPage from "./pages/ConceptAssessmentResultsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function PrivateRoute({
  children,
  adminOnly = false,
  requireAssessment = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
  requireAssessment?: boolean;
}) {
  const { isAuthenticated, isAdmin, hasCompletedAssessment } = useAuth();

  if (!isAuthenticated) {
    // Store the current path to redirect back after login
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    return <Navigate to="/login" />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (requireAssessment && !hasCompletedAssessment) {
    return (
      <Navigate
        to="/assessment"
        state={{ returnPath: window.location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />

        <Route
          path="/goals"
          element={
            <PrivateRoute requireAssessment={true}>
              <GoalsExplorerPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/goals/:goalId"
          element={
            <PrivateRoute requireAssessment={true}>
              <GoalDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/pathways/:pathwayId"
          element={
            <PrivateRoute>
              <PathwayPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/pathways/:pathwayId/modules/:moduleId/quiz"
          element={
            <PrivateRoute>
              <QuizPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/pathways/:pathwayId/quiz-results"
          element={
            <PrivateRoute>
              <QuizResultsPage />
            </PrivateRoute>
          }
        />

        {/* New routes for P2 features */}
        <Route
          path="/concepts/:conceptId/assessment"
          element={
            <PrivateRoute>
              <ConceptAssessmentPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/concepts/:conceptId/assessment/results"
          element={
            <PrivateRoute>
              <ConceptAssessmentResultsPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
