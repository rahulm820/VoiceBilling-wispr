package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.dto.LedgerDtos;
import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.LedgerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/api/ledger")
@RequiredArgsConstructor
public class LedgerController {
    private final LedgerService ledgerService;
    private final CurrentUserService currentUserService;

    @PostMapping
    public ResponseEntity<LedgerDtos.LedgerEntryEnvelope> create(@Valid @RequestBody LedgerDtos.LedgerEntryRequest req) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(new LedgerDtos.LedgerEntryEnvelope(ledgerService.create(userId, req)));
    }

    @GetMapping
    public ResponseEntity<LedgerDtos.LedgerListResponse> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to
    ) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(ledgerService.list(userId, type, search, from, to));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LedgerDtos.LedgerEntryEnvelope> get(@PathVariable String id) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(new LedgerDtos.LedgerEntryEnvelope(ledgerService.get(userId, id)));
    }
}
