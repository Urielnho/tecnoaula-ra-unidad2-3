import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function Home() {
  const { auth, loading } = useAuth();
  if (loading) return <div className="session-loading">Cargando…</div>;
  return <Navigate to={auth ? "/dashboard" : "/login"} replace />;
}
