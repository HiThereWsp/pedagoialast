
import React from 'react';
import { Navigate } from "react-router-dom";
import { SubscriptionRoute } from "./routes/SubscriptionRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import AdminSubscriptionRepairPage from "./pages/AdminSubscriptionRepairPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Suspense } from "react";

// Wrap component with error boundary and suspense
const withErrorBoundary = (Component) => (
  <ErrorBoundary fallback={<div>An error occurred</div>}>
    <Suspense fallback={<div>Loading...</div>}>
      {Component}
    </Suspense>
  </ErrorBoundary>
);

export const routes = [
  {
    path: "/",
    element: withErrorBoundary(<Navigate to="/bienvenue" replace />),
  },
  {
    path: "/login",
    element: withErrorBoundary(<Login />),
  },
  {
    path: "/forgot-password",
    element: withErrorBoundary(<ForgotPassword />),
  },
  {
    path: "/confirm-email",
    element: withErrorBoundary(<ConfirmEmail />),
  },
  {
    path: "/home",
    element: withErrorBoundary(
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/tableaudebord",
    element: withErrorBoundary(
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/repair-subscription",
    element: withErrorBoundary(
      <ProtectedRoute>
        <AdminSubscriptionRepairPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
