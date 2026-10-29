package com.wemeetdesk.smartledger.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class LedgerDtos {
    public record LedgerItemInput(
            @NotBlank String name,
            @NotNull BigDecimal quantity,
            @NotBlank String unit,
            @NotNull BigDecimal unitPrice,
            BigDecimal total
    ) {}

    public record LedgerEntryRequest(
            @NotBlank String type,
            String partyName,
            String partyPhone,
            String entryNumber,
            @NotNull Instant date,
            @NotNull @Valid List<LedgerItemInput> items,
            @NotNull BigDecimal subtotal,
            Boolean gstApplied,
            BigDecimal gstRate,
            BigDecimal gstAmount,
            BigDecimal discountPercent,
            BigDecimal discountAmount,
            @NotNull BigDecimal total,
            String note
    ) {}

    public record LedgerItemResponse(
            String name,
            BigDecimal quantity,
            String unit,
            BigDecimal unitPrice,
            BigDecimal total,
            BigDecimal costPriceSnapshot
    ) {}

    public record LedgerEntryResponse(
            String id,
            String type,
            String partyName,
            String partyPhone,
            String entryNumber,
            Instant date,
            List<LedgerItemResponse> items,
            BigDecimal subtotal,
            Boolean gstApplied,
            BigDecimal gstRate,
            BigDecimal gstAmount,
            BigDecimal discountPercent,
            BigDecimal discountAmount,
            BigDecimal total,
            String note,
            Instant createdAt,
            List<String> warnings
    ) {}

    public record LedgerEntryEnvelope(LedgerEntryResponse entry) {}

    public record LedgerListResponse(List<LedgerEntryResponse> entries) {}
}
