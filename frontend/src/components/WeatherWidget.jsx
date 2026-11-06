import { useEffect, useState } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
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
    <article className="card weather-card" aria-labelledby="weather-title">
      <div className="card-heading">
        <div>
          <span className="overline">UN VISTAZO AFUERA</span>
          <h3 id="weather-title">El clima de hoy</h3>
        </div>
        <span className="icon-badge">
          <CloudSun size={24} />
        </span>
      </div>
      <label className="sr-only" htmlFor="weather-city">
        Ciudad del clima
      </label>
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
      {loading ? (
        <p role="status" className="widget-loading">
          Consultando el clima…
        </p>
      ) : error ? (
        <div className="widget-error" role="alert">
          {error}
        </div>
      ) : (
        <div data-testid="weather-data">
          <div className="temperature">
            {Math.round(weather.current.temperature_2m)}
            <span>{weather.current_units.temperature_2m}</span>
            <CloudSun size={66} strokeWidth={1} />
          </div>
          <p className="weather-description">
            {description(weather.current.weather_code)}
          </p>
          <div className="weather-metrics">
            <span>
              <Droplets size={16} />
              {weather.current.relative_humidity_2m}% humedad
            </span>
            <span>
              <Wind size={16} />
              {weather.current.wind_speed_10m}{" "}
              {weather.current_units.wind_speed_10m}
            </span>
          </div>
          <p className="updated-at">
            Lectura: {weather.current.time.replace("T", " · ")} (hora local)
          </p>
        </div>
      )}
      <div className="card-footer">
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo <ExternalLink size={12} />
        </a>
        <button
          onClick={() => setReload((x) => x + 1)}
          disabled={loading}
          aria-label="Actualizar clima"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </article>
  );
}
