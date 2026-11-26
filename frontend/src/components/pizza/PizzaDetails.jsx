
import { useState } from "react";
import { ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";

function PizzaDetails({ pizza, onAddToCart, onClose }) {
  const [quantity, setQuantity] = useState(1);

  if (!pizza) {
    return null;
  }

  const price = Number(pizza.price) || 0;

  const increaseQuantity = () => {
    setQuantity((current) => current + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      onAddToCart?.(pizza);
    }

    setQuantity(1);
    onClose?.();
  };

  return (
    <div className="pizza-details">
      <button
        type="button"
        className="pizza-details-back"
        onClick={onClose}
      >
        <ArrowLeft size={18} />
        Retour
      </button>

      <div className="pizza-details-content">
        <div className="pizza-details-image">
          <img
            src={
              pizza.imageUrl ||
              "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800"
            }
            alt={pizza.name}
          />
        </div>

        <div className="pizza-details-info">
          <span className="pizza-category">
            {pizza.category || "Pizza"}
          </span>

          <h2>{pizza.name}</h2>

          <p className="pizza-details-description">
            {pizza.description || "Une délicieuse pizza préparée avec soin."}
          </p>

          {Array.isArray(pizza.toppings) &&
            pizza.toppings.length > 0 && (
              <div className="pizza-details-toppings">
                <h3>Ingrédients</h3>

                <ul>
                  {pizza.toppings.map((topping, index) => (
                    <li key={index}>
                      {typeof topping === "string"
                        ? topping
                        : topping.name || "Ingrédient"}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          <div className="pizza-details-price">
            {price.toFixed(2)} DT
          </div>

          <div className="pizza-details-actions">
            <div className="pizza-quantity">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Diminuer la quantité"
              >
                <Minus size={16} />
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={increaseQuantity}
                aria-label="Augmenter la quantité"
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              className="pizza-add-button"
              onClick={handleAddToCart}
              disabled={pizza.available === false}
            >
              <ShoppingBag size={18} />
              {pizza.available === false
                ? "Indisponible"
                : `Ajouter - ${(price * quantity).toFixed(2)} DT`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PizzaDetails;
