
import { LoaderCircle } from "lucide-react";

function Loader({
  message = "Chargement...",
  fullScreen = false,
}) {
  return (
    <div
      className={`loader-container ${
        fullScreen ? "loader-fullscreen" : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <LoaderCircle
        className="loader-icon"
        size={38}
        aria-hidden="true"
      />

      <p>{message}</p>
    </div>
  );
}

export default Loader;
