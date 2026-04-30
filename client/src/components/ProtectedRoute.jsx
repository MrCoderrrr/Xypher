import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="mx-auto max-w-7xl px-6 py-20">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={user.role === "admin" ? "/admin" : user.role === "creator" ? "/creator-dashboard" : "/dashboard"} replace />;
  return children;
}

export default ProtectedRoute;
