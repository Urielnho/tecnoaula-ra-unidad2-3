import { useEffect, useState } from "react";
import { ExternalLink, ShieldCheck, Cpu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { authRequest, API_URL } from "../../api/client";
import WeatherWidget from "../../components/WeatherWidget";
import CountryWidget from "../../components/CountryWidget";
import PanelState from "../../components/PanelState";
export default function Dashboard() {
  const { auth, logout } = useAuth();
  const user = auth.me;
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setProductError("");
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
  }, [logout, reload]);
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email;
  const date = new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Phoenix",
  }).format(new Date());
  return (
    <main className="dashboard-main" id="contenido" tabIndex={-1}>
      <header className="page-heading">
        <div>
          <span className="eyebrow">TU ESPACIO, A TU RITMO</span>
          <h1>Hola, {user.first_name || "estudiante"}.</h1>
          <p>Tu información, tus consultas y tu catálogo. En un solo lugar.</p>
        </div>
        <time className="date-label">{date}</time>
      </header>
      <section className="account-summary" aria-label="Resumen de tu cuenta">
        <div>
          <span className="status-dot" />
          <strong>Todo listo para continuar</strong>
          <p>
            Has iniciado sesión como <span>{user.email}</span>
          </p>
        </div>
        <a className="inline-link" href="#perfil">
          Ver mi cuenta
        </a>
      </section>
      <section
        id="consultas"
        className="dashboard-section"
        aria-labelledby="queries-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="queries-title">Tu entorno, conectado</h2>
            <p>Información actualizada para explorar más allá del aula.</p>
          </div>
          <span className="section-meta">Fuentes externas</span>
        </div>
        <div className="widgets-grid">
          <WeatherWidget />
          <CountryWidget />
        </div>
      </section>
      <div className="bottom-grid">
        <section
          className="profile-section dashboard-section"
          id="perfil"
          aria-labelledby="profile-title"
        >
          <div className="section-heading">
            <div>
              <h2 id="profile-title">Mi cuenta</h2>
              <p>La información de tu sesión actual.</p>
            </div>
            <ShieldCheck size={17} aria-hidden="true" />
          </div>
          <div className="profile-name">
            <span className="avatar profile-avatar">
              {(user.first_name?.[0] || user.email[0]).toUpperCase()}
            </span>
            <div>
              <h3>{name}</h3>
              <p>{user.email}</p>
            </div>
          </div>
          <dl className="profile-details">
            <div>
              <dt>Matrícula</dt>
              <dd>{user.matricula}</dd>
            </div>
            <div>
              <dt>Tipo de cuenta</dt>
              <dd>{user.is_staff ? "Administrador" : "Estudiante"}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>
                <span className="status-dot" />
                {user.is_active ? "Activa" : "Inactiva"}
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="catalogo"
          className="products-section dashboard-section"
          aria-labelledby="catalog-title"
        >
          <div className="section-heading">
            <div>
              <h2 id="catalog-title">Catálogo TecnoAula</h2>
              <p>Tecnología disponible para tu espacio de trabajo.</p>
            </div>
          </div>
          {loading ? (
            <PanelState loading>Cargando catálogo…</PanelState>
          ) : productError ? (
            <PanelState
              error={productError}
              onRetry={() => setReload((x) => x + 1)}
            />
          ) : products.length === 0 ? (
            <PanelState>Aún no hay productos en el catálogo.</PanelState>
          ) : (
            <div
              className="catalog-table"
              role="table"
              aria-label="Productos disponibles"
            >
              <div className="catalog-table-heading" role="row">
                <span role="columnheader">PRODUCTO</span>
                <span role="columnheader">PRECIO</span>
              </div>
              {products.map((product) => (
                <div className="product-row" role="row" key={product.id}>
                  <div className="product-cell" role="cell">
                    <span className="product-icon">
                      <Cpu size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.category}</p>
                    </div>
                  </div>
                  <strong role="cell">
                    {new Intl.NumberFormat("es-MX", {
                      style: "currency",
                      currency: "MXN",
                    }).format(product.price)}
                  </strong>
                </div>
              ))}
            </div>
          )}
          <a
            href={`${API_URL}/swagger/`}
            className="catalog-link inline-link"
            target="_blank"
            rel="noreferrer"
          >
            Consultar documentación de la API <ExternalLink size={13} />
          </a>
        </section>
      </div>
      <footer className="dashboard-footer">
        <span>TecnoAula</span>
        <span>Un espacio para seguir aprendiendo.</span>
      </footer>
    </main>
  );
}
