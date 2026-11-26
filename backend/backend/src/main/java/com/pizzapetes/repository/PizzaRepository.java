
package com.pizzapetes.repository;

import com.pizzapetes.entity.Pizza;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PizzaRepository extends JpaRepository<Pizza, Long> {

    List<Pizza> findByAvailableTrue();

    List<Pizza> findByNameContainingIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
