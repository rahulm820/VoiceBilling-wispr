package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.ProductDtos;
import com.wemeetdesk.smartledger.model.Product;
import com.wemeetdesk.smartledger.repository.ProductRepository;
import com.wemeetdesk.smartledger.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final SettingsRepository settingsRepository;

    @Transactional(readOnly = true)
    public ProductDtos.ProductListResponse list(String userId, String search) {
        List<Product> products = (search == null || search.isBlank())
                ? productRepository.findAllByUserId(userId)
                : productRepository.searchByUserId(userId, search.trim());
        Integer defaultThreshold = settingsRepository.findByUserId(userId)
                .map(s -> s.getDefaultLowStockThreshold())
                .orElse(5);
        List<ProductDtos.ProductResponse> res = products.stream()
                .map(p -> map(p, defaultThreshold))
                .toList();
        return new ProductDtos.ProductListResponse(res);
    }

    @CacheEvict(value = "insights", allEntries = true)
    @Transactional
    public ProductDtos.ProductUpsertResponse create(String userId, ProductDtos.ProductRequest req) {
        String name = req.name().trim();
        String unit = req.unit().trim();
        validateUnit(unit);
        var existing = productRepository.findByUserIdAndNameUnit(userId, name, unit);
        if (existing.isPresent()) {
            Product p = existing.get();
            BigDecimal add = req.stockQuantity() == null ? BigDecimal.ZERO : req.stockQuantity();
            p.setStockQuantity(p.getStockQuantity().add(add));
            if (req.costPrice() != null) p.setCostPrice(req.costPrice());
            if (req.defaultSellingPrice() != null) p.setDefaultSellingPrice(req.defaultSellingPrice());
            if (req.gstOverride() != null) p.setGstOverride(req.gstOverride());
            if (req.lowStockThreshold() != null) p.setLowStockThreshold(req.lowStockThreshold());
            p.setUpdatedAt(Instant.now());
            Integer defaultThreshold = settingsRepository.findByUserId(userId).map(s -> s.getDefaultLowStockThreshold()).orElse(5);
            return new ProductDtos.ProductUpsertResponse(map(productRepository.save(p), defaultThreshold), "Quantity added to existing item");
        }
        Product p = Product.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .name(name)
                .unit(unit)
                .stockQuantity(req.stockQuantity() == null ? BigDecimal.ZERO : req.stockQuantity())
                .costPrice(req.costPrice() == null ? BigDecimal.ZERO : req.costPrice())
                .defaultSellingPrice(req.defaultSellingPrice() == null ? BigDecimal.ZERO : req.defaultSellingPrice())
                .gstOverride(req.gstOverride())
                .lowStockThreshold(req.lowStockThreshold())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        Integer defaultThreshold = settingsRepository.findByUserId(userId).map(s -> s.getDefaultLowStockThreshold()).orElse(5);
        return new ProductDtos.ProductUpsertResponse(map(productRepository.save(p), defaultThreshold), null);
    }

    @CacheEvict(value = "insights", allEntries = true)
    @Transactional
    public ProductDtos.ProductResponse update(String userId, String id, ProductDtos.ProductUpdateRequest req) {
        Product p = productRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (req.name() != null) {
            if (req.name().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name required");
            p.setName(req.name().trim());
        }
        if (req.unit() != null) {
            validateUnit(req.unit().trim());
            p.setUnit(req.unit().trim());
        }
        if (req.stockQuantity() != null) p.setStockQuantity(req.stockQuantity());
        if (req.costPrice() != null) p.setCostPrice(req.costPrice());
        if (req.defaultSellingPrice() != null) p.setDefaultSellingPrice(req.defaultSellingPrice());
        if (req.gstOverride() != null) p.setGstOverride(req.gstOverride());
        if (req.lowStockThreshold() != null) p.setLowStockThreshold(req.lowStockThreshold());
        p.setUpdatedAt(Instant.now());
        Integer defaultThreshold = settingsRepository.findByUserId(userId).map(s -> s.getDefaultLowStockThreshold()).orElse(5);
        return map(productRepository.save(p), defaultThreshold);
    }

    @CacheEvict(value = "insights", allEntries = true)
    @Transactional
    public void delete(String userId, String id) {
        Product p = productRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        productRepository.delete(p);
    }

    @CacheEvict(value = "insights", allEntries = true)
    @Transactional
    public ProductDtos.ProductListResponse updatePriceSheet(String userId, ProductDtos.PriceSheetRequest req) {
        Integer defaultThreshold = settingsRepository.findByUserId(userId).map(s -> s.getDefaultLowStockThreshold()).orElse(5);
        List<Product> updated = req.items().stream().map(item -> {
            Product p = productRepository.findByIdAndUserId(item.id(), userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
            if (item.defaultSellingPrice() != null) p.setDefaultSellingPrice(item.defaultSellingPrice());
            p.setGstOverride(item.gstOverride());
            p.setUpdatedAt(Instant.now());
            return p;
        }).map(productRepository::save).toList();
        return new ProductDtos.ProductListResponse(updated.stream().map(p -> map(p, defaultThreshold)).toList());
    }

    private void validateUnit(String unit) {
        if (!ProductDtos.ALLOWED_UNITS.contains(unit)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid unit");
        }
    }

    private ProductDtos.ProductResponse map(Product p, Integer defaultThreshold) {
        int threshold = p.getLowStockThreshold() == null ? defaultThreshold : p.getLowStockThreshold();
        boolean lowStock = p.getStockQuantity().compareTo(BigDecimal.valueOf(threshold)) <= 0;
        return new ProductDtos.ProductResponse(
                p.getId(),
                p.getName(),
                p.getUnit(),
                p.getStockQuantity(),
                p.getCostPrice(),
                p.getDefaultSellingPrice(),
                p.getGstOverride(),
                p.getLowStockThreshold(),
                lowStock,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
