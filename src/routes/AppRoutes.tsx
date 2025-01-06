import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { ProtectedLayout } from "@/components/layout/ProtectedLayout"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Home from "@/pages/Home"
import NotFound from "@/pages/NotFound"
import Settings from "@/pages/Settings"
import MetricsPage from "@/pages/MetricsPage"
import WaitlistLanding from "@/pages/WaitlistLanding"
import CorrespondencePage from "@/pages/CorrespondencePage"
import LessonPlanPage from "@/pages/LessonPlanPage"
import { ExerciseGenerator } from "@/components/exercise/ExerciseGenerator"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "/waitlist",
    element: <WaitlistLanding />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <ProtectedLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "metrics",
        element: <MetricsPage />,
      },
      {
        path: "correspondence",
        element: <CorrespondencePage />,
      },
      {
        path: "lesson-plan",
        element: <LessonPlanPage />,
      },
      {
        path: "differenciation",
        element: <ExerciseGenerator />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}