import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../api/client";
import Brand from "../components/Brand";
export default function AdminLayout() {
  const { auth, loading, logout, sessionError, restore } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="session-loading" role="status">
        Preparando tu espacio…
      </div>
    );
  if (sessionError)
    return (
      <div className="session-loading">
        <p role="alert">{sessionError}</p>
        <button className="primary-btn" onClick={restore}>
          Reintentar
        </button>
        <button className="text-button" onClick={logout}>
          Volver al inicio de sesión
        </button>
      </div>
    );
  if (!auth)
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  const user = auth.me;
  const initials =
    `${user.first_name?.[0] || user.email[0]}${user.last_name?.[0] || ""}`.toUpperCase();
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <Brand light />
        <span className="nav-label">MI ESPACIO</span>
        <NavLink to="/dashboard" className="nav-item">
          <LayoutDashboard size={20} />
          Dashboard
          <span className="nav-active-dot" />
        </NavLink>
        <a
          className="nav-item"
          href={`${API_URL}/swagger/`}
          target="_blank"
          rel="noreferrer"
        >
          <BookOpen size={20} />
          Documentación
          <ExternalLink size={14} />
        </a>
        <div className="sidebar-tip">
          <ShieldCheck size={25} />
          <strong>Conexión segura</strong>
          <p>Tu información personal está protegida con autenticación.</p>
        </div>
        <div className="sidebar-user">
          <span className="avatar">{initials}</span>
          <div>
            <strong>{user.first_name || "Estudiante"}</strong>
            <small>{user.matricula}</small>
          </div>
          <button
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            onClick={logout}
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>
      <div className="dashboard-content">
        <header className="topbar">
          <span>
            Mi espacio <span className="slash">/</span>{" "}
            <strong>Dashboard</strong>
          </span>
          <div className="topbar-right">
            <span className="session-pill">
              <span />
              Sesión activa
            </span>
            <span className="avatar avatar-small">{initials}</span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
