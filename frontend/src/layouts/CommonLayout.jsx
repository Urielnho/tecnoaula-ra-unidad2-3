import { Outlet } from "react-router-dom";
import Brand from "../components/Brand";
export default function CommonLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Brand light />
        <div className="story-copy">
          <span className="eyebrow">ESPACIO DE APRENDIZAJE</span>
          <h2>
            Menos distracciones.
            <br />
            Más posibilidades.
          </h2>
          <p>
            Un lugar para tu información, tus consultas y la tecnología que
            necesitas.
          </p>
          <dl className="auth-capabilities">
            <div>
              <dt>01</dt>
              <dd>Tu cuenta, en un solo espacio.</dd>
            </div>
            <div>
              <dt>02</dt>
              <dd>Información conectada con el mundo.</dd>
            </div>
            <div>
              <dt>03</dt>
              <dd>Tecnología para seguir creando.</dd>
            </div>
          </dl>
        </div>
        <div className="story-footer">
          <span>TecnoAula</span>
          <span>Aprende. Conecta. Crea.</span>
        </div>
      </aside>
      <main className="auth-main">
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <Outlet />
        <footer>Tu espacio de aprendizaje.</footer>
      </main>
    </div>
  );
}
