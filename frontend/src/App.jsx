import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/AppShell";
import useAuthStore from "./store/useAuthStore";
import Analysis from "./pages/Analysis";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Monitoring from "./pages/Monitoring";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Upload from "./pages/Upload";

// Which roles can reach each protected route
const ROLE_ROUTES = {
  "/upload":     ["admin", "analyst"],
  "/analysis":   ["admin", "analyst"],
  "/monitoring": ["admin", "analyst"],
  "/settings":   ["admin"],
};

/** Redirect unauthenticated users to /login */
function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

/** Redirect users who lack the required role to /dashboard */
function RequireRole({ allowedRoles, children }) {
  const role = useAuthStore((s) => s.role);
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppLayout() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* All authenticated users */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports"   element={<Reports />} />

        {/* Admin + Analyst only */}
        <Route
          path="/upload"
          element={
            <RequireRole allowedRoles={ROLE_ROUTES["/upload"]}>
              <Upload />
            </RequireRole>
          }
        />
        <Route
          path="/analysis"
          element={
            <RequireRole allowedRoles={ROLE_ROUTES["/analysis"]}>
              <Analysis />
            </RequireRole>
          }
        />

        {/* Admin + Analyst */}
        <Route
          path="/monitoring"
          element={
            <RequireRole allowedRoles={ROLE_ROUTES["/monitoring"]}>
              <Monitoring />
            </RequireRole>
          }
        />

        {/* Admin only */}
        <Route
          path="/settings"
          element={
            <RequireRole allowedRoles={ROLE_ROUTES["/settings"]}>
              <Settings />
            </RequireRole>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  const user = useAuthStore((s) => s.user);

  return (
    <Routes>
      {/* Auth pages — redirect away if already signed in */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Everything else requires authentication */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
