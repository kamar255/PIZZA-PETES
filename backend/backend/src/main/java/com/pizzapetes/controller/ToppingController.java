
package com.pizzapetes.controller;

import com.pizzapetes.entity.Topping;
import com.pizzapetes.service.ToppingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/toppings")
public class ToppingController {

    private final ToppingService toppingService;

    public ToppingController(ToppingService toppingService) {
        this.toppingService = toppingService;
    }

    @GetMapping
    public ResponseEntity<List<Topping>> getAllToppings() {
        return ResponseEntity.ok(toppingService.getAllToppings());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Topping>> getAvailableToppings() {
        return ResponseEntity.ok(toppingService.getAvailableToppings());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Topping> getToppingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(toppingService.getToppingById(id));
    }

    @PostMapping
    public ResponseEntity<Topping> createTopping(
            @RequestBody Topping topping) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(toppingService.createTopping(topping));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Topping> updateTopping(
            @PathVariable Long id,
            @RequestBody Topping topping) {

        return ResponseEntity.ok(
                toppingService.updateTopping(id, topping)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTopping(
            @PathVariable Long id) {

        toppingService.deleteTopping(id);
        return ResponseEntity.noContent().build();
    }
}
