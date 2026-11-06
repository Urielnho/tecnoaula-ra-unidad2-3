import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ShieldCheck,
  GraduationCap,
  Package,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authRequest, API_URL } from "../../api/client";
import WeatherWidget from "../../components/WeatherWidget";
import CountryWidget from "../../components/CountryWidget";
export default function Dashboard() {
  const { auth, logout } = useAuth();
  const user = auth.me;
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    authRequest("/products/")
      .then((data) => {
        if (active)
          setProducts(Array.isArray(data) ? data : data.results || []);
      })
      .catch((error) => {
        if (active) {
          if (error.status === 401) logout();
          else setProductError("No se pudieron cargar los productos.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [logout]);
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  return (
    <main className="dashboard-main">
      <div className="page-heading">
        <div>
          <span className="section-number">UN BUEN DÍA PARA DESCUBRIR</span>
          <h1>
            Hola, {user.first_name || "estudiante"}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Todo lo que necesitas, en un mismo espacio.</p>
        </div>
        <span className="date-label">Tu espacio de aprendizaje</span>
      </div>
      <section className="welcome-banner">
        <div>
          <span className="banner-label">SIGUE CONSTRUYENDO TU CAMINO</span>
          <h2>
            Las grandes ideas
            <br />
            empiezan con curiosidad.
          </h2>
          <p>Explora, conecta y haz que cada día cuente.</p>
        </div>
        <div className="banner-art" aria-hidden="true">
          <div className="banner-orbit" />
          <GraduationCap size={110} strokeWidth={1} />
          <span className="art-star">✦</span>
          <ArrowUpRight size={30} className="art-arrow" />
        </div>
      </section>
      <div className="section-heading">
        <h2>Tu día, conectado</h2>
        <span>Un poco de información. Muchas posibilidades.</span>
      </div>
      <section className="widgets-grid">
        <WeatherWidget />
        <CountryWidget />
      </section>
      <section className="bottom-grid">
        <article className="card profile-card">
          <div className="card-heading">
            <div>
              <span className="overline">HECHO PARA TI</span>
              <h3>Tu perfil de estudiante</h3>
            </div>
            <ShieldCheck size={23} />
          </div>
          <div className="profile-name">
            <span className="avatar profile-avatar">
              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
            </span>
            <div>
              <h4>{name}</h4>
              <p>{user.email}</p>
            </div>
          </div>
          <dl className="profile-details">
            <div>
              <dt>Matrícula</dt>
              <dd>{user.matricula}</dd>
            </div>
            <div>
              <dt>Cuenta</dt>
              <dd>
                <span className="status-dot" />
                {user.is_staff ? "Administrador" : "Estudiante"}
              </dd>
            </div>
          </dl>
          <p className="profile-note">
            <ShieldCheck size={14} />
            Estos datos pertenecen a tu sesión autenticada.
          </p>
        </article>
        <article className="card products-card">
          <div className="card-heading">
            <div>
              <span className="overline">EQUÍPATE PARA CREAR</span>
              <h3>En TecnoAula</h3>
            </div>
            <Package size={23} />
          </div>
          {loading ? (
            <p role="status">Cargando productos…</p>
          ) : productError ? (
            <p role="alert">{productError}</p>
          ) : products.length === 0 ? (
            <p>Aún no hay productos en el catálogo.</p>
          ) : (
            products.slice(0, 2).map((product) => (
              <div className="product-row" key={product.id}>
                <span className="product-icon">
                  <Cpu size={29} />
                </span>
                <div>
                  <h4>{product.name}</h4>
                  <p>{product.category}</p>
                </div>
                <strong>
                  {new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                  }).format(product.price)}
                </strong>
              </div>
            ))
          )}
          <a
            href={`${API_URL}/swagger/`}
            target="_blank"
            rel="noreferrer"
            className="catalog-link"
          >
            Explorar la API de TecnoAula <ArrowRight size={16} />
          </a>
        </article>
      </section>
      <footer className="dashboard-footer">
        <span>TecnoAula · Aprende. Conecta. Crea.</span>
        <span>
          Hecho para seguir aprendiendo <span className="tiny-star">✦</span>
        </span>
      </footer>
    </main>
  );
}
