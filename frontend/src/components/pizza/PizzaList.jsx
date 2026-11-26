
import PizzaCard from "./PizzaCard";

function PizzaList({ pizzas = [], onAddToCart }) {
  if (!Array.isArray(pizzas) || pizzas.length === 0) {
    return (
      <p className="pizza-empty">
        Aucune pizza disponible pour le moment.
      </p>
    );
  }

  return (
    <div className="pizza-grid">
      {pizzas.map((pizza) => (
        <PizzaCard
          key={pizza.id}
          pizza={pizza}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default PizzaList;
