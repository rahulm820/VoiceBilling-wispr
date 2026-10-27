package com.wemeetdesk.smartledger.controller;

import com.wemeetdesk.smartledger.dto.InsightsDtos;
import com.wemeetdesk.smartledger.security.CurrentUserService;
import com.wemeetdesk.smartledger.service.InsightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/insights")
@RequiredArgsConstructor
public class InsightsController {
    private final InsightsService insightsService;
    private final CurrentUserService currentUserService;

    @GetMapping("/daily")
    public ResponseEntity<InsightsDtos.DailyInsights> daily(@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(insightsService.daily(userId, date));
    }

    @GetMapping("/trend")
    public ResponseEntity<InsightsDtos.TrendResponse> trend(@RequestParam(defaultValue = "7") int days) {
        String userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(insightsService.trend(userId, days));
    }
}
