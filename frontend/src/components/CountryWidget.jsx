import { useEffect, useState } from "react";
import { Globe2, ArrowUpRight, RefreshCw, MapPin } from "lucide-react";
import { authRequest } from "../api/client";
import { useAuth } from "../hooks/useAuth";
export default function CountryWidget() {
  const [code, setCode] = useState("MX");
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const { logout } = useAuth();
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setCountry(null);
    authRequest(`/integrations/country/?code=${code}`)
      .then((result) => {
        if (active) setCountry(result);
      })
      .catch((e) => {
        if (active) {
          if (e.status === 401) logout();
          else
            setError(
              e.message === "Failed to fetch"
                ? "No se pudo conectar con Django."
                : e.message,
            );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [code, reload, logout]);
  return (
    <article className="card country-card" aria-labelledby="country-title">
      <div className="card-heading">
        <div>
          <span className="overline">MÁS ALLÁ DEL AULA</span>
          <h3 id="country-title">Conoce el mundo</h3>
        </div>
        <span className="icon-badge warm">
          <Globe2 size={24} />
        </span>
      </div>
      <label className="sr-only" htmlFor="country-code">
        País a consultar
      </label>
      <select
        id="country-code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      >
        <option value="MX">México</option>
        <option value="US">Estados Unidos</option>
        <option value="CA">Canadá</option>
        <option value="ES">España</option>
      </select>
      {loading ? (
        <p role="status" className="widget-loading">
          Consultando información del país…
        </p>
      ) : error ? (
        <div className="widget-error" role="alert">
          {error}
        </div>
      ) : (
        <div data-testid="country-data">
          <div className="country-title">
            <span className="country-code">{country.code}</span>
            <div>
              <h4>{country.name}</h4>
              <span>
                <MapPin size={13} />
                {country.capital}
              </span>
            </div>
          </div>
          <div className="country-details">
            <div>
              <span>MONEDA</span>
              <strong>{country.currency}</strong>
            </div>
            <div>
              <span>PREFIJO</span>
              <strong>+{country.phone_code}</strong>
            </div>
            <div>
              <span>IDIOMA</span>
              <strong>{country.languages.join(", ") || "No disponible"}</strong>
            </div>
          </div>
          <p className="updated-at">
            Consulta:{" "}
            {new Date(country.fetched_at).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
      <div className="card-footer">
        <span className="source-label">CountryInfoService · SOAP</span>
        <button
          onClick={() => setReload((x) => x + 1)}
          disabled={loading}
          aria-label="Actualizar país"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </article>
  );
}
