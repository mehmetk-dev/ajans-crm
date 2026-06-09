package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.ScOverviewResponse;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.GoogleOAuthService;
import com.fogistanbul.crm.service.SearchConsoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/sc")
@RequiredArgsConstructor
public class SearchConsoleController {

    private final SearchConsoleService searchConsoleService;
    private final GoogleOAuthService googleOAuthService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.DIGITAL_MARKETING);
        boolean connected = googleOAuthService.isConnected(companyId, "SEARCH_CONSOLE");
        String siteUrl = googleOAuthService.getSiteUrl(companyId).orElse(null);
        String authUrl = googleOAuthService.buildAuthorizationUrl(companyId, "SEARCH_CONSOLE");

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("connected", connected);
        result.put("siteUrl", siteUrl != null ? siteUrl : "");
        result.put("hasScScope", connected);
        result.put("needsReconnect", false);
        result.put("authUrl", authUrl);
        return result;
    }

    @GetMapping("/sites")
    public List<Map<String, String>> listSites(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.DIGITAL_MARKETING);
        return searchConsoleService.listSites(companyId);
    }

    @GetMapping("/overview")
    public ScOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.DIGITAL_MARKETING);
        return searchConsoleService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/site-url")
    public Map<String, String> saveSiteUrl(@RequestParam UUID companyId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.DIGITAL_MARKETING);
        String siteUrl = body.get("siteUrl");
        if (siteUrl == null || siteUrl.isBlank()) {
            return Map.of("error", "siteUrl bos olamaz");
        }
        googleOAuthService.saveSiteUrl(companyId, siteUrl.trim());
        return Map.of("status", "ok");
    }
}
