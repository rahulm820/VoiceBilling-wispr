package com.wemeetdesk.smartledger.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class ProductDtos {
    public static final List<String> ALLOWED_UNITS = List.of("kg", "g", "L", "ml", "pcs", "dozen", "packets", "bottles", "bags", "litres", "sachets", "boxes", "meters", "feet");

    public record ProductRequest(
            @NotBlank String name,
            @NotBlank String unit,
            BigDecimal stockQuantity,
            BigDecimal costPrice,
            BigDecimal defaultSellingPrice,
            BigDecimal gstOverride,
            Integer lowStockThreshold
    ) {}

    public record ProductUpdateRequest(
            String name,
            String unit,
            BigDecimal stockQuantity,
            BigDecimal costPrice,
            BigDecimal defaultSellingPrice,
            BigDecimal gstOverride,
            Integer lowStockThreshold
    ) {}

    public record ProductResponse(
            String id,
            String name,
            String unit,
            BigDecimal stockQuantity,
            BigDecimal costPrice,
            BigDecimal defaultSellingPrice,
            BigDecimal gstOverride,
            Integer lowStockThreshold,
            Boolean lowStock,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record ProductListResponse(List<ProductResponse> products) {}

    public record PriceSheetItem(String id, BigDecimal defaultSellingPrice, BigDecimal gstOverride) {}

    public record PriceSheetRequest(@NotNull List<PriceSheetItem> items) {}

    public record ProductUpsertResponse(ProductResponse product, String message) {}
}
