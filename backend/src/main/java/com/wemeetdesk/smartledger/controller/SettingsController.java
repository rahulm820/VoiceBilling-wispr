package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.dto.SettingsDtos;
import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {
    private final SettingsService settingsService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<SettingsDtos.SettingsResponse> get() {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(settingsService.getOrCreate(userId));
    }

    @PutMapping
    public ResponseEntity<SettingsDtos.SettingsResponse> update(@Valid @RequestBody SettingsDtos.SettingsUpdateRequest req) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(settingsService.update(userId, req));
    }

    @GetMapping("/next-bill-number")
    public ResponseEntity<SettingsDtos.NextBillNumberResponse> nextBillNumber() {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(settingsService.getNextBillNumber(userId));
    }
}
