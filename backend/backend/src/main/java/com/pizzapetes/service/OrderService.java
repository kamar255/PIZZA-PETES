
package com.pizzapetes.service;

import com.pizzapetes.dto.CreateOrderRequest;
import com.pizzapetes.dto.OrderDTO;
import com.pizzapetes.dto.OrderItemDTO;
import com.pizzapetes.dto.OrderItemRequest;
import com.pizzapetes.dto.ToppingDTO;
import com.pizzapetes.dto.UserDTO;

import com.pizzapetes.entity.CustomerOrder;
import com.pizzapetes.entity.Dough;
import com.pizzapetes.entity.OrderItem;
import com.pizzapetes.entity.OrderItemTopping;
import com.pizzapetes.entity.Pizza;
import com.pizzapetes.entity.Size;
import com.pizzapetes.entity.Topping;
import com.pizzapetes.entity.User;

import com.pizzapetes.enums.OrderStatus;

import com.pizzapetes.repository.DoughRepository;
import com.pizzapetes.repository.OrderRepository;
import com.pizzapetes.repository.PizzaRepository;
import com.pizzapetes.repository.SizeRepository;
import com.pizzapetes.repository.ToppingRepository;
import com.pizzapetes.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PizzaRepository pizzaRepository;
    private final SizeRepository sizeRepository;
    private final DoughRepository doughRepository;
    private final ToppingRepository toppingRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            PizzaRepository pizzaRepository,
            SizeRepository sizeRepository,
            DoughRepository doughRepository,
            ToppingRepository toppingRepository
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.pizzaRepository = pizzaRepository;
        this.sizeRepository = sizeRepository;
        this.doughRepository = doughRepository;
        this.toppingRepository = toppingRepository;
    }

    // CREER UNE COMMANDE
    public OrderDTO createOrder(
            CreateOrderRequest request,
            String authenticatedEmail
    ) {

        if (request == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Données de commande manquantes"
            );
        }

        User user = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable"
                ));

        String orderType = request.getOrderType();

        if (orderType == null ||
                (!orderType.equalsIgnoreCase("DELIVERY")
                        && !orderType.equalsIgnoreCase("PICKUP"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Type de commande invalide"
            );
        }

        if (orderType.equalsIgnoreCase("DELIVERY")
                && (request.getDeliveryAddress() == null
                || request.getDeliveryAddress().isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "L'adresse de livraison est obligatoire"
            );
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La commande doit contenir au moins une pizza"
            );
        }

        CustomerOrder order = new CustomerOrder();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setOrderType(orderType.toUpperCase());
        order.setDeliveryAddress(
                orderType.equalsIgnoreCase("DELIVERY")
                        ? request.getDeliveryAddress().trim()
                        : null
        );

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Un article de la commande est invalide"
                );
            }

            if (itemRequest.getQuantity() == null
                    || itemRequest.getQuantity() <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La quantité doit être supérieure à zéro"
                );
            }

            Pizza pizza = pizzaRepository.findById(itemRequest.getPizzaId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Pizza introuvable"
                    ));

            Size size = sizeRepository.findById(itemRequest.getSizeId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Taille introuvable"
                    ));

            Dough dough = doughRepository.findById(itemRequest.getDoughId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Pâte introuvable"
                    ));

            if (!pizza.isAvailable()
                    || !size.isAvailable()
                    || !dough.isAvailable()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Un des choix sélectionnés n'est plus disponible"
                );
            }

            BigDecimal unitPrice = pizza.getPrice()
                    .add(size.getExtraPrice())
                    .add(dough.getExtraPrice());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setPizza(pizza);
            orderItem.setSize(size);
            orderItem.setDough(dough);
            orderItem.setQuantity(itemRequest.getQuantity());

            List<Long> toppingIds = itemRequest.getToppingIds();

            if (toppingIds != null && !toppingIds.isEmpty()) {

                Set<Long> uniqueIds = new HashSet<>(toppingIds);

                if (uniqueIds.size() != toppingIds.size()) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Une garniture ne peut pas être sélectionnée plusieurs fois"
                    );
                }

                for (Long toppingId : uniqueIds) {

                    if (toppingId == null) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Identifiant de garniture invalide"
                        );
                    }

                    Topping topping = toppingRepository.findById(toppingId)
                            .orElseThrow(() -> new ResponseStatusException(
                                    HttpStatus.NOT_FOUND,
                                    "Garniture introuvable"
                            ));

                    if (!topping.isAvailable()) {
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "La garniture " + topping.getName()
                                        + " n'est plus disponible"
                        );
                    }

                    unitPrice = unitPrice.add(topping.getPrice());

                    OrderItemTopping itemTopping = new OrderItemTopping();
                    itemTopping.setTopping(topping);
                    itemTopping.setPriceAtPurchase(topping.getPrice());

                    orderItem.addTopping(itemTopping);
                }
            }

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(itemRequest.getQuantity())
            );

            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(subtotal);

            order.addItem(orderItem);

            totalPrice = totalPrice.add(subtotal);
        }

        order.setTotalPrice(totalPrice);

        CustomerOrder savedOrder = orderRepository.save(order);

        return convertToDTO(savedOrder);
    }

    // RECUPERER TOUTES LES COMMANDES
    public List<OrderDTO> getAllOrders() {

        return orderRepository.findAllByOrderByOrderDateDesc()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // RECUPERER LES COMMANDES D'UN UTILISATEUR PAR EMAIL
    public List<OrderDTO> getMyOrders(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Utilisateur introuvable"
                ));

        return getOrdersByUserId(user.getId());
    }

    // RECUPERER LES COMMANDES D'UN UTILISATEUR PAR ID
    public List<OrderDTO> getOrdersByUserId(Long userId) {

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Identifiant utilisateur invalide"
            );
        }

        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // RECUPERER LES COMMANDES PAR STATUT
    public List<OrderDTO> getOrdersByStatus(OrderStatus status) {

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Statut de commande invalide"
            );
        }

        return orderRepository.findByStatus(status)
                .stream()
                .map(this::convertToDTO)
                .toList();
    }

    // RECUPERER UNE COMMANDE PAR ID
    public OrderDTO getOrderById(Long id) {

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Commande introuvable"
                ));

        return convertToDTO(order);
    }

    // MODIFIER LE STATUT D'UNE COMMANDE
    public OrderDTO updateOrderStatus(Long id, OrderStatus status) {

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Commande introuvable"
                ));

        if (status == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Statut invalide"
            );
        }

        order.setStatus(status);

        return convertToDTO(orderRepository.save(order));
    }

    // SUPPRIMER UNE COMMANDE
    public void deleteOrder(Long id) {

        CustomerOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Commande introuvable"
                ));

        orderRepository.delete(order);
    }

    // CONVERTIR UNE COMMANDE EN DTO
    private OrderDTO convertToDTO(CustomerOrder order) {

        User user = order.getUser();

        UserDTO userDTO = null;

        if (user != null) {

            String roleName = user.getRole() != null
                    ? user.getRole().getName().name()
                    : null;

            userDTO = new UserDTO(
                    user.getId(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhone(),
                    roleName
            );
        }

        OrderDTO dto = new OrderDTO(
                order.getId(),
                userDTO,
                order.getTotalPrice(),
                order.getStatus(),
                order.getOrderDate(),
                order.getDeliveryAddress(),
                order.getOrderType()
        );

        List<OrderItemDTO> itemDTOs = new ArrayList<>();

        if (order.getItems() != null) {

            for (OrderItem item : order.getItems()) {

                List<ToppingDTO> toppingDTOs = new ArrayList<>();

                if (item.getToppings() != null) {

                    for (OrderItemTopping itemTopping : item.getToppings()) {

                        Topping topping = itemTopping.getTopping();

                        toppingDTOs.add(new ToppingDTO(
                                topping.getId(),
                                topping.getName(),
                                topping.getDescription(),
                                itemTopping.getPriceAtPurchase()
                        ));
                    }
                }

                itemDTOs.add(new OrderItemDTO(
                        item.getPizza().getId(),
                        item.getPizza().getName(),
                        item.getPizza().getImageUrl(),
                        item.getSize().getId(),
                        item.getSize().getName(),
                        item.getDough().getId(),
                        item.getDough().getName(),
                        toppingDTOs,
                        item.getQuantity(),
                        item.getUnitPrice(),
                        item.getSubtotal()
                ));
            }
        }

        dto.setItems(itemDTOs);

        return dto;
    }
}
