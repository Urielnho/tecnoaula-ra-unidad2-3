import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
export default function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? "brand--light" : ""}`}>
      <span className="brand-icon">
        <BookOpen size={23} strokeWidth={1.8} />
      </span>
      <span>
        Tecno<span className="brand-accent">Aula</span>
        <small>APRENDE. CONECTA. CREA.</small>
      </span>
    </Link>
  );
}
