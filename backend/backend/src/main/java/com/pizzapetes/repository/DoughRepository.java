
package com.pizzapetes.repository;

import com.pizzapetes.entity.Dough;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoughRepository extends JpaRepository<Dough, Long> {

    List<Dough> findByAvailableTrue();

    Optional<Dough> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
