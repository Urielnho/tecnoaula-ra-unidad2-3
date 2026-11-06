import { useEffect, useState } from "react";
import PanelState from "./PanelState";
import RefreshButton from "./RefreshButton";
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
    <article
      className="data-panel country-card"
      aria-labelledby="country-title"
      aria-busy={loading}
    >
      <div className="panel-heading">
        <div>
          <h3 id="country-title">Explora un país</h3>
          <p>Datos para ampliar tu perspectiva.</p>
        </div>
        <RefreshButton
          label="Actualizar país"
          loading={loading}
          onClick={() => setReload((x) => x + 1)}
        />
      </div>
      <div className="select-field">
        <label htmlFor="country-code">País</label>
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
      </div>
      <div className="panel-content">
        {loading ? (
          <PanelState loading>Consultando información del país…</PanelState>
        ) : error ? (
          <PanelState error={error} onRetry={() => setReload((x) => x + 1)} />
        ) : (
          <div data-testid="country-data">
            <div className="country-reading">
              <div>
                <h4>{country.name}</h4>
                <p>{country.capital}</p>
              </div>
              <span className="country-code">{country.code}</span>
            </div>
            <dl className="country-details">
              <div>
                <dt>Moneda</dt>
                <dd>{country.currency}</dd>
              </div>
              <div>
                <dt>Prefijo</dt>
                <dd>+{country.phone_code}</dd>
              </div>
              <div>
                <dt>Idioma</dt>
                <dd>{country.languages.join(", ") || "No disponible"}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      <div className="panel-footer">
        <span>CountryInfoService</span>
        {country && !loading && (
          <span className="updated-at">
            Consultado a las{" "}
            {new Date(country.fetched_at).toLocaleTimeString("es-MX", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </article>
  );
}
