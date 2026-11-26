
package com.pizzapetes.controller;

import com.pizzapetes.entity.Dough;
import com.pizzapetes.service.DoughService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doughs")
public class DoughController {

    private final DoughService doughService;

    public DoughController(DoughService doughService) {
        this.doughService = doughService;
    }

    @GetMapping
    public ResponseEntity<List<Dough>> getAllDoughs() {
        return ResponseEntity.ok(doughService.getAllDoughs());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Dough>> getAvailableDoughs() {
        return ResponseEntity.ok(doughService.getAvailableDoughs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Dough> getDoughById(
            @PathVariable Long id) {

        return ResponseEntity.ok(doughService.getDoughById(id));
    }

    @PostMapping
    public ResponseEntity<Dough> createDough(
            @RequestBody Dough dough) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(doughService.createDough(dough));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Dough> updateDough(
            @PathVariable Long id,
            @RequestBody Dough dough) {

        return ResponseEntity.ok(
                doughService.updateDough(id, dough)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDough(
            @PathVariable Long id) {

        doughService.deleteDough(id);
        return ResponseEntity.noContent().build();
    }
}
