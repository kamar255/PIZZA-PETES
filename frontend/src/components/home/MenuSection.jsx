
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import PizzaList from "../pizza/PizzaList";

function MenuSection({
  loading,
  message,
  activeCategory,
  setActiveCategory,
  categories = [],
  filteredPizzas = [],
  onAddToCart,
}) {
  return (
    <section className="menu-section" id="menu">
      <div className="section-heading">
        <div>
          <div className="section-label">
            <span></span>
            NOS CRÉATIONS
          </div>

          <h2>
            La star de
            <br />
            <span>votre table.</span>
          </h2>
        </div>

        <p>
          Des recettes généreuses, une pâte
          préparée avec soin et des saveurs
          qui font la différence.
        </p>
      </div>

      <div className="category-bar">
        <div className="categories">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
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
      ) : message ? (
        <p>{message}</p>
      ) : filteredPizzas.length === 0 ? (
        <p>Aucune pizza disponible dans cette catégorie.</p>
      ) : (
        <PizzaList
          pizzas={filteredPizzas}
          onAddToCart={onAddToCart}
        />
      )}

      <div className="menu-more">
        <Link to="/menu">
          EXPLORER TOUT LE MENU
          <ArrowRight size={17} />
        </Link>
      </div>
    </section>
  );
}

export default MenuSection;
