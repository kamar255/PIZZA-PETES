
import {
  ArrowRight,
  Star,
  Flame,
  ChevronDown,
} from "lucide-react";

import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <div className="eyebrow">
          <span className="eyebrow-line"></span>
          <Flame size={16} />
          <span>LA PASSION À L'ITALIENNE</span>
        </div>

        <h1>
          GOOD FOOD.
          <br />
          <span>GOOD MOOD.</span>
        </h1>

        <p className="hero-description">
          Une pâte artisanale, des ingrédients
          d'exception et une passion qui se
          goûte à chaque bouchée.
        </p>

        <div className="hero-buttons">
          <Link to="/menu" className="primary-button">
            Découvrir le menu
            <ArrowRight size={19} />
          </Link>

          <a href="#story" className="text-button">
            Notre histoire
          </a>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <strong>100%</strong>
            <span>Ingrédients frais</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat">
            <strong>30 min</strong>
            <span>Livraison rapide</span>
          </div>

          <div className="stat-divider"></div>

          <div className="stat">
            <strong>4.9/5</strong>
            <span>Clients satisfaits</span>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-frame">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200"
            alt="Pizza artisanale italienne"
          />
        </div>

        <div className="hero-badge">
          <Star size={16} fill="currentColor" />

          <div>
            <strong>4.9 / 5</strong>
            <span>Notre note client</span>
          </div>
        </div>

        <div className="hero-side-text">
          MADE WITH PASSION · SERVED WITH LOVE
        </div>
      </div>

      <div className="hero-bottom">
        <span>01 / 03</span>

        <span className="scroll-text">
          SCROLL TO DISCOVER
          <ChevronDown size={15} />
        </span>
      </div>
    </section>
  );
}

export default Hero;
