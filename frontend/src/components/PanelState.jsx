import { CircleAlert, LoaderCircle } from "lucide-react";
export default function PanelState({
  loading = false,
  error,
  children,
  onRetry,
}) {
  return (
    <div
      className={`panel-state ${error ? "panel-state--error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {loading ? (
        <LoaderCircle className="spinner" size={17} aria-hidden="true" />
      ) : error ? (
        <CircleAlert size={18} aria-hidden="true" />
      ) : null}
      <p>{error || children}</p>
      {onRetry && !loading && (
        <button className="text-button" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
