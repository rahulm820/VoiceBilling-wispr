package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.dto.ProductDtos;
import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<ProductDtos.ProductListResponse> list(@RequestParam(required = false) String search) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(productService.list(userId, search));
    }

    @PostMapping
    public ResponseEntity<ProductDtos.ProductUpsertResponse> create(@Valid @RequestBody ProductDtos.ProductRequest req) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(productService.create(userId, req));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProductDtos.ProductResponse> update(@PathVariable String id, @Valid @RequestBody ProductDtos.ProductUpdateRequest req) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(productService.update(userId, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Boolean>> delete(@PathVariable String id) {
        String userId = currentUserService.getCurrentUserId();
        productService.delete(userId, id);
        return ResponseEntity.ok(java.util.Map.of("success", true));
    }

    @PutMapping("/price-sheet")
    public ResponseEntity<ProductDtos.ProductListResponse> priceSheet(@Valid @RequestBody ProductDtos.PriceSheetRequest req) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(productService.updatePriceSheet(userId, req));
    }
}
