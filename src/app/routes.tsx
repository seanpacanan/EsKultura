import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { CoordinatorDashboard } from "./pages/CoordinatorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Landing },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      {
        path: "onboarding",
        element: <ProtectedRoute allowIncompleteProfile><Onboarding /></ProtectedRoute>,
      },
      {
        path: "dashboard",
        element: <ProtectedRoute allowedRoles={["viewer"]}><Dashboard /></ProtectedRoute>,
      },
      {
        path: "coordinator",
        element: <ProtectedRoute allowedRoles={["coordinator", "admin"]}><CoordinatorDashboard /></ProtectedRoute>,
      },
      {
        path: "admin",
        element: <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>,
      },
      { path: "*", Component: NotFound },
    ],
  },
]);
