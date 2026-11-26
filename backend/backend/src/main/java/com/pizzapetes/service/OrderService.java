
package com.pizzapetes.service;

import com.pizzapetes.dto.OrderDTO;
import com.pizzapetes.dto.UserDTO;
import com.pizzapetes.entity.CustomerOrder;
import com.pizzapetes.entity.User;
import com.pizzapetes.enums.OrderStatus;
import com.pizzapetes.repository.OrderRepository;
import com.pizzapetes.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    // Récupérer toutes les commandes (administrateur)
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {

        return orderRepository.findAllByOrderByOrderDateDesc()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Récupérer une commande par son ID
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Commande introuvable : " + id
                        ));

        return convertToDTO(order);
    }

    // Récupérer les commandes d'un utilisateur (administrateur)
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByUserId(Long userId) {

        if (!userRepository.existsById(userId)) {
            throw new RuntimeException(
                    "Utilisateur introuvable : " + userId
            );
        }

        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Récupérer les commandes du client connecté
    @Transactional(readOnly = true)
    public List<OrderDTO> getMyOrders(String authenticatedEmail) {

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable : " + authenticatedEmail
                        ));

        return orderRepository.findByUserId(user.getId())
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Récupérer les commandes selon leur statut
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {

        return orderRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // Créer une commande pour le client authentifié
    @Transactional
    public OrderDTO createOrder(
            CustomerOrder order,
            String authenticatedEmail) {

        if (order == null) {
            throw new RuntimeException(
                    "Les informations de la commande sont obligatoires."
            );
        }

        if (authenticatedEmail == null || authenticatedEmail.isBlank()) {
            throw new RuntimeException(
                    "Utilisateur non authentifié."
            );
        }

        if (order.getTotalPrice() == null
                || order.getTotalPrice().signum() <= 0) {

            throw new RuntimeException(
                    "Le montant de la commande doit être positif."
            );
        }

        // L'utilisateur est récupéré depuis la session authentifiée.
        // On ne fait jamais confiance au userId envoyé par le frontend.
        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Utilisateur introuvable : " + authenticatedEmail
                        ));

        order.setId(null);
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(null);

        CustomerOrder savedOrder = orderRepository.save(order);

        return convertToDTO(savedOrder);
    }

    // Modifier le statut d'une commande
    @Transactional
    public OrderDTO updateOrderStatus(Long id, OrderStatus status) {

        if (status == null) {
            throw new RuntimeException(
                    "Le statut de la commande est obligatoire."
            );
        }

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Commande introuvable : " + id
                        ));

        order.setStatus(status);

        CustomerOrder updatedOrder = orderRepository.save(order);

        return convertToDTO(updatedOrder);
    }

    // Supprimer une commande
    @Transactional
    public void deleteOrder(Long id) {

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Commande introuvable : " + id
                        ));

        orderRepository.delete(order);
    }

    // Convertir CustomerOrder en OrderDTO sécurisé
    private OrderDTO convertToDTO(CustomerOrder order) {

        User user = order.getUser();

        UserDTO userDTO = null;

        if (user != null) {

            String role = user.getRole() != null
                    ? user.getRole().getName().name()
                    : "CLIENT";

            userDTO = new UserDTO(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhone(),
                    role
            );
        }

        return new OrderDTO(
                order.getId(),
                userDTO,
                order.getTotalPrice(),
                order.getStatus(),
                order.getOrderDate(),
                order.getDeliveryAddress(),
                order.getOrderType()
        );
    }
}
