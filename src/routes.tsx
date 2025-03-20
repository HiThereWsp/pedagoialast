import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { SubscriptionRoute } from "./routes/SubscriptionRoute";
import { AuthRoute } from "./routes/AuthRoute";
import { LoadingPage } from "./pages/LoadingPage";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ErrorPage } from "./pages/ErrorPage";

// Lazy-loaded components
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const LessonPlanPage = lazy(() => import("./pages/LessonPlanPage"));
const ExercisePage = lazy(() => import("./pages/ExercisePage"));
const CorrespondencePage = lazy(() => import("./pages/CorrespondencePage"));
const ImageGenerationPage = lazy(() => import("./pages/ImageGenerationPage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/SubscriptionSuccessPage"));
const SubscriptionFailedPage = lazy(() => import("./pages/SubscriptionFailedPage"));
const PaymentSuccessPage = lazy(() => import("./pages/PaymentSuccessPage"));
const PaymentFailurePage = lazy(() => import("./pages/PaymentFailurePage"));
const AdminSubscriptionRepairPage = lazy(() => import("./pages/AdminSubscriptionRepairPage"));

// Wrap component with error boundary and suspense
const withErrorBoundary = (Component) => (
  <ErrorBoundary fallback={<ErrorPage />}>
    <Suspense fallback={<LoadingPage />}>
      {Component}
    </Suspense>
  </ErrorBoundary>
);

export const routes = [
  {
    path: "/",
    element: withErrorBoundary(<HomePage />),
  },
  {
    path: "/login",
    element: withErrorBoundary(<LoginPage />),
  },
  {
    path: "/register",
    element: withErrorBoundary(<RegisterPage />),
  },
  {
    path: "/forgot-password",
    element: withErrorBoundary(<ForgotPasswordPage />),
  },
  {
    path: "/reset-password",
    element: withErrorBoundary(<ResetPasswordPage />),
  },
  {
    path: "/home",
    element: withErrorBoundary(
      <AuthRoute>
        <HomePage />
      </AuthRoute>
    ),
  },
  {
    path: "/tableaudebord",
    element: withErrorBoundary(
      <AuthRoute>
        <DashboardPage />
      </AuthRoute>
    ),
  },
  {
    path: "/chat",
    element: withErrorBoundary(
      <AuthRoute>
        <SubscriptionRoute>
          <ChatPage />
        </SubscriptionRoute>
      </AuthRoute>
    ),
  },
  {
    path: "/pricing",
    element: withErrorBoundary(<PricingPage />),
  },
  {
    path: "/settings",
    element: withErrorBoundary(
      <AuthRoute>
        <SettingsPage />
      </AuthRoute>
    ),
  },
  {
    path: "/profile",
    element: withErrorBoundary(
      <AuthRoute>
        <ProfilePage />
      </AuthRoute>
    ),
  },
  {
    path: "/lesson-plan",
    element: withErrorBoundary(
      <AuthRoute>
        <SubscriptionRoute>
          <LessonPlanPage />
        </SubscriptionRoute>
      </AuthRoute>
    ),
  },
  {
    path: "/exercise",
    element: withErrorBoundary(
      <AuthRoute>
        <SubscriptionRoute>
          <ExercisePage />
        </SubscriptionRoute>
      </AuthRoute>
    ),
  },
  {
    path: "/correspondence",
    element: withErrorBoundary(
      <AuthRoute>
        <SubscriptionRoute>
          <CorrespondencePage />
        </SubscriptionRoute>
      </AuthRoute>
    ),
  },
  {
    path: "/image-generation",
    element: withErrorBoundary(
      <AuthRoute>
        <SubscriptionRoute>
          <ImageGenerationPage />
        </SubscriptionRoute>
      </AuthRoute>
    ),
  },
  {
    path: "/subscription/success",
    element: withErrorBoundary(<SubscriptionSuccessPage />),
  },
  {
    path: "/subscription/failed",
    element: withErrorBoundary(<SubscriptionFailedPage />),
  },
  {
    path: "/payment/success",
    element: withErrorBoundary(<PaymentSuccessPage />),
  },
  {
    path: "/payment/failure",
    element: withErrorBoundary(<PaymentFailurePage />),
  },
  {
    path: "/admin/repair-subscription",
    element: withErrorBoundary(
      <AuthRoute>
        <AdminSubscriptionRepairPage />
      </AuthRoute>
    ),
    auth: true,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
