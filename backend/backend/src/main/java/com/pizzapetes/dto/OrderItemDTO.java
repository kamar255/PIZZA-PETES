
package com.pizzapetes.dto;

import java.math.BigDecimal;
import java.util.List;

public class OrderItemDTO {

    private Long pizzaId;
    private String pizzaName;
    private String imageUrl;

    private Long sizeId;
    private String sizeName;

    private Long doughId;
    private String doughName;

    private List<ToppingDTO> toppings;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public OrderItemDTO() {
    }

    public OrderItemDTO(
            Long pizzaId,
            String pizzaName,
            String imageUrl,
            Long sizeId,
            String sizeName,
            Long doughId,
            String doughName,
            List<ToppingDTO> toppings,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal
    ) {
        this.pizzaId = pizzaId;
        this.pizzaName = pizzaName;
        this.imageUrl = imageUrl;
        this.sizeId = sizeId;
        this.sizeName = sizeName;
        this.doughId = doughId;
        this.doughName = doughName;
        this.toppings = toppings;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public Long getPizzaId() {
        return pizzaId;
    }

    public void setPizzaId(Long pizzaId) {
        this.pizzaId = pizzaId;
    }

    public String getPizzaName() {
        return pizzaName;
    }

    public void setPizzaName(String pizzaName) {
        this.pizzaName = pizzaName;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getSizeId() {
        return sizeId;
    }

    public void setSizeId(Long sizeId) {
        this.sizeId = sizeId;
    }

    public String getSizeName() {
        return sizeName;
    }

    public void setSizeName(String sizeName) {
        this.sizeName = sizeName;
    }

    public Long getDoughId() {
        return doughId;
    }

    public void setDoughId(Long doughId) {
        this.doughId = doughId;
    }

    public String getDoughName() {
        return doughName;
    }

    public void setDoughName(String doughName) {
        this.doughName = doughName;
    }

    public List<ToppingDTO> getToppings() {
        return toppings;
    }

    public void setToppings(List<ToppingDTO> toppings) {
        this.toppings = toppings;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }
}
