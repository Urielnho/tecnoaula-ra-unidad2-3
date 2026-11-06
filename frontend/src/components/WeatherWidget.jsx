import { useEffect, useState } from "react";
import {
  CloudSun,
  Sun,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  Droplets,
  Wind,
  ExternalLink,
} from "lucide-react";
import PanelState from "./PanelState";
import RefreshButton from "./RefreshButton";
function WeatherIcon({ code }) {
  const Icon =
    code === 0
      ? Sun
      : code <= 3
        ? CloudSun
        : code <= 48
          ? CloudFog
          : code <= 67
            ? CloudRain
            : code <= 77
              ? Snowflake
              : code <= 82
                ? CloudRain
                : CloudLightning;
  return <Icon size={25} strokeWidth={1.4} aria-hidden="true" />;
}
const cities = {
  hermosillo: { name: "Hermosillo", latitude: 29.07, longitude: -110.96 },
  cdmx: { name: "Ciudad de México", latitude: 19.43, longitude: -99.13 },
  monterrey: { name: "Monterrey", latitude: 25.68, longitude: -100.32 },
};
function description(code) {
  if (code === 0) return "Cielo despejado";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Niebla";
  if (code <= 67) return "Lluvia";
  if (code <= 77) return "Nieve";
  if (code <= 82) return "Chubascos";
  return "Tormenta o precipitación";
}
export default function WeatherWidget() {
  const [city, setCity] = useState("hermosillo");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setLoading(true);
    setError("");
    setWeather(null);
    const place = cities[city];
    const params = new URLSearchParams({
      latitude: place.latitude,
      longitude: place.longitude,
      current:
        "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      timezone: "auto",
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Clima no disponible.");
        return response.json();
      })
      .then((data) => {
        if (!data.current || typeof data.current.temperature_2m !== "number")
          throw new Error("Respuesta de clima inválida.");
        if (active) setWeather(data);
      })
      .catch((e) => {
        if (active)
          setError(
            e.name === "AbortError"
              ? "La consulta tardó demasiado. Vuelve a intentar."
              : "No se pudo cargar el clima. Intenta nuevamente.",
          );
      })
      .finally(() => {
        clearTimeout(timeout);
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [city, reload]);
  return (
    <article
      className="data-panel weather-card"
      aria-labelledby="weather-title"
      aria-busy={loading}
    >
      <div className="panel-heading">
        <div>
          <h3 id="weather-title">Clima local</h3>
          <p>Una mirada a tu ciudad.</p>
        </div>
        <RefreshButton
          label="Actualizar clima"
          loading={loading}
          onClick={() => setReload((x) => x + 1)}
        />
      </div>
      <div className="select-field">
        <label htmlFor="weather-city">Ciudad</label>
        <select
          id="weather-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          {Object.entries(cities).map(([key, item]) => (
            <option key={key} value={key}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="panel-content">
        {loading ? (
          <PanelState loading>Consultando el clima…</PanelState>
        ) : error ? (
          <PanelState error={error} onRetry={() => setReload((x) => x + 1)} />
        ) : (
          <div data-testid="weather-data">
            <div className="weather-reading">
              <div className="temperature">
                {Math.round(weather.current.temperature_2m)}
                <span>{weather.current_units.temperature_2m}</span>
              </div>
              <div className="weather-condition">
                <WeatherIcon code={weather.current.weather_code} />
                <span>{description(weather.current.weather_code)}</span>
              </div>
            </div>
            <dl className="weather-metrics">
              <div>
                <dt>
                  <Droplets size={14} aria-hidden="true" />
                  Humedad
                </dt>
                <dd>{weather.current.relative_humidity_2m}%</dd>
              </div>
              <div>
                <dt>
                  <Wind size={14} aria-hidden="true" />
                  Viento
                </dt>
                <dd>
                  {weather.current.wind_speed_10m}{" "}
                  <span>{weather.current_units.wind_speed_10m}</span>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
      <div className="panel-footer">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo <ExternalLink size={11} aria-hidden="true" />
        </a>
        {weather && !loading && (
          <span className="updated-at">
            {weather.current.time.replace("T", " · ")}{" "}
            <span className="time-zone">(hora local)</span>
          </span>
        )}
      </div>
    </article>
  );
}
