
import { createBrowserRouter } from "react-router-dom";
import App from "./App";

// This file is kept for backwards compatibility
// All routing is now handled in src/routes/AppRoutes.tsx

const router = createBrowserRouter([
  {
    path: "*",
    element: <App />,
  },
]);

export default router;
