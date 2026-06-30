package com.fogistanbul.crm.searchconsole.web;

import com.fogistanbul.crm.searchconsole.application.SearchConsoleAccessPolicy;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleService;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import com.fogistanbul.crm.searchconsole.dto.ScSaveSiteUrlRequest;
import com.fogistanbul.crm.searchconsole.dto.ScSaveSiteUrlResponse;
import com.fogistanbul.crm.searchconsole.dto.ScSiteResponse;
import com.fogistanbul.crm.searchconsole.dto.ScStatusResponse;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/sc")
@RequiredArgsConstructor
public class SearchConsoleController {

    private final SearchConsoleService searchConsoleService;
    private final GoogleOAuthService googleOAuthService;
    private final SearchConsoleAccessPolicy accessPolicy;

    @GetMapping("/status")
    public ScStatusResponse status(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        boolean connected = googleOAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);
        boolean hasScScope = connected;
        boolean needsReconnect = connected && googleOAuthService.isTokenExpired(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);

        String siteUrl = googleOAuthService.getSiteUrl(companyId).orElse(null);
        String authUrl = googleOAuthService.buildAuthorizationUrl(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);
        return new ScStatusResponse(
                connected,
                siteUrl != null ? siteUrl : "",
                hasScScope,
                needsReconnect,
                authUrl);
    }

    @GetMapping("/sites")
    public List<ScSiteResponse> listSites(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        return searchConsoleService.listSites(companyId);
    }

    @GetMapping("/overview")
    public ScOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        return searchConsoleService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/site-url")
    public ScSaveSiteUrlResponse saveSiteUrl(@RequestParam UUID companyId,
            @RequestBody ScSaveSiteUrlRequest request,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        String siteUrl = request.siteUrl();
        if (siteUrl == null || siteUrl.isBlank()) {
            return ScSaveSiteUrlResponse.error("siteUrl bos olamaz");
        }
        googleOAuthService.saveSiteUrl(companyId, siteUrl.trim());
        return ScSaveSiteUrlResponse.ok();
    }

    @DeleteMapping("/disconnect")
    public ScSaveSiteUrlResponse disconnect(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        googleOAuthService.disconnect(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);
        return ScSaveSiteUrlResponse.ok();
    }
}
