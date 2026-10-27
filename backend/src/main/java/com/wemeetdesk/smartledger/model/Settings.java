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
@Table(name = "settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Settings {
    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", nullable = false, unique = true, length = 36)
    private String userId;

    @Column(name = "owner_name")
    private String ownerName;

    @Column(name = "shop_name")
    private String shopName;

    @Column(name = "shop_phone")
    private String shopPhone;

    @Column(name = "shop_address")
    private String shopAddress;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "default_gst_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultGstRate = new BigDecimal("18.00");

    @Column(name = "gst_on_by_default", nullable = false)
    @Builder.Default
    private Boolean gstOnByDefault = true;

    @Column(name = "default_discount_percent", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal defaultDiscountPercent = BigDecimal.ZERO;

    @Column(name = "discount_on_by_default", nullable = false)
    @Builder.Default
    private Boolean discountOnByDefault = false;

    @Column(name = "bill_number_prefix", nullable = false)
    @Builder.Default
    private String billNumberPrefix = "B-";

    @Column(name = "next_bill_number", nullable = false)
    @Builder.Default
    private Long nextBillNumber = 1L;

    @Column(name = "default_low_stock_threshold", nullable = false)
    @Builder.Default
    private Integer defaultLowStockThreshold = 5;

    @Column(name = "currency_symbol", nullable = false)
    @Builder.Default
    private String currencySymbol = "₹";

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
