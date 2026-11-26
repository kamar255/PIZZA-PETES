
package com.pizzapetes.repository;

import com.pizzapetes.entity.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SizeRepository extends JpaRepository<Size, Long> {

    List<Size> findByAvailableTrue();

    Optional<Size> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
