
package com.pizzapetes.repository;

import com.pizzapetes.entity.CustomerOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {

    List<CustomerOrder> findByUserId(Long userId);

    List<CustomerOrder> findByStatus(
            com.pizzapetes.enums.OrderStatus status
    );

    List<CustomerOrder> findAllByOrderByOrderDateDesc();
}
