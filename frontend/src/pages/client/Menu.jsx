
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import PizzaList from "../../components/pizza/PizzaList";
import CartSidebar from "../../components/cart/CartSidebar";

import pizzaService from "../../services/pizzaService";
import orderService from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";

const CART_STORAGE_KEY = "pizza-petes-cart";

function Menu() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("Toutes");

  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (err) {
      console.error("Erreur de lecture du panier :", err);
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  // Sauvegarder le panier
  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (err) {
      console.error("Erreur de sauvegarde du panier :", err);
    }
  }, [cart]);

  // Charger les pizzas depuis le backend
  useEffect(() => {
    let isMounted = true;

    const loadPizzas = async () => {
      try {
        const data = await pizzaService.getAvailablePizzas();

        if (isMounted) {
          setPizzas(Array.isArray(data) ? data : []);
          setError(
            Array.isArray(data)
              ? ""
              : "Les données reçues du serveur sont invalides."
          );
        }
      } catch (err) {
        console.error("Erreur de chargement des pizzas :", err);

        if (isMounted) {
          setError("Impossible de charger les pizzas. Vérifie le serveur.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPizzas();

    return () => {
      isMounted = false;
    };
  }, []);

  // Ajouter une pizza au panier
  const addToCart = (pizza) => {
    setCheckoutError("");
    setCheckoutSuccess("");

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === pizza.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === pizza.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: pizza.id,
          name: pizza.name,
          price: pizza.price,
          imageUrl: pizza.imageUrl,
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  // Augmenter la quantité
  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Diminuer la quantité
  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Supprimer une pizza du panier
  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // Passer la commande
  const handleCheckout = async (orderInformation) => {
    setCheckoutError("");
    setCheckoutSuccess("");

    if (!isAuthenticated) {
      setCheckoutError("Connecte-toi pour passer une commande.");

      navigate("/login", {
        state: {
          from: "/menu",
          message: "Connecte-toi pour finaliser ta commande.",
        },
      });

      return;
    }

    if (cart.length === 0) {
      setCheckoutError("Ton panier est vide.");
      return;
    }

    if (!orderInformation?.totalPrice || orderInformation.totalPrice <= 0) {
      setCheckoutError("Le montant de la commande est invalide.");
      return;
    }

    if (
      orderInformation.orderType === "DELIVERY" &&
      !orderInformation.deliveryAddress?.trim()
    ) {
      setCheckoutError("Saisis ton adresse de livraison.");
      return;
    }

    const orderData = {
      totalPrice: orderInformation.totalPrice,
      deliveryAddress: orderInformation.deliveryAddress || "",
      orderType: orderInformation.orderType,
    };

    try {
      setCheckoutLoading(true);

      const createdOrder = await orderService.createOrder(orderData);

      console.log("Commande créée :", createdOrder);

      setCart([]);
      setCartOpen(false);

      setCheckoutSuccess(
        `Commande n°${createdOrder.id} enregistrée avec succès !`
      );
    } catch (err) {
      console.error("Erreur lors de la création de la commande :", err);

      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Impossible de passer la commande. Vérifie ta connexion et réessaie.";

      setCheckoutError(message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Nombre total de pizzas
  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Catégories disponibles
  const categories = [
    "Toutes",
    ...new Set(
      pizzas.map((pizza) => pizza.category).filter(Boolean)
    ),
  ];

  // Filtrer les pizzas
  const filteredPizzas =
    activeCategory === "Toutes"
      ? pizzas
      : pizzas.filter(
          (pizza) => pizza.category === activeCategory
        );

  return (
    <div className="app">
      <Navbar
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="menu-page">
        <section className="menu-page-heading">
          <span className="section-label">
            <span></span>
            DÉCOUVREZ NOS SAVEURS
          </span>

          <h1>
            Notre menu
            <br />
            <span>de pizzas.</span>
          </h1>

          <p>
            Des ingrédients frais, des recettes généreuses
            et une pâte préparée avec passion.
          </p>
        </section>

        {checkoutSuccess && (
          <p className="auth-success" role="status">
            {checkoutSuccess}
          </p>
        )}

        <section className="menu-page-content">
          <div className="category-bar">
            <div className="categories">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={
                    activeCategory === category
                      ? "category active"
                      : "category"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <span className="menu-count">
              {filteredPizzas.length} PIZZAS
            </span>
          </div>

          {loading ? (
            <p>Chargement des pizzas...</p>
          ) : error ? (
            <p className="auth-error" role="alert">
              {error}
            </p>
          ) : (
            <PizzaList
              pizzas={filteredPizzas}
              onAddToCart={addToCart}
            />
          )}
        </section>
      </main>

      <Footer />

      <CartSidebar
        cart={cart}
        isOpen={cartOpen}
        onClose={() => {
          setCartOpen(false);
          setCheckoutError("");
        }}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCheckout}
        checkoutLoading={checkoutLoading}
        checkoutError={checkoutError}
      />
    </div>
  );
}

export default Menu;
