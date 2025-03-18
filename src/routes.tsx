
import { createBrowserRouter } from "react-router-dom";
import Landing from "./pages/Landing";
import PricingPage from "./pages/PricingPage";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ConfirmEmail from "./pages/ConfirmEmail";
import ContactPage from "./pages/ContactPage";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Legal from "./pages/Legal";
import TableauDeBord from "./pages/TableauDeBord";
import ExercisePage from "./pages/ExercisePage";
import LessonPlanPage from "./pages/LessonPlanPage";
import CorrespondencePage from "./pages/CorrespondencePage";
import ImageGenerationPage from "./pages/ImageGenerationPage";
import Bienvenue from "./pages/Bienvenue";
import SavedContentPage from "./pages/SavedContentPage";
import Settings from "./pages/Settings";
import Guide from "./pages/Guide";

// Import the new admin page
import BrevoSyncPage from "./pages/admin/BrevoSyncPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/bienvenue",
    element: <Bienvenue />,
  },
  {
    path: "/pricing",
    element: <PricingPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/confirm-email",
    element: <ConfirmEmail />,
  },
  {
    path: "/contact",
    element: <ContactPage />,
  },
  {
    path: "/terms",
    element: <Terms />,
  },
  {
    path: "/privacy",
    element: <Privacy />,
  },
  {
    path: "/legal",
    element: <Legal />,
  },
  {
    path: "/dashboard",
    element: <TableauDeBord />,
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
    path: "/saved-content",
    element: <SavedContentPage />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/guide",
    element: <Guide />,
  },
  
  // Add the admin route for Brevo sync
  {
    path: "/admin/brevo-sync",
    element: <BrevoSyncPage />,
  },
]);

export default router;
