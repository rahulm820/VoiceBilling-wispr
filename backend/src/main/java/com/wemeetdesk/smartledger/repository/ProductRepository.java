package com.wemeetdesk.smartledger.repository;

import com.wemeetdesk.smartledger.model.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, String> {
    List<Product> findAllByUserId(String userId);

    @Query("SELECT p FROM Product p WHERE p.userId = :userId AND LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Product> searchByUserId(@Param("userId") String userId, @Param("search") String search);

    Optional<Product> findByIdAndUserId(String id, String userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.userId = :userId AND LOWER(p.name) = LOWER(:name) AND LOWER(p.unit) = LOWER(:unit)")
    Optional<Product> findByUserIdAndNameUnit(@Param("userId") String userId, @Param("name") String name, @Param("unit") String unit);
}
