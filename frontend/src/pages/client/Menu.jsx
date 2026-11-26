
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import PizzaList from "../../components/pizza/PizzaList";
import CartSidebar from "../../components/cart/CartSidebar";

import pizzaService from "../../services/pizzaService";
import sizeService from "../../services/sizeService";
import doughService from "../../services/doughService";
import toppingService from "../../services/toppingService";
import orderService from "../../services/orderService";

import { useAuth } from "../../hooks/useAuth";

const CART_STORAGE_KEY = "pizza-petes-cart";

function Menu() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [pizzas, setPizzas] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [doughs, setDoughs] = useState([]);
  const [toppings, setToppings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState("");
  const [optionsError, setOptionsError] = useState("");

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

  const [customizingPizza, setCustomizingPizza] = useState(null);
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [selectedDoughId, setSelectedDoughId] = useState("");
  const [selectedToppingIds, setSelectedToppingIds] = useState([]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Erreur de sauvegarde du panier :", err);
    }
  }, [cart]);

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

  useEffect(() => {
    let isMounted = true;

    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        setOptionsError("");

        const [sizesData, doughsData, toppingsData] = await Promise.all([
          sizeService.getAvailableSizes(),
          doughService.getAvailableDoughs(),
          toppingService.getAvailableToppings(),
        ]);

        if (!isMounted) return;

        if (
          !Array.isArray(sizesData) ||
          !Array.isArray(doughsData) ||
          !Array.isArray(toppingsData)
        ) {
          throw new Error("Les options reçues du serveur sont invalides.");
        }

        setSizes(sizesData);
        setDoughs(doughsData);
        setToppings(toppingsData);
      } catch (err) {
        console.error("Erreur de chargement des options :", err);

        if (isMounted) {
          setOptionsError(
            "Impossible de charger les tailles, les pâtes ou les garnitures."
          );
        }
      } finally {
        if (isMounted) {
          setOptionsLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, []);

  const customizationPrice = useMemo(() => {
    if (!customizingPizza) return 0;

    const selectedSize = sizes.find(
      (size) => String(size.id) === String(selectedSizeId)
    );

    const selectedDough = doughs.find(
      (dough) => String(dough.id) === String(selectedDoughId)
    );

    const selectedToppings = toppings.filter((topping) =>
      selectedToppingIds.includes(Number(topping.id))
    );

    const sizePrice = Number(selectedSize?.extraPrice || 0);
    const doughPrice = Number(selectedDough?.extraPrice || 0);

    const toppingsPrice = selectedToppings.reduce(
      (total, topping) => total + Number(topping.price || 0),
      0
    );

    return (
      Number(customizingPizza.price || 0) +
      sizePrice +
      doughPrice +
      toppingsPrice
    );
  }, [
    customizingPizza,
    sizes,
    doughs,
    toppings,
    selectedSizeId,
    selectedDoughId,
    selectedToppingIds,
  ]);

  const openCustomizer = (pizza) => {
    setCheckoutError("");
    setCheckoutSuccess("");

    if (optionsLoading) {
      setCheckoutError("Chargement des options, réessaie dans un instant.");
      return;
    }

    if (
      optionsError ||
      sizes.length === 0 ||
      doughs.length === 0
    ) {
      setCheckoutError("Les tailles et les pâtes ne sont pas disponibles.");
      return;
    }

    setCustomizingPizza(pizza);
    setSelectedSizeId(String(sizes[0].id));
    setSelectedDoughId(String(doughs[0].id));
    setSelectedToppingIds([]);
  };

  const closeCustomizer = () => {
    setCustomizingPizza(null);
    setSelectedSizeId("");
    setSelectedDoughId("");
    setSelectedToppingIds([]);
  };

  const toggleTopping = (toppingId) => {
    const id = Number(toppingId);

    setSelectedToppingIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((currentId) => currentId !== id)
        : [...currentIds, id]
    );
  };

  const addToCart = () => {
    if (!customizingPizza || !selectedSizeId || !selectedDoughId) {
      setCheckoutError("Choisis une taille et une pâte.");
      return;
    }

    const selectedSize = sizes.find(
      (size) => String(size.id) === String(selectedSizeId)
    );

    const selectedDough = doughs.find(
      (dough) => String(dough.id) === String(selectedDoughId)
    );

    const selectedToppings = toppings.filter((topping) =>
      selectedToppingIds.includes(Number(topping.id))
    );

    if (!selectedSize || !selectedDough) {
      setCheckoutError("La taille ou la pâte sélectionnée est invalide.");
      return;
    }

    const customItem = {
      id: `custom-${Date.now()}-${Math.random()}`,
      pizzaId: customizingPizza.id,
      name: customizingPizza.name,
      imageUrl: customizingPizza.imageUrl,
      price: customizationPrice,
      quantity: 1,
      sizeId: selectedSize.id,
      sizeName: selectedSize.name,
      doughId: selectedDough.id,
      doughName: selectedDough.name,
      toppingIds: selectedToppings.map((topping) => topping.id),
      toppingNames: selectedToppings.map((topping) => topping.name),
    };

    setCart((currentCart) => [...currentCart, customItem]);

    closeCustomizer();
    setCartOpen(true);
    setCheckoutError("");
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

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

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

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

    const orderType = orderInformation?.orderType;

    if (!["DELIVERY", "PICKUP"].includes(orderType)) {
      setCheckoutError("Choisis la livraison ou le retrait.");
      return;
    }

    const deliveryAddress = orderInformation?.deliveryAddress || "";

    if (orderType === "DELIVERY" && !deliveryAddress.trim()) {
      setCheckoutError("Saisis ton adresse de livraison.");
      return;
    }

    const invalidItem = cart.find(
      (item) =>
        !item.pizzaId ||
        !item.sizeId ||
        !item.doughId ||
        !Array.isArray(item.toppingIds)
    );

    if (invalidItem) {
      setCheckoutError(
        "Une pizza de ton panier doit être personnalisée à nouveau. Supprime-la et ajoute-la depuis le menu."
      );
      return;
    }

    const orderData = {
      deliveryAddress,
      orderType,
      items: cart.map((item) => ({
        pizzaId: Number(item.pizzaId),
        sizeId: Number(item.sizeId),
        doughId: Number(item.doughId),
        toppingIds: item.toppingIds.map(Number),
        quantity: Number(item.quantity),
      })),
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

  const cartCount = cart.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  const categories = [
    "Toutes",
    ...new Set(pizzas.map((pizza) => pizza.category).filter(Boolean)),
  ];

  const filteredPizzas =
    activeCategory === "Toutes"
      ? pizzas
      : pizzas.filter((pizza) => pizza.category === activeCategory);

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

        {checkoutError && !cartOpen && (
          <p className="auth-error" role="alert">
            {checkoutError}
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
              onAddToCart={openCustomizer}
            />
          )}
        </section>
      </main>

      <Footer />

      {/* Personnalisation de la pizza */}
      {customizingPizza && (
        <div
          className="menu-customizer-overlay"
          onClick={closeCustomizer}
        >
          <div
            className="menu-customizer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customizer-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="menu-customizer-header">
              <div>
                <span>PERSONNALISATION</span>
                <h2 id="customizer-title">
                  {customizingPizza.name}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeCustomizer}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            {optionsLoading ? (
              <div className="menu-customizer-message">
                Chargement des options...
              </div>
            ) : optionsError ? (
              <div className="menu-customizer-message auth-error">
                {optionsError}
              </div>
            ) : (
              <div className="menu-customizer-body">

                <section className="menu-option-section">
                  <div className="menu-option-title">
                    <span>1</span>
                    <div>
                      <h3>Choisis ta taille</h3>
                      <p>Sélectionne le format de ta pizza</p>
                    </div>
                  </div>

                  <div className="menu-option-list">
                    {sizes.map((size) => (
                      <label
                        key={size.id}
                        className={
                          String(selectedSizeId) === String(size.id)
                            ? "menu-option selected"
                            : "menu-option"
                        }
                      >
                        <input
                          type="radio"
                          name="pizza-size"
                          value={size.id}
                          checked={
                            String(selectedSizeId) === String(size.id)
                          }
                          onChange={() =>
                            setSelectedSizeId(String(size.id))
                          }
                        />

                        <span className="menu-option-name">
                          {size.name}
                        </span>

                        <span className="menu-option-price">
                          +{Number(size.extraPrice || 0).toFixed(2)} DT
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="menu-option-section">
                  <div className="menu-option-title">
                    <span>2</span>
                    <div>
                      <h3>Choisis ta pâte</h3>
                      <p>La base parfaite pour ta pizza</p>
                    </div>
                  </div>

                  <div className="menu-option-list">
                    {doughs.map((dough) => (
                      <label
                        key={dough.id}
                        className={
                          String(selectedDoughId) === String(dough.id)
                            ? "menu-option selected"
                            : "menu-option"
                        }
                      >
                        <input
                          type="radio"
                          name="pizza-dough"
                          value={dough.id}
                          checked={
                            String(selectedDoughId) === String(dough.id)
                          }
                          onChange={() =>
                            setSelectedDoughId(String(dough.id))
                          }
                        />

                        <span className="menu-option-name">
                          {dough.name}
                        </span>

                        <span className="menu-option-price">
                          +{Number(dough.extraPrice || 0).toFixed(2)} DT
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="menu-option-section">
                  <div className="menu-option-title">
                    <span>3</span>
                    <div>
                      <h3>Ajoute tes garnitures</h3>
                      <p>Personnalise ta pizza selon tes envies</p>
                    </div>
                  </div>

                  {toppings.length === 0 ? (
                    <p className="menu-customizer-message">
                      Aucune garniture disponible.
                    </p>
                  ) : (
                    <div className="menu-option-list">
                      {toppings.map((topping) => (
                        <label
                          key={topping.id}
                          className={
                            selectedToppingIds.includes(Number(topping.id))
                              ? "menu-option selected"
                              : "menu-option"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedToppingIds.includes(
                              Number(topping.id)
                            )}
                            onChange={() => toggleTopping(topping.id)}
                          />

                          <span className="menu-option-name">
                            {topping.name}
                          </span>

                          <span className="menu-option-price">
                            +{Number(topping.price || 0).toFixed(2)} DT
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </section>

                <div className="menu-customizer-total">
                  <span>Prix total estimé</span>
                  <strong>{customizationPrice.toFixed(2)} DT</strong>
                </div>

                <div className="menu-customizer-actions">
                  <button
                    type="button"
                    className="menu-customizer-cancel"
                    onClick={closeCustomizer}
                  >
                    Annuler
                  </button>

                  <button
                    type="button"
                    className="menu-customizer-add"
                    onClick={addToCart}
                  >
                    Ajouter au panier
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
