import { RefreshCw } from "lucide-react";
export default function RefreshButton({ label, loading, onClick }) {
  return (
    <button
      className="icon-button refresh-button"
      aria-label={label}
      title={label}
      disabled={loading}
      onClick={onClick}
    >
      <RefreshCw
        size={15}
        className={loading ? "spinner" : ""}
        aria-hidden="true"
      />
    </button>
  );
}
