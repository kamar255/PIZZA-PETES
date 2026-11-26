
package com.pizzapetes.service;

import com.pizzapetes.entity.Topping;
import com.pizzapetes.repository.ToppingRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ToppingService {

    private final ToppingRepository toppingRepository;

    public ToppingService(ToppingRepository toppingRepository) {
        this.toppingRepository = toppingRepository;
    }

    public List<Topping> getAllToppings() {
        return toppingRepository.findAll();
    }

    public List<Topping> getAvailableToppings() {
        return toppingRepository.findByAvailableTrue();
    }

    public Topping getToppingById(Long id) {
        return toppingRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Garniture introuvable : " + id));
    }

    public Topping createTopping(Topping topping) {
        return toppingRepository.save(topping);
    }

    public Topping updateTopping(Long id, Topping toppingDetails) {
        Topping topping = getToppingById(id);

        topping.setName(toppingDetails.getName());
        topping.setDescription(toppingDetails.getDescription());
        topping.setPrice(toppingDetails.getPrice());
        topping.setAvailable(toppingDetails.isAvailable());

        return toppingRepository.save(topping);
    }

    public void deleteTopping(Long id) {
        Topping topping = getToppingById(id);
        toppingRepository.delete(topping);
    }
}
