import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Loader } from "@/components/Loader";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};
