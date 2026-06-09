package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.GoogleAdsService;
import com.fogistanbul.crm.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/google-ads")
@RequiredArgsConstructor
public class GoogleAdsController {

    private final GoogleAdsService googleAdsService;
    private final GoogleOAuthService googleOAuthService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        boolean connected = googleOAuthService.isConnected(companyId, "GOOGLE_ADS");
        String customerId = googleOAuthService.getAdsCustomerId(companyId).orElse(null);
        String authUrl = !connected ? googleOAuthService.buildAuthorizationUrl(companyId, "GOOGLE_ADS") : null;
        return Map.of(
                "connected", connected,
                "hasAdsScope", connected,
                "customerId", customerId != null ? customerId : "",
                "authUrl", authUrl != null ? authUrl : "");
    }

    @GetMapping("/overview")
    public GoogleAdsOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        return googleAdsService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/customer-id")
    public Map<String, String> saveCustomerId(@RequestParam UUID companyId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        String customerId = body.get("customerId");
        if (customerId == null || customerId.isBlank()) {
            return Map.of("error", "customerId bos olamaz");
        }
        googleOAuthService.saveAdsCustomerId(companyId, customerId.trim());
        return Map.of("status", "ok");
    }

    @DeleteMapping("/disconnect")
    public Map<String, String> disconnect(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        googleOAuthService.saveAdsCustomerId(companyId, "");
        return Map.of("status", "ok");
    }
}
