
import { useEffect, useState } from "react";

import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
} from "lucide-react";

import "./CartSidebar.css";

function CartSidebar({
  cart = [],
  isOpen,
  onClose,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  checkoutLoading = false,
  checkoutError = "",
}) {
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderType, setOrderType] = useState("DELIVERY");

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const cartCount = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape" && !checkoutLoading) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose, checkoutLoading]);

  const handleCheckout = (event) => {
    event.preventDefault();

    if (
      cart.length === 0 ||
      checkoutLoading ||
      typeof onCheckout !== "function"
    ) {
      return;
    }

    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      return;
    }

    onCheckout({
      deliveryAddress:
        orderType === "DELIVERY" ? deliveryAddress.trim() : "",
      orderType,
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="cart-overlay"
          onClick={() => {
            if (!checkoutLoading) onClose?.();
          }}
          aria-hidden="true"
        />
      )}

      <aside
        className={`cart-sidebar ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-modal={isOpen}
        aria-label="Mon panier"
        aria-hidden={!isOpen}
      >
        <div className="cart-header">
          <div>
            <h2>Mon panier</h2>
            <p>{cartCount} pizza(s)</p>
          </div>

          <button
            type="button"
            className="cart-close"
            onClick={onClose}
            aria-label="Fermer le panier"
            disabled={checkoutLoading}
          >
            <X size={24} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={45} />
              <h3>Votre panier est vide</h3>
              <p>Ajoutez une pizza pour commencer !</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <ShoppingBag size={25} />
                  )}
                </div>

                <div className="cart-item-info">
                  <h3>{item.name}</h3>

                  {item.sizeName && (
                    <p>Taille : {item.sizeName}</p>
                  )}

                  {item.doughName && (
                    <p>Pâte : {item.doughName}</p>
                  )}

                  {item.toppingNames?.length > 0 && (
                    <p>
                      Garnitures : {item.toppingNames.join(", ")}
                    </p>
                  )}

                  <p className="cart-item-price">
                    {(
                      Number(item.price || 0) *
                      Number(item.quantity || 0)
                    ).toFixed(2)} DT
                  </p>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      onClick={() => onDecrease?.(item.id)}
                      aria-label={`Diminuer la quantité de ${item.name}`}
                      disabled={checkoutLoading}
                    >
                      <Minus size={15} />
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      type="button"
                      onClick={() => onIncrease?.(item.id)}
                      aria-label={`Augmenter la quantité de ${item.name}`}
                      disabled={checkoutLoading}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="cart-remove"
                  onClick={() => onRemove?.(item.id)}
                  aria-label={`Supprimer ${item.name}`}
                  disabled={checkoutLoading}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))
          )}
        </div>

        <form className="cart-footer" onSubmit={handleCheckout}>
          <div className="cart-total">
            <span>Total</span>
            <strong>{total.toFixed(2)} DT</strong>
          </div>

          {cart.length > 0 && (
            <>
              <div className="cart-order-type">
                <label htmlFor="cart-order-type">
                  Type de commande
                </label>

                <select
                  id="cart-order-type"
                  value={orderType}
                  onChange={(event) => setOrderType(event.target.value)}
                  disabled={checkoutLoading}
                >
                  <option value="DELIVERY">Livraison</option>
                  <option value="PICKUP">À emporter</option>
                </select>
              </div>

              {orderType === "DELIVERY" && (
                <div className="cart-address">
                  <label htmlFor="cart-delivery-address">
                    Adresse de livraison
                  </label>

                  <textarea
                    id="cart-delivery-address"
                    value={deliveryAddress}
                    onChange={(event) =>
                      setDeliveryAddress(event.target.value)
                    }
                    placeholder="Saisissez votre adresse complète..."
                    required
                    disabled={checkoutLoading}
                    rows={3}
                  />
                </div>
              )}

              {checkoutError && (
                <p className="auth-error" role="alert">
                  {checkoutError}
                </p>
              )}
            </>
          )}

          <button
            type="submit"
            className="cart-checkout"
            disabled={
              cart.length === 0 ||
              checkoutLoading ||
              typeof onCheckout !== "function" ||
              (orderType === "DELIVERY" && !deliveryAddress.trim())
            }
          >
            {checkoutLoading
              ? "Commande en cours..."
              : "Passer la commande"}
          </button>
        </form>
      </aside>
    </>
  );
}

export default CartSidebar;
