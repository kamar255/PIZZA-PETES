
package com.pizzapetes.dto;

import java.util.List;

public class CreateOrderRequest {

    private String deliveryAddress;
    private String orderType;
    private List<OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(
            String deliveryAddress,
            String orderType,
            List<OrderItemRequest> items
    ) {
        this.deliveryAddress = deliveryAddress;
        this.orderType = orderType;
        this.items = items;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
