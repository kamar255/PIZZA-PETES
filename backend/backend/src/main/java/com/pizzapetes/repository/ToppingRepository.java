
package com.pizzapetes.repository;

import com.pizzapetes.entity.Topping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ToppingRepository extends JpaRepository<Topping, Long> {

    List<Topping> findByAvailableTrue();

    Optional<Topping> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
