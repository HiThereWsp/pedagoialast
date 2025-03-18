import { createBrowserRouter } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ContactPage from "./pages/ContactPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import LegalPage from "./pages/LegalPage";
import DashboardPage from "./pages/DashboardPage";
import ExercisePage from "./pages/ExercisePage";
import LessonPlanPage from "./pages/LessonPlanPage";
import CorrespondencePage from "./pages/CorrespondencePage";
import ImageGenerationPage from "./pages/ImageGenerationPage";
import BugReportPage from "./pages/BugReportPage";
import WelcomePage from "./pages/WelcomePage";

// Import the new admin page
import BrevoSyncPage from "./pages/admin/BrevoSyncPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/bienvenue",
    element: <WelcomePage />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "/confirm-email",
    element: <ConfirmEmailPage />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/terms",
    element: <TermsPage />,
  },
  {
    path: "/privacy",
    element: <PrivacyPage />,
  },
  {
    path: "/legal",
    element: <LegalPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
  {
    path: "/exercise",
    element: <ExercisePage />,
  },
  {
    path: "/lesson-plan",
    element: <LessonPlanPage />,
  },
  {
    path: "/correspondence",
    element: <CorrespondencePage />,
  },
  {
    path: "/image-generation",
    element: <ImageGenerationPage />,
  },
  {
    path: "/bug-report",
    element: <BugReportPage />,
  },
  
  // Add the admin route for Brevo sync
  {
    path: "/admin/brevo-sync",
    element: <BrevoSyncPage />,
  },
]);

export default router;
