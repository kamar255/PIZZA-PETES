
package com.pizzapetes.service;

import com.pizzapetes.entity.Pizza;
import com.pizzapetes.repository.PizzaRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PizzaService {

    private final PizzaRepository pizzaRepository;

    public PizzaService(PizzaRepository pizzaRepository) {
        this.pizzaRepository = pizzaRepository;
    }

    public List<Pizza> getAllPizzas() {
        return pizzaRepository.findAll();
    }

    public List<Pizza> getAvailablePizzas() {
        return pizzaRepository.findByAvailableTrue();
    }

    public Pizza getPizzaById(Long id) {
        return pizzaRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Pizza introuvable : " + id));
    }

    public Pizza createPizza(Pizza pizza) {
        if (pizzaRepository.existsByNameIgnoreCase(pizza.getName())) {
            throw new RuntimeException(
                    "Cette pizza existe déjà : " + pizza.getName());
        }

        return pizzaRepository.save(pizza);
    }

    public Pizza updatePizza(Long id, Pizza pizzaDetails) {
        Pizza pizza = getPizzaById(id);

        pizza.setName(pizzaDetails.getName());
        pizza.setDescription(pizzaDetails.getDescription());
        pizza.setPrice(pizzaDetails.getPrice());
        pizza.setImageUrl(pizzaDetails.getImageUrl());
        pizza.setCategory(pizzaDetails.getCategory());
        pizza.setToppings(pizzaDetails.getToppings());
        pizza.setAvailable(pizzaDetails.isAvailable());

        return pizzaRepository.save(pizza);
    }

    public void deletePizza(Long id) {
        Pizza pizza = getPizzaById(id);
        pizzaRepository.delete(pizza);
    }
}
