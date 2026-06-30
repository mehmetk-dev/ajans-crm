package com.fogistanbul.crm.instagram.web;

import com.fogistanbul.crm.instagram.application.InstagramAccessPolicy;
import com.fogistanbul.crm.instagram.application.InstagramMediaService;
import com.fogistanbul.crm.instagram.application.InstagramOverviewService;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.PostRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.ReelRow;
import com.fogistanbul.crm.instagram.dto.InstagramStatusResponse;
import com.fogistanbul.crm.instagram.dto.InstagramWriteResponse;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/ig")
@RequiredArgsConstructor
public class InstagramController {

    private final InstagramOAuthService oAuthService;
    private final InstagramOverviewService overviewService;
    private final InstagramMediaService mediaService;
    private final InstagramAccessPolicy accessPolicy;

    @GetMapping("/status")
    public InstagramStatusResponse status(
            @RequestParam UUID companyId,
            @RequestParam(required = false) String returnPath,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        boolean configured = oAuthService.isConfigured();
        boolean connected = oAuthService.isConnected(companyId);
        var token = connected ? oAuthService.getToken(companyId).orElse(null) : null;
        return new InstagramStatusResponse(
                configured,
                connected,
                configured ? oAuthService.buildAuthorizationUrl(companyId, returnPath) : "",
                token != null && token.getIgUsername() != null
                        ? token.getIgUsername()
                        : "",
                token != null && token.getIgUserId() != null
                        ? token.getIgUserId()
                        : "");
    }

    @GetMapping("/overview")
    public InstagramOverviewResponse overview(
            @RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        return overviewService.getOverview(companyId, startDate, endDate);
    }

    @GetMapping("/reels")
    public List<ReelRow> reels(
            @RequestParam UUID companyId,
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        return mediaService.getReels(companyId, Math.max(0, Math.min(limit, 25)));
    }

    @GetMapping("/posts")
    public List<PostRow> posts(
            @RequestParam UUID companyId,
            @RequestParam(defaultValue = "30") int limit,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        return mediaService.getPosts(companyId, Math.max(0, Math.min(limit, 50)));
    }

    @DeleteMapping("/disconnect")
    public InstagramWriteResponse disconnect(
            @RequestParam UUID companyId,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        oAuthService.disconnect(companyId);
        return InstagramWriteResponse.ok();
    }
}
