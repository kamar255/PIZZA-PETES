
package com.pizzapetes.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "doughs")
public class Dough {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extraPrice;

    @Column(nullable = false)
    private boolean available = true;

    // Constructeur vide
    public Dough() {
    }

    // Constructeur avec paramètres
    public Dough(String name, String description, BigDecimal extraPrice) {
        this.name = name;
        this.description = description;
        this.extraPrice = extraPrice;
        this.available = true;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getExtraPrice() {
        return extraPrice;
    }

    public void setExtraPrice(BigDecimal extraPrice) {
        this.extraPrice = extraPrice;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
