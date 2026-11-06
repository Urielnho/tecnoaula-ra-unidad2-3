import { Link } from "react-router-dom";
export default function Error404() {
  return (
    <section className="auth-card">
      <span className="section-number">404</span>
      <h1>Esta página no está aquí.</h1>
      <p>Vuelve a tu espacio para continuar.</p>
      <Link className="primary-btn" to="/dashboard">
        Ir al Dashboard
      </Link>
    </section>
  );
}
