import { Outlet } from "react-router-dom";
import { ArrowUpRight, Cpu, Globe2, ShieldCheck } from "lucide-react";
import Brand from "../components/Brand";
export default function CommonLayout() {
  return (
    <div className="auth-shell">
      <aside className="auth-story">
        <Brand light />
        <div className="story-copy">
          <span className="eyebrow">TU PRÓXIMO PASO EMPIEZA AQUÍ</span>
          <h1>
            Un espacio para
            <br />
            aprender y <em>crear.</em>
          </h1>
          <p>
            La tecnología que necesitas, las conexiones que te llevan más lejos.
          </p>
          <div className="story-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="floating-icon">
              <Cpu size={75} strokeWidth={1} />
            </div>
            <span className="visual-tag">
              <Globe2 size={17} /> Conecta con el mundo{" "}
              <ArrowUpRight size={16} />
            </span>
            <span className="visual-dot" />
          </div>
        </div>
        <div className="story-footer">
          <ShieldCheck size={18} />
          <span>Tu aprendizaje, en buenas manos.</span>
          <span>01 / 03</span>
        </div>
      </aside>
      <main className="auth-main">
        <Outlet />
        <footer>TecnoAula · Tu espacio de aprendizaje</footer>
      </main>
    </div>
  );
}
