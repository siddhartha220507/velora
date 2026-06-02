import React, { lazy, Suspense, useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import VeloraLoader from "./components/ui/VeloraLoader";

// Lazy loading all pages for God-level speed ðŸš€
const Landing = lazy(() => import("./pages/public/Landing"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Callback = lazy(() => import("./pages/auth/Callback"));
const Dashboard = lazy(() => import("./pages/main_dashboard/Dashboard"));
const Deployments = lazy(() => import("./pages/project_view/Deployments"));
const Projects = lazy(() => import("./pages/project_view/Projects"));
const Settings = lazy(() => import("./pages/project_view/Settings"));
const Environments = lazy(() => import("./pages/project_view/Environments"));
const DeploymentLogsPage = lazy(() => import("./pages/project_view/Terminal"));
const NewProjectPage = lazy(() => import("./pages/main_dashboard/NewProject"));
const Account = lazy(() => import("./pages/main_dashboard/Account"));
const Members = lazy(() => import("./pages/main_dashboard/Members"));
const Integrations = lazy(() => import("./pages/main_dashboard/Integrations"));
const LogsExplorer = lazy(() => import("./pages/main_dashboard/LogsExplorer"));
const DeploymentProgress = lazy(() => import("./pages/main_dashboard/DeploymentProgress"));
const Docs = lazy(() => import("./pages/Extra/Docs"));
const AcceptInvite = lazy(() => import("./pages/auth/AcceptInvite"));

import "./App.css";

import { useAuth } from "./context/AuthContext";

// Root Layout to handle global transitions
const RootLayout = () => {
  const { loading: authLoading } = useAuth();
  const [showLoader, setShowLoader] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // If auth is done loading, we can start the exit timer
    // We still use a small timeout to ensure everything is settled
    if (!authLoading) {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [authLoading]);

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-x-hidden">
      <AnimatePresence mode="wait">
        {showLoader && (
          <motion.div
            key="global-loader"
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={{ 
              y: '-100%',
              transition: { duration: 0.5, ease: "circOut" } // Faster exit
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]"
          >
            <VeloraLoader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background content â€” subtle fade for lite feel */}
      <motion.div
        animate={{ 
          opacity: showLoader ? 0 : 1,
          scale: showLoader ? 0.99 : 1
        }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        <Outlet />
      </motion.div>
    </div>
  );
};

const PageLoader = () => <VeloraLoader />;

import ProtectedRoute from "./components/auth/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Landing />, 
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
        path: "/auth/success",
        element: <Callback />,
      },
      {
        path: "/accept-invite",
        element: <ProtectedRoute><AcceptInvite /></ProtectedRoute>,
      },
      {
        path: "/success",
        element: <Callback />,
      },
	{
        path: "/callback", // í±ˆ Yeh zaroor rakhna agar backend /callback par redirect kare
        element: <Callback />,
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>
      },
      {
        path: "/projects/new",
        element: <ProtectedRoute><NewProjectPage /></ProtectedRoute>
      },
      {
        path: "/deploy",
        element: <ProtectedRoute><Deployments /></ProtectedRoute>
      },
      {
        path: "/deployment-progress/:projectId",
        element: <ProtectedRoute><DeploymentProgress /></ProtectedRoute>
      },
      {
        path: "/deploy/logs/:deploymentId",
        element: <ProtectedRoute><DeploymentLogsPage /></ProtectedRoute>
      },
      {
        path: "/applications",
        element: <ProtectedRoute><Projects /></ProtectedRoute>
      },
      {
        path: "/projects",
        element: <ProtectedRoute><Projects /></ProtectedRoute>
      },
      {
        path: "/environments",
        element: <ProtectedRoute><Environments /></ProtectedRoute>
      },
      {
        path: "/logs",
        element: <ProtectedRoute><LogsExplorer /></ProtectedRoute>
      },
      {
        path: "/history",
        element: <ProtectedRoute><Projects /></ProtectedRoute>
      },
      {
        path: "/settings",
        element: <ProtectedRoute><Settings /></ProtectedRoute>
      },
      {
        path: "/account",
        element: <ProtectedRoute><Account /></ProtectedRoute>
      },
      {
        path: "/members",
        element: <ProtectedRoute><Members /></ProtectedRoute>
      },
      {
        path: "/integrations",
        element: <ProtectedRoute><Integrations /></ProtectedRoute>
      },
      {
        path: "/documentation",
        element: <Docs />
      },
      {
        path: "*",
        element: <Navigate to="/" />, 
      }
    ]
  }
]);

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

const App = () => {
  return (
    <ReactLenis root options={{ 
      lerp: 0.1, 
      duration: 1.5, 
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    }}>
      <Suspense fallback={<PageLoader />}>
        <RouterProvider router={router} />
      </Suspense>
    </ReactLenis>
  );
};

export default App;
