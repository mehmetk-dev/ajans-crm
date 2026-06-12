package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.service.MetaAdsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/meta-ads")
@RequiredArgsConstructor
public class MetaAdsController {

    private final MetaAdsService metaAdsService;
    private final InstagramOAuthService igOAuthService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        boolean connected = igOAuthService.isConnected(companyId);
        String adAccountId = igOAuthService.getMetaAdAccountId(companyId).orElse(null);
        String authUrl = !connected ? igOAuthService.buildAuthorizationUrl(companyId) : null;
        return Map.of(
                "connected", connected,
                "adAccountId", adAccountId != null ? adAccountId : "",
                "authUrl", authUrl != null ? authUrl : "");
    }

    @GetMapping("/overview")
    public MetaAdsOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        return metaAdsService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/ad-account")
    public Map<String, String> saveAdAccount(@RequestParam UUID companyId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        String adAccountId = body.get("adAccountId");
        if (adAccountId == null || adAccountId.isBlank()) {
            return Map.of("error", "adAccountId bos olamaz");
        }
        igOAuthService.saveMetaAdAccountId(companyId, adAccountId.trim());
        return Map.of("status", "ok");
    }

    @DeleteMapping("/disconnect")
    public Map<String, String> disconnect(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.AD_MANAGEMENT);
        igOAuthService.saveMetaAdAccountId(companyId, "");
        return Map.of("status", "ok");
    }
}
