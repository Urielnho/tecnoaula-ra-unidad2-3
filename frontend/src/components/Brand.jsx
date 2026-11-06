import { Link } from "react-router-dom";
export default function Brand({ light = false }) {
  return (
    <Link
      to="/"
      aria-label="TecnoAula, inicio"
      className={`brand ${light ? "brand--light" : ""}`}
    >
      <svg
        className="brand-mark"
        width="29"
        height="29"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="30" height="30" rx="7" fill="currentColor" />
        <path d="M8 9h16v4h-6v11h-4V13H8V9Z" className="brand-mark-letter" />
        <path d="M21 18h3v6h-3z" className="brand-mark-letter" />
      </svg>
      <span>
        TecnoAula<span className="brand-period">.</span>
      </span>
    </Link>
  );
}
