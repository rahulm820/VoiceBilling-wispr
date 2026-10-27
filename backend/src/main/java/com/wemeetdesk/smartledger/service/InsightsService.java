package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.InsightsDtos;
import com.wemeetdesk.smartledger.model.LedgerEntry;
import com.wemeetdesk.smartledger.model.LedgerItem;
import com.wemeetdesk.smartledger.model.Product;
import com.wemeetdesk.smartledger.repository.LedgerEntryRepository;
import com.wemeetdesk.smartledger.repository.ProductRepository;
import com.wemeetdesk.smartledger.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsightsService {
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ProductRepository productRepository;
    private final SettingsRepository settingsRepository;

    private static final ZoneId ZONE = ZoneId.of("Asia/Kolkata");

    @Cacheable(value = "insights", key = "#userId + ':' + #date")
    @Transactional(readOnly = true)
    public InsightsDtos.DailyInsights daily(String userId, LocalDate date) {
        LocalDate target = date == null ? LocalDate.now(ZONE) : date;
        LocalDate prev = target.minusDays(1);
        List<LedgerEntry> all = ledgerEntryRepository.findAllByUserIdOrderByEntryDateDesc(userId);
        List<LedgerEntry> today = all.stream().filter(e -> e.getEntryDate().atZone(ZONE).toLocalDate().equals(target)).toList();
        List<LedgerEntry> yesterday = all.stream().filter(e -> e.getEntryDate().atZone(ZONE).toLocalDate().equals(prev)).toList();

        BigDecimal salesToday = today.stream().filter(e -> "sale".equals(e.getType())).map(LedgerEntry::getGrandTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal salesYesterday = yesterday.stream().filter(e -> "sale".equals(e.getType())).map(LedgerEntry::getGrandTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        long salesCount = today.stream().filter(e -> "sale".equals(e.getType())).count();
        BigDecimal avg = salesCount == 0 ? BigDecimal.ZERO : salesToday.divide(BigDecimal.valueOf(salesCount), 2, RoundingMode.HALF_UP);
        BigDecimal purchasesToday = today.stream().filter(e -> "purchase".equals(e.getType())).map(LedgerEntry::getGrandTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossProfit = BigDecimal.ZERO;
        for (LedgerEntry e : today) {
            if ("sale".equals(e.getType())) {
                for (LedgerItem li : e.getItems()) {
                    BigDecimal cost = li.getCostPriceSnapshot() == null ? BigDecimal.ZERO : li.getCostPriceSnapshot();
                    BigDecimal profitItem = li.getUnitPrice().subtract(cost).multiply(li.getQuantity()).setScale(2, RoundingMode.HALF_UP);
                    grossProfit = grossProfit.add(profitItem);
                }
            }
        }

        Double change = null;
        if (salesYesterday.compareTo(BigDecimal.ZERO) > 0) {
            change = salesToday.subtract(salesYesterday).multiply(BigDecimal.valueOf(100)).divide(salesYesterday, 2, RoundingMode.HALF_UP).doubleValue();
        } else if (salesToday.compareTo(BigDecimal.ZERO) > 0) {
            change = 100.0;
        } else {
            change = 0.0;
        }

        Map<String, BigDecimal> qtyMap = new HashMap<>();
        Map<String, BigDecimal> revMap = new HashMap<>();
        for (LedgerEntry e : today) {
            if ("sale".equals(e.getType())) {
                for (LedgerItem li : e.getItems()) {
                    qtyMap.merge(li.getName().toLowerCase(), li.getQuantity(), BigDecimal::add);
                    revMap.merge(li.getName().toLowerCase(), li.getLineTotal(), BigDecimal::add);
                }
            }
        }
        List<InsightsDtos.TopItem> topQty = qtyMap.entrySet().stream()
                .map(e -> new InsightsDtos.TopItem(e.getKey(), e.getValue(), revMap.getOrDefault(e.getKey(), BigDecimal.ZERO)))
                .sorted((a,b) -> b.quantity().compareTo(a.quantity()))
                .limit(5).toList();
        List<InsightsDtos.TopItem> topRev = revMap.entrySet().stream()
                .map(e -> new InsightsDtos.TopItem(e.getKey(), qtyMap.getOrDefault(e.getKey(), BigDecimal.ZERO), e.getValue()))
                .sorted((a,b) -> b.revenue().compareTo(a.revenue()))
                .limit(5).toList();

        Integer defaultThreshold = settingsRepository.findByUserId(userId).map(s -> s.getDefaultLowStockThreshold()).orElse(5);
        List<Product> products = productRepository.findAllByUserId(userId);
        List<InsightsDtos.LowStockItem> lowStock = products.stream().filter(p -> {
            int t = p.getLowStockThreshold() == null ? defaultThreshold : p.getLowStockThreshold();
            return p.getStockQuantity().compareTo(BigDecimal.valueOf(t)) <= 0;
        }).map(p -> {
            int t = p.getLowStockThreshold() == null ? defaultThreshold : p.getLowStockThreshold();
            return new InsightsDtos.LowStockItem(p.getId(), p.getName(), p.getUnit(), p.getStockQuantity(), t);
        }).toList();

        return new InsightsDtos.DailyInsights(target, salesToday, salesCount, avg, purchasesToday, grossProfit, change, topQty, topRev, (long) lowStock.size(), lowStock);
    }

    @Cacheable(value = "insights", key = "#userId + ':trend:' + #days")
    @Transactional(readOnly = true)
    public InsightsDtos.TrendResponse trend(String userId, int days) {
        int d = days == 7 || days == 30 ? days : 7;
        LocalDate end = LocalDate.now(ZONE);
        List<LedgerEntry> all = ledgerEntryRepository.findAllByUserIdOrderByEntryDateDesc(userId);
        List<InsightsDtos.TrendPoint> points = new ArrayList<>();
        for (int i = d - 1; i >= 0; i--) {
            LocalDate day = end.minusDays(i);
            BigDecimal sales = BigDecimal.ZERO;
            BigDecimal purchases = BigDecimal.ZERO;
            BigDecimal profit = BigDecimal.ZERO;
            for (LedgerEntry e : all) {
                if (e.getEntryDate().atZone(ZONE).toLocalDate().equals(day)) {
                    if ("sale".equals(e.getType())) {
                        sales = sales.add(e.getGrandTotal());
                        for (LedgerItem li : e.getItems()) {
                            BigDecimal cost = li.getCostPriceSnapshot() == null ? BigDecimal.ZERO : li.getCostPriceSnapshot();
                            profit = profit.add(li.getUnitPrice().subtract(cost).multiply(li.getQuantity()));
                        }
                    } else if ("purchase".equals(e.getType())) {
                        purchases = purchases.add(e.getGrandTotal());
                    }
                }
            }
            points.add(new InsightsDtos.TrendPoint(day, sales.setScale(2, RoundingMode.HALF_UP), purchases.setScale(2, RoundingMode.HALF_UP), profit.setScale(2, RoundingMode.HALF_UP)));
        }
        return new InsightsDtos.TrendResponse(points);
    }
}
