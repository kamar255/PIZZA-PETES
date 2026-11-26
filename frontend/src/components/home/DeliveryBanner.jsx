
import {
  ArrowRight,
  Clock,
} from "lucide-react";

import { Link } from "react-router-dom";

function DeliveryBanner() {
  return (
    <section className="delivery-banner">
      <div>
        <div className="section-label">
          <span></span>
          UNE ENVIE DE PIZZA ?
        </div>

        <h2>
          Votre bonheur,
          <br />
          <span>livré chez vous.</span>
        </h2>
      </div>

      <Link to="/menu" className="primary-button">
        Commander maintenant
        <ArrowRight size={18} />
      </Link>

      <Clock
        className="delivery-icon"
        size={90}
      />
    </section>
  );
}

export default DeliveryBanner;
