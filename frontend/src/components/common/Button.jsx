
import { Loader2 } from "lucide-react";

function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      className={`custom-button ${variant} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
    >
      {loading ? (
        <>
          <Loader2
            className="button-loader"
            size={18}
            aria-hidden="true"
          />
          Chargement...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
