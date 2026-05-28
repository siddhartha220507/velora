import { createBrowserRouter, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../auth/Login";
import Register from "../auth/Register";
import DashboardContent from "../components/dashboard/DashboardContent.jsx";
import Applications from "../components/ActiveLinks/Applications.jsx";
import Environments from "../components/ActiveLinks/Environments.jsx";
import DeploymentsPage from "../components/ActiveLinks/DeploymentsPage.jsx";
import Settings from "../components/ActiveLinks/Settings.jsx";
import Metrics from "../components/ActiveLinks/Metrics.jsx";
import DeploymentLogsPage from "../components/ActiveLinks/DeploymentLogsPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />, // Public Landing Page
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/dashboard",
    element: <DashboardContent />
  },
  {
    path: "/deploy",
    element: <DeploymentsPage />
  },
  {
    path: "/applications",
    element: <Applications />
  },
  {
    path: "/environments",
    element: <Environments />
  },
  {
    path: "/metrics",
    element: <Metrics />
  },
  {
    path: "/settings",
    element: <Settings />
  },
  {
    path:'deployments',
    element: <DeploymentLogsPage />
  },
  {
    path: "*",
    element: <Navigate to="/" />, // 404 handling - redirect to landing
  }
]);
