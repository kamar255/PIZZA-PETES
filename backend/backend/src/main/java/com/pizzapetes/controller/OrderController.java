
package com.pizzapetes.controller;

import com.pizzapetes.dto.OrderDTO;
import com.pizzapetes.entity.CustomerOrder;
import com.pizzapetes.enums.OrderStatus;
import com.pizzapetes.service.OrderService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Récupérer toutes les commandes (administrateur)
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {

        return ResponseEntity.ok(
                orderService.getAllOrders()
        );
    }

    // Récupérer une commande par son ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                orderService.getOrderById(id)
        );
    }

    // Récupérer les commandes d'un utilisateur (administrateur)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByUserId(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                orderService.getOrdersByUserId(userId)
        );
    }

    // Récupérer uniquement les commandes du client connecté
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            Principal principal) {

        return ResponseEntity.ok(
                orderService.getMyOrders(principal.getName())
        );
    }

    // Récupérer les commandes selon leur statut (administrateur)
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderDTO>> getOrdersByStatus(
            @PathVariable OrderStatus status) {

        return ResponseEntity.ok(
                orderService.getOrdersByStatus(status)
        );
    }

    // Créer une commande pour le client connecté
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(
            @RequestBody CustomerOrder order,
            Principal principal) {

        OrderDTO createdOrder = orderService.createOrder(
                order,
                principal.getName()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdOrder);
    }

    // Modifier le statut d'une commande (administrateur)
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {

        return ResponseEntity.ok(
                orderService.updateOrderStatus(id, status)
        );
    }

    // Supprimer une commande (administrateur)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(
            @PathVariable Long id) {

        orderService.deleteOrder(id);

        return ResponseEntity.noContent().build();
    }
}
