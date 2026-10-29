package com.wemeetdesk.smartledger.service;

import com.wemeetdesk.smartledger.dto.SettingsDtos;
import com.wemeetdesk.smartledger.model.Settings;
import com.wemeetdesk.smartledger.repository.SettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SettingsService {
    private final SettingsRepository settingsRepository;

    @Cacheable(value = "settings", key = "#userId")
    @Transactional
    public SettingsDtos.SettingsResponse getOrCreate(String userId) {
        Settings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaults(userId));
        return map(settings);
    }

    private Settings createDefaults(String userId) {
        Settings s = Settings.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .defaultGstRate(new BigDecimal("18.00"))
                .gstOnByDefault(true)
                .defaultDiscountPercent(BigDecimal.ZERO)
                .discountOnByDefault(false)
                .billNumberPrefix("B-")
                .nextBillNumber(1L)
                .defaultLowStockThreshold(5)
                .currencySymbol("₹")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        return settingsRepository.save(s);
    }

    @Caching(evict = {
            @CacheEvict(value = "settings", key = "#userId"),
            @CacheEvict(value = "insights", allEntries = true)
    })
    @Transactional
    public SettingsDtos.SettingsResponse update(String userId, SettingsDtos.SettingsUpdateRequest req) {
        Settings settings = settingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaults(userId));
        settings.setOwnerName(req.ownerName());
        settings.setShopName(req.shopName());
        settings.setShopPhone(req.shopPhone());
        settings.setShopAddress(req.shopAddress());
        settings.setGstNumber(req.gstNumber());
        settings.setDefaultGstRate(req.defaultGstRate());
        settings.setGstOnByDefault(req.gstOnByDefault());
        settings.setDefaultDiscountPercent(req.defaultDiscountPercent());
        settings.setDiscountOnByDefault(req.discountOnByDefault());
        if (req.billNumberPrefix() != null) settings.setBillNumberPrefix(req.billNumberPrefix());
        settings.setDefaultLowStockThreshold(req.defaultLowStockThreshold());
        if (req.currencySymbol() != null) settings.setCurrencySymbol(req.currencySymbol());
        settings.setUpdatedAt(Instant.now());
        return map(settingsRepository.save(settings));
    }

    @CacheEvict(value = "settings", key = "#userId")
    @Transactional
    public SettingsDtos.NextBillNumberResponse getNextBillNumber(String userId) {
        Settings settings = settingsRepository.findByUserIdForUpdate(userId)
                .orElseGet(() -> createDefaults(userId));
        String billNo = settings.getBillNumberPrefix() + settings.getNextBillNumber();
        settings.setNextBillNumber(settings.getNextBillNumber() + 1);
        settingsRepository.save(settings);
        return new SettingsDtos.NextBillNumberResponse(billNo);
    }

    private SettingsDtos.SettingsResponse map(Settings s) {
        return new SettingsDtos.SettingsResponse(
                s.getOwnerName(),
                s.getShopName(),
                s.getShopPhone(),
                s.getShopAddress(),
                s.getGstNumber(),
                s.getDefaultGstRate(),
                s.getGstOnByDefault(),
                s.getDefaultDiscountPercent(),
                s.getDiscountOnByDefault(),
                s.getBillNumberPrefix(),
                s.getNextBillNumber(),
                s.getDefaultLowStockThreshold(),
                s.getCurrencySymbol()
        );
    }
}
