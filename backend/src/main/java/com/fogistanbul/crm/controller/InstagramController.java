package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.IgOverviewResponse;
import com.fogistanbul.crm.dto.IgOverviewResponse.IgPostRow;
import com.fogistanbul.crm.dto.IgOverviewResponse.IgReelRow;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.service.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.InstagramOAuthService;
import com.fogistanbul.crm.service.InstagramService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/ig")
@RequiredArgsConstructor
public class InstagramController {

    private final InstagramOAuthService instagramOAuthService;
    private final InstagramService instagramService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping("/status")
    public Map<String, Object> status(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.SOCIAL_MEDIA);
        boolean configured = instagramOAuthService.isConfigured();
        boolean connected = instagramOAuthService.isConnected(companyId);
        String authUrl = configured ? instagramOAuthService.buildAuthorizationUrl(companyId) : "";

        String username = "";
        String igUserId = "";
        if (connected) {
            var token = instagramOAuthService.getToken(companyId);
            if (token.isPresent()) {
                username = token.get().getIgUsername() != null ? token.get().getIgUsername() : "";
                igUserId = token.get().getIgUserId() != null ? token.get().getIgUserId() : "";
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("configured", configured);
        result.put("connected", connected);
        result.put("authUrl", authUrl);
        result.put("username", username);
        result.put("igUserId", igUserId);
        return result;
    }

    @GetMapping("/overview")
    public IgOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.SOCIAL_MEDIA);
        return instagramService.getOverview(companyId, startDate, endDate);
    }

    @GetMapping("/reels")
    public List<IgReelRow> reels(@RequestParam UUID companyId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.SOCIAL_MEDIA);
        return instagramService.getReels(companyId, Math.min(limit, 25));
    }

    @GetMapping("/posts")
    public List<IgPostRow> posts(@RequestParam UUID companyId,
            @RequestParam(defaultValue = "30") int limit,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.SOCIAL_MEDIA);
        return instagramService.getPosts(companyId, Math.min(limit, 50));
    }

    @DeleteMapping("/disconnect")
    public Map<String, String> disconnect(@RequestParam UUID companyId, Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.SOCIAL_MEDIA);
        instagramOAuthService.disconnect(companyId);
        return Map.of("status", "ok");
    }
}
