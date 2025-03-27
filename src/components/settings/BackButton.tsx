import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
interface BackButtonProps {
  fallbackPath?: string;
}
export const BackButton = ({
  fallbackPath = "/tableaudebord"
}: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const handleBack = () => {
    console.log("Handling back button click from:", location.pathname);

    // Special case handling for specific routes
    if (location.pathname === '/privacy' || location.pathname === '/terms') {
      console.log("Navigating from legal page to /legal");
      navigate('/legal');
      return;
    }
    if (location.pathname === '/legal') {
      console.log("Navigating from legal index to dashboard");
      navigate('/tableaudebord');
      return;
    }
    if (location.pathname === '/suggestions') {
      console.log("Navigating from suggestions to dashboard");
      navigate('/tableaudebord');
      return;
    }

    // For tool pages, always navigate to the dashboard
    if (location.pathname === '/lesson-plan' || location.pathname === '/exercise' || location.pathname === '/generate-image' || location.pathname === '/correspondence') {
      console.log("Navigating from tool page to dashboard");
      navigate('/tableaudebord');
      return;
    }

    // For all other pages, try history first but fallback to the provided path
    if (window.history.length > 2) {
      console.log("Using browser history navigation");
      navigate(-1);
    } else {
      console.log("Using fallback path navigation to:", fallbackPath);
      navigate(fallbackPath);
    }
  };
  return;
};