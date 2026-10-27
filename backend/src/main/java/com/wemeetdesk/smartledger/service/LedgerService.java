package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.LedgerDtos;
import com.wemeetdesk.smartledger.model.LedgerEntry;
import com.wemeetdesk.smartledger.model.LedgerItem;
import com.wemeetdesk.smartledger.model.Product;
import com.wemeetdesk.smartledger.repository.LedgerEntryRepository;
import com.wemeetdesk.smartledger.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LedgerService {
    private final LedgerEntryRepository ledgerEntryRepository;
    private final ProductRepository productRepository;

    @CacheEvict(value = "insights", allEntries = true)
    @Transactional
    public LedgerDtos.LedgerEntryResponse create(String userId, LedgerDtos.LedgerEntryRequest req) {
        if (req.items() == null || req.items().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "At least one item required");
        }
        if (req.partyName() == null || req.partyName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Customer name required");
        }

        // recompute
        BigDecimal subtotal = BigDecimal.ZERO;
        for (LedgerDtos.LedgerItemInput it : req.items()) {
            BigDecimal qty = it.quantity() == null ? BigDecimal.ZERO : it.quantity();
            BigDecimal up = it.unitPrice() == null ? BigDecimal.ZERO : it.unitPrice();
            BigDecimal lt = up.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(lt);
        }
        BigDecimal gstRate = req.gstRate() == null ? BigDecimal.ZERO : req.gstRate();
        Boolean gstApplied = Boolean.TRUE.equals(req.gstApplied());
        BigDecimal gstAmount = gstApplied ? subtotal.multiply(gstRate).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal discountPercent = req.discountPercent() == null ? BigDecimal.ZERO : req.discountPercent();
        BigDecimal discountAmount = discountPercent.compareTo(BigDecimal.ZERO) > 0 ? subtotal.multiply(discountPercent).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP) : (req.discountAmount() == null ? BigDecimal.ZERO : req.discountAmount());
        BigDecimal total = subtotal.add(gstAmount).subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
        if (req.total() != null && req.total().compareTo(total) != 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Total mismatch");
        }

        LedgerEntry entry = LedgerEntry.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .type(req.type() == null ? "sale" : req.type().toLowerCase())
                .partyName(req.partyName())
                .partyPhone(req.partyPhone())
                .entryNumber(req.entryNumber())
                .entryDate(req.date() == null ? Instant.now() : req.date())
                .subtotal(subtotal)
                .gstApplied(gstApplied)
                .gstRate(gstRate)
                .gstAmount(gstAmount)
                .discountPercent(discountPercent)
                .discountAmount(discountAmount)
                .grandTotal(total)
                .note(req.note())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        List<String> warnings = new ArrayList<>();
        List<LedgerItem> items = new ArrayList<>();
        for (LedgerDtos.LedgerItemInput it : req.items()) {
            String name = it.name().trim();
            String unit = it.unit().trim();
            BigDecimal qty = it.quantity() == null ? BigDecimal.ZERO : it.quantity();
            BigDecimal up = it.unitPrice() == null ? BigDecimal.ZERO : it.unitPrice();
            BigDecimal lt = up.multiply(qty).setScale(2, RoundingMode.HALF_UP);
            Product product = productRepository.findByUserIdAndNameUnit(userId, name, unit).orElse(null);
            BigDecimal costSnap = product == null ? null : product.getCostPrice();
            if ("sale".equals(entry.getType())) {
                if (product == null) {
                    warnings.add("Item not found in stock. Added anyway: " + name);
                } else {
                    if (product.getStockQuantity().compareTo(qty) < 0) {
                        warnings.add("Only " + product.getStockQuantity() + " " + unit + " available. Clamped to zero for " + name);
                        product.setStockQuantity(BigDecimal.ZERO);
                    } else {
                        product.setStockQuantity(product.getStockQuantity().subtract(qty));
                    }
                    product.setUpdatedAt(Instant.now());
                    productRepository.save(product);
                }
            } else if ("purchase".equals(entry.getType())) {
                if (product == null) {
                    Product p = Product.builder()
                            .id(UUID.randomUUID().toString())
                            .userId(userId)
                            .name(name)
                            .unit(unit)
                            .stockQuantity(qty)
                            .costPrice(up)
                            .defaultSellingPrice(up)
                            .createdAt(Instant.now())
                            .updatedAt(Instant.now())
                            .build();
                    productRepository.save(p);
                    costSnap = up;
                } else {
                    product.setStockQuantity(product.getStockQuantity().add(qty));
                    if (costSnap != null) product.setCostPrice(costSnap);
                    product.setUpdatedAt(Instant.now());
                    productRepository.save(product);
                }
            }
            LedgerItem li = LedgerItem.builder()
                    .id(UUID.randomUUID().toString())
                    .ledgerEntry(entry)
                    .name(name)
                    .quantity(qty)
                    .unit(unit)
                    .unitPrice(up)
                    .lineTotal(lt)
                    .costPriceSnapshot(costSnap)
                    .build();
            items.add(li);
        }
        entry.setItems(items);
        LedgerEntry saved = ledgerEntryRepository.save(entry);
        return map(saved, warnings);
    }

    @Transactional(readOnly = true)
    public LedgerDtos.LedgerListResponse list(String userId, String type, String search, Instant from, Instant to) {
        List<LedgerEntry> entries = ledgerEntryRepository.search(userId, type, search, from, to);
        return new LedgerDtos.LedgerListResponse(entries.stream().map(e -> map(e, List.of())).toList());
    }

    @Transactional(readOnly = true)
    public LedgerDtos.LedgerEntryResponse get(String userId, String id) {
        LedgerEntry e = ledgerEntryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ledger entry not found"));
        return map(e, List.of());
    }

    private LedgerDtos.LedgerEntryResponse map(LedgerEntry e, List<String> warnings) {
        List<LedgerDtos.LedgerItemResponse> items = e.getItems().stream().map(li ->
                new LedgerDtos.LedgerItemResponse(li.getName(), li.getQuantity(), li.getUnit(), li.getUnitPrice(), li.getLineTotal(), li.getCostPriceSnapshot())
        ).toList();
        return new LedgerDtos.LedgerEntryResponse(
                e.getId(), e.getType(), e.getPartyName(), e.getPartyPhone(), e.getEntryNumber(),
                e.getEntryDate(), items, e.getSubtotal(), e.getGstApplied(), e.getGstRate(), e.getGstAmount(),
                e.getDiscountPercent(), e.getDiscountAmount(), e.getGrandTotal(), e.getNote(), e.getCreatedAt(),
                warnings.isEmpty() ? null : warnings
        );
    }
}
