package com.wemeetdesk.smartledger.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class InsightsDtos {
    public record TopItem(String name, BigDecimal quantity, BigDecimal revenue) {}

    public record LowStockItem(String id, String name, String unit, BigDecimal stockQuantity, Integer threshold) {}

    public record DailyInsights(
            LocalDate date,
            BigDecimal salesToday,
            Long salesCount,
            BigDecimal averageSaleValue,
            BigDecimal purchasesToday,
            BigDecimal estimatedGrossProfit,
            Double salesChangePercent,
            List<TopItem> topByQuantity,
            List<TopItem> topByRevenue,
            Long lowStockCount,
            List<LowStockItem> lowStockItems
    ) {}

    public record TrendPoint(LocalDate date, BigDecimal sales, BigDecimal purchases, BigDecimal profit) {}

    public record TrendResponse(List<TrendPoint> days) {}
}
