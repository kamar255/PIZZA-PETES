
package com.pizzapetes.service;

import com.pizzapetes.entity.OrderItem;
import com.pizzapetes.entity.CustomerOrder;
import com.pizzapetes.entity.Pizza;
import com.pizzapetes.entity.Size;
import com.pizzapetes.entity.Dough;

import com.pizzapetes.repository.OrderItemRepository;
import com.pizzapetes.repository.OrderRepository;
import com.pizzapetes.repository.PizzaRepository;
import com.pizzapetes.repository.SizeRepository;
import com.pizzapetes.repository.DoughRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;
    private final OrderRepository orderRepository;
    private final PizzaRepository pizzaRepository;
    private final SizeRepository sizeRepository;
    private final DoughRepository doughRepository;

    public OrderItemService(
            OrderItemRepository orderItemRepository,
            OrderRepository orderRepository,
            PizzaRepository pizzaRepository,
            SizeRepository sizeRepository,
            DoughRepository doughRepository) {

        this.orderItemRepository = orderItemRepository;
        this.orderRepository = orderRepository;
        this.pizzaRepository = pizzaRepository;
        this.sizeRepository = sizeRepository;
        this.doughRepository = doughRepository;
    }

    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    public List<OrderItem> getOrderItemsByOrderId(Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException(
                    "Commande introuvable : " + orderId
            );
        }

        return orderItemRepository.findByOrderId(orderId);
    }

    public OrderItem getOrderItemById(Long id) {
        return orderItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Article de commande introuvable : " + id
                        ));
    }

    public OrderItem createOrderItem(OrderItem orderItem) {

        if (orderItem.getOrder() == null
                || orderItem.getOrder().getId() == null) {
            throw new RuntimeException("Commande obligatoire !");
        }

        if (orderItem.getPizza() == null
                || orderItem.getPizza().getId() == null) {
            throw new RuntimeException("Pizza obligatoire !");
        }

        if (orderItem.getSize() == null
                || orderItem.getSize().getId() == null) {
            throw new RuntimeException("Taille obligatoire !");
        }

        if (orderItem.getDough() == null
                || orderItem.getDough().getId() == null) {
            throw new RuntimeException("Pâte obligatoire !");
        }

        if (orderItem.getQuantity() == null
                || orderItem.getQuantity() <= 0) {
            throw new RuntimeException(
                    "La quantité doit être supérieure à zéro !"
            );
        }

        Long orderId = orderItem.getOrder().getId();
        Long pizzaId = orderItem.getPizza().getId();
        Long sizeId = orderItem.getSize().getId();
        Long doughId = orderItem.getDough().getId();

        CustomerOrder order = orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Commande introuvable : " + orderId
                        ));

        Pizza pizza = pizzaRepository.findById(pizzaId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pizza introuvable : " + pizzaId
                        ));

        Size size = sizeRepository.findById(sizeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Taille introuvable : " + sizeId
                        ));

        Dough dough = doughRepository.findById(doughId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pâte introuvable : " + doughId
                        ));

        if (!pizza.isAvailable()) {
            throw new RuntimeException("Cette pizza n'est pas disponible !");
        }

        if (!size.isAvailable()) {
            throw new RuntimeException("Cette taille n'est pas disponible !");
        }

        if (!dough.isAvailable()) {
            throw new RuntimeException("Cette pâte n'est pas disponible !");
        }

        BigDecimal unitPrice = pizza.getPrice()
                .add(size.getExtraPrice())
                .add(dough.getExtraPrice());

        BigDecimal subtotal = unitPrice.multiply(
                BigDecimal.valueOf(orderItem.getQuantity())
        );

        orderItem.setOrder(order);
        orderItem.setPizza(pizza);
        orderItem.setSize(size);
        orderItem.setDough(dough);
        orderItem.setUnitPrice(unitPrice);
        orderItem.setSubtotal(subtotal);

        return orderItemRepository.save(orderItem);
    }

    public void deleteOrderItem(Long id) {
        OrderItem orderItem = getOrderItemById(id);
        orderItemRepository.delete(orderItem);
    }
}
