
import { useEffect, useState } from "react";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";

import Hero from "../../components/home/Hero";
import MenuSection from "../../components/home/MenuSection";
import StorySection from "../../components/home/StorySection";
import DeliveryBanner from "../../components/home/DeliveryBanner";

import CartSidebar from "../../components/cart/CartSidebar";

import pizzaService from "../../services/pizzaService";

const CART_STORAGE_KEY = "pizza-petes-cart";

function Home() {
  const [pizzas, setPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState("Toutes");

  // Charger le panier sauvegardé
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      const parsedCart = savedCart ? JSON.parse(savedCart) : [];

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Erreur de lecture du panier :", error);
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);

  // Sauvegarder automatiquement le panier
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Erreur de sauvegarde du panier :", error);
    }
  }, [cart]);

  // Charger les pizzas depuis le backend
  useEffect(() => {
    let isMounted = true;

    const fetchPizzas = async () => {
      try {
        const data = await pizzaService.getAvailablePizzas();

        if (isMounted) {
          setPizzas(Array.isArray(data) ? data : []);
          setMessage(
            Array.isArray(data)
              ? ""
              : "Les données reçues du serveur sont invalides."
          );
        }
      } catch (error) {
        console.error("Erreur de chargement des pizzas :", error);

        if (isMounted) {
          setMessage(
            "Impossible de charger les pizzas. Vérifie le serveur."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPizzas();

    return () => {
      isMounted = false;
    };
  }, []);

  // Ajouter une pizza au panier
  const addToCart = (pizza) => {
    setCart((currentCart) => {
      const existingPizza = currentCart.find(
        (item) => item.id === pizza.id
      );

      if (existingPizza) {
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

  // Nombre total de pizzas dans le panier
  const cartCount = cart.reduce(
    (total, item) => total + item.quantity,
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

      <main>
        <Hero />

        <MenuSection
          loading={loading}
          message={message}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories}
          filteredPizzas={filteredPizzas}
          onAddToCart={addToCart}
        />

        <StorySection />

        <DeliveryBanner />
      </main>

      <Footer />

      <CartSidebar
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
      />
    </div>
  );
}

export default Home;
