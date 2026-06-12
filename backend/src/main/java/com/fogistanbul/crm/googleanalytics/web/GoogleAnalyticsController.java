package com.fogistanbul.crm.googleanalytics.web;

import com.fogistanbul.crm.googleanalytics.application.GoogleAnalyticsAccessPolicy;
import com.fogistanbul.crm.googleanalytics.application.GoogleAnalyticsService;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/ga")
@RequiredArgsConstructor
public class GoogleAnalyticsController {

    private final GoogleAnalyticsService analyticsService;
    private final GoogleOAuthService googleOAuthService;
    private final GoogleAnalyticsAccessPolicy accessPolicy;

    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        boolean connected = googleOAuthService.isConnected(companyId);
        String propertyId = googleOAuthService.getPropertyId(companyId).orElse(null);
        String authUrl = connected ? null : googleOAuthService.buildAuthorizationUrl(companyId, "ANALYTICS");
        return Map.of(
                "connected", connected,
                "propertyId", propertyId != null ? propertyId : "",
                "authUrl", authUrl != null ? authUrl : "");
    }

    @GetMapping("/overview")
    public GaOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        return analyticsService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/property")
    public Map<String, String> saveProperty(@RequestParam UUID companyId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        String propertyId = body.get("propertyId");
        if (propertyId == null || propertyId.isBlank()) {
            return Map.of("error", "propertyId bos olamaz");
        }
        googleOAuthService.savePropertyId(companyId, propertyId.trim());
        return Map.of("status", "ok");
    }

    @DeleteMapping("/disconnect")
    public Map<String, String> disconnect(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        googleOAuthService.disconnect(companyId, "ANALYTICS");
        return Map.of("status", "ok");
    }
}
