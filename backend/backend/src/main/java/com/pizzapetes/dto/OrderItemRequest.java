
package com.pizzapetes.dto;

import java.util.List;

public class OrderItemRequest {

    private Long pizzaId;
    private Long sizeId;
    private Long doughId;
    private List<Long> toppingIds;
    private Integer quantity;

    public OrderItemRequest() {
    }

    public OrderItemRequest(
            Long pizzaId,
            Long sizeId,
            Long doughId,
            List<Long> toppingIds,
            Integer quantity
    ) {
        this.pizzaId = pizzaId;
        this.sizeId = sizeId;
        this.doughId = doughId;
        this.toppingIds = toppingIds;
        this.quantity = quantity;
    }

    public Long getPizzaId() {
        return pizzaId;
    }

    public void setPizzaId(Long pizzaId) {
        this.pizzaId = pizzaId;
    }

    public Long getSizeId() {
        return sizeId;
    }

    public void setSizeId(Long sizeId) {
        this.sizeId = sizeId;
    }

    public Long getDoughId() {
        return doughId;
    }

    public void setDoughId(Long doughId) {
        this.doughId = doughId;
    }

    public List<Long> getToppingIds() {
        return toppingIds;
    }

    public void setToppingIds(List<Long> toppingIds) {
        this.toppingIds = toppingIds;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
