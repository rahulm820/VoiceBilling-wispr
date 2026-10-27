package com.wemeetdesk.smartledger.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 20)
    private String unit;

    @Column(name = "stock_quantity", nullable = false, precision = 18, scale = 3)
    @Builder.Default
    private BigDecimal stockQuantity = BigDecimal.ZERO;

    @Column(name = "cost_price", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "default_selling_price", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal defaultSellingPrice = BigDecimal.ZERO;

    @Column(name = "gst_override", precision = 5, scale = 2)
    private BigDecimal gstOverride;

    @Column(name = "low_stock_threshold")
    private Integer lowStockThreshold;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = Instant.now();
    }
}
