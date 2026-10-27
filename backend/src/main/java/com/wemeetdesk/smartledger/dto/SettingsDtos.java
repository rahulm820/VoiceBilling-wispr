package com.wemeetdesk.smartledger.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class SettingsDtos {
    public record SettingsResponse(
            String ownerName,
            String shopName,
            String shopPhone,
            String shopAddress,
            String gstNumber,
            BigDecimal defaultGstRate,
            Boolean gstOnByDefault,
            BigDecimal defaultDiscountPercent,
            Boolean discountOnByDefault,
            String billNumberPrefix,
            Long nextBillNumber,
            Integer defaultLowStockThreshold,
            String currencySymbol
    ) {}

    public record SettingsUpdateRequest(
            String ownerName,
            String shopName,
            String shopPhone,
            String shopAddress,
            String gstNumber,
            @NotNull @Min(0) @Max(100) BigDecimal defaultGstRate,
            @NotNull Boolean gstOnByDefault,
            @NotNull @Min(0) @Max(100) BigDecimal defaultDiscountPercent,
            @NotNull Boolean discountOnByDefault,
            String billNumberPrefix,
            @NotNull @Min(0) Integer defaultLowStockThreshold,
            String currencySymbol
    ) {}

    public record NextBillNumberResponse(String billNumber) {}
}
