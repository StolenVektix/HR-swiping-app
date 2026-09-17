import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import EmployerDashboard from "./pages/EmployerDashboard";
import WorkerFilters from "./pages/WorkerFilters";
import WorkerSwipe from "./pages/WorkerSwipe";
import WorkerMatches from "./pages/WorkerMatches";

function RequireRole({ role, children }) {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/employer"
        element={
          <RequireRole role="employer">
            <EmployerDashboard />
          </RequireRole>
        }
      />

      <Route
        path="/worker"
        element={
          <RequireRole role="worker">
            <WorkerSwipe />
          </RequireRole>
        }
      />
      <Route
        path="/worker/filters"
        element={
          <RequireRole role="worker">
            <WorkerFilters />
          </RequireRole>
        }
      />
      <Route
        path="/worker/matches"
        element={
          <RequireRole role="worker">
            <WorkerMatches />
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
