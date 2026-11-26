
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ShoppingBag,
  Menu,
  X,
} from "lucide-react";

function Navbar({ cartCount = 0, onOpenCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogin = () => {
    closeMenu();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={closeMenu}>
        <img
          src="/images/logo-pizza.png"
          alt="Pizza Pete's"
          className="navbar-logo"
        />
      </Link>

      <nav className={menuOpen ? "nav-links open" : "nav-links"}>
        <Link to="/" onClick={closeMenu}>
          Accueil
        </Link>

        <Link to="/menu" onClick={closeMenu}>
          Notre menu
        </Link>

        <a href="/#story" onClick={closeMenu}>
          Notre histoire
        </a>

        <a href="/#contact" onClick={closeMenu}>
          Contact
        </a>
      </nav>

      <div className="nav-actions">
        <button
          type="button"
          className="cart-button"
          onClick={onOpenCart}
        >
          <ShoppingBag size={19} />
          <span>Mon panier</span>
          <span className="cart-count">{cartCount}</span>
        </button>

        <button
          type="button"
          className="login-button"
          onClick={handleLogin}
        >
          Se connecter
        </button>
      </div>

      <button
        type="button"
        className="mobile-menu"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

export default Navbar;
