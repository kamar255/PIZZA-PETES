
package com.pizzapetes.controller;

import com.pizzapetes.entity.Size;
import com.pizzapetes.service.SizeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sizes")
public class SizeController {

    private final SizeService sizeService;

    public SizeController(SizeService sizeService) {
        this.sizeService = sizeService;
    }

    @GetMapping
    public ResponseEntity<List<Size>> getAllSizes() {
        return ResponseEntity.ok(sizeService.getAllSizes());
    }

    @GetMapping("/available")
    public ResponseEntity<List<Size>> getAvailableSizes() {
        return ResponseEntity.ok(sizeService.getAvailableSizes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Size> getSizeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(sizeService.getSizeById(id));
    }

    @PostMapping
    public ResponseEntity<Size> createSize(
            @RequestBody Size size) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(sizeService.createSize(size));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Size> updateSize(
            @PathVariable Long id,
            @RequestBody Size size) {

        return ResponseEntity.ok(
                sizeService.updateSize(id, size)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSize(
            @PathVariable Long id) {

        sizeService.deleteSize(id);
        return ResponseEntity.noContent().build();
    }
}
