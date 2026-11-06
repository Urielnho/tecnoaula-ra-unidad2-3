import { useEffect, useRef, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LogOut,
  BookOpen,
  ExternalLink,
  Menu,
  X,
  UserRound,
  Globe2,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { API_URL } from "../api/client";
import Brand from "../components/Brand";
import PanelState from "../components/PanelState";
export default function AdminLayout() {
  const { auth, loading, logout, sessionError, restore } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);
  const sidebar = useRef(null);
  useEffect(() => {
    if (menuOpen) menuButton.current?.focus({ preventScroll: true });
    setMenuOpen(false);
    if (location.pathname !== "/dashboard") return;
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const elements = sidebar.current.querySelectorAll(
      "a[href], button:not([disabled])",
    );
    elements[0]?.focus();
    function keydown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === "Tab") {
        const first = elements[0],
          last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
    function resized() {
      if (window.innerWidth > 800) setMenuOpen(false);
    }
    document.addEventListener("keydown", keydown);
    window.addEventListener("resize", resized);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resized);
    };
  }, [menuOpen]);
  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }
  if (loading)
    return (
      <div className="session-loading">
        <Brand />
        <PanelState loading>Preparando tu espacio…</PanelState>
      </div>
    );
  if (sessionError)
    return (
      <div className="session-loading">
        <Brand />
        <PanelState error={sessionError} onRetry={restore} />
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
  const sections = [
    { hash: "", label: "Resumen", icon: LayoutDashboard },
    { hash: "#consultas", label: "Consultas", icon: Globe2 },
    { hash: "#perfil", label: "Mi cuenta", icon: UserRound },
    { hash: "#catalogo", label: "Catálogo", icon: Package },
  ];
  return (
    <div className="dashboard-shell">
      <a className="skip-link" href="#contenido">
        Ir al contenido
      </a>
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Cerrar navegación"
          onClick={closeMenu}
          tabIndex={-1}
        />
      )}
      <aside
        id="app-navigation"
        ref={sidebar}
        className={`sidebar ${menuOpen ? "is-open" : ""}`}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen || undefined}
        aria-label="Navegación principal"
      >
        <div className="sidebar-brand">
          <Brand light />
          <button
            className="icon-button mobile-close"
            aria-label="Cerrar menú"
            onClick={closeMenu}
          >
            <X size={19} />
          </button>
        </div>
        <div className="workspace-name">
          <span className="workspace-monogram">TA</span>
          <div>
            <strong>Espacio personal</strong>
            <span>TecnoAula</span>
          </div>
        </div>
        <nav aria-label="Secciones del Dashboard">
          <span className="nav-label">ESPACIO DE TRABAJO</span>
          {sections.map(({ hash, label, icon: Icon }) => (
            <Link
              key={label}
              to={`/dashboard${hash}`}
              className={`nav-item ${location.hash === hash ? "active" : ""}`}
              aria-current={location.hash === hash ? "location" : undefined}
            >
              <Icon size={17} strokeWidth={1.7} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-resources">
          <span className="nav-label">RECURSOS</span>
          <a
            className="nav-item"
            href={`${API_URL}/swagger/`}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={17} strokeWidth={1.7} />
            <span>Documentación</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-session">
            <ShieldCheck size={14} />
            <span>Sesión autenticada</span>
            <span className="status-dot" />
          </div>
          <div className="sidebar-user">
            <span className="avatar">{initials}</span>
            <div>
              <strong>{user.first_name || "Estudiante"}</strong>
              <small>{user.matricula}</small>
            </div>
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="dashboard-content">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              ref={menuButton}
              className="icon-button mobile-menu"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls="app-navigation"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={19} />
            </button>
            <span>Mi espacio</span>
            <span className="slash">/</span>
            <strong>
              {sections.find((s) => s.hash === location.hash)?.label ||
                "Resumen"}
            </strong>
          </div>
          <div className="topbar-right">
            <span className="session-pill">
              <span className="status-dot" />
              Sesión activa
            </span>
            <span className="avatar avatar-small" title={user.email}>
              {initials}
            </span>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}
