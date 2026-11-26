
import {
  Star,
  Plus,
} from "lucide-react";

function PizzaCard({ pizza, onAddToCart }) {
  return (
    <article className="pizza-card">
      <div className="pizza-image">
        <img
          src={
            pizza.imageUrl ||
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800"
          }
          alt={pizza.name}
          loading="lazy"
        />

        <span className="pizza-tag">
          {pizza.category?.toUpperCase() || "PIZZA"}
        </span>

        <button
          type="button"
          className="quick-add"
          aria-label={`Ajouter ${pizza.name} au panier`}
          onClick={() => onAddToCart?.(pizza)}
        >
          <Plus size={22} />
        </button>
      </div>

      <div className="pizza-info">
        <div className="pizza-name-row">
          <h3>{pizza.name}</h3>

          <div
            className="pizza-rating"
            aria-label="Note indicative : 4,9 sur 5"
          >
            <Star size={14} fill="currentColor" />
            4.9
          </div>
        </div>

        <p>{pizza.description}</p>

        <div className="pizza-bottom">
          <strong>
            {Number(pizza.price || 0).toFixed(2)}{" "}
            <small>DT</small>
          </strong>
        </div>
      </div>
    </article>
  );
}

export default PizzaCard;
