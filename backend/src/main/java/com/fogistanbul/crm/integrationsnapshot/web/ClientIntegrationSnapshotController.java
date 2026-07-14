package com.fogistanbul.crm.integrationsnapshot.web;

import com.fogistanbul.crm.integrationsnapshot.application.ClientIntegrationSnapshotService;
import com.fogistanbul.crm.integrationsnapshot.dto.ClientIntegrationSnapshotOverviewResponse;
import com.fogistanbul.crm.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/integration-snapshots")
@RequiredArgsConstructor
public class ClientIntegrationSnapshotController {

    private final ClientIntegrationSnapshotService service;
    private final CurrentUser currentUser;

    @GetMapping("/overview")
    public ClientIntegrationSnapshotOverviewResponse overview(
            @RequestParam UUID companyId,
            Authentication authentication) {
        return service.getOverview(currentUser.id(authentication), companyId);
    }

    @PostMapping("/overview/refresh")
    public void refreshOverview(
            @RequestParam UUID companyId,
            Authentication authentication) {
        service.refreshOverview(currentUser.id(authentication), companyId);
    }

    @PostMapping("/search-console/refresh")
    public void refreshSearchConsole(
            @RequestParam UUID companyId,
            Authentication authentication) {
        service.refreshSearchConsole(currentUser.id(authentication), companyId);
    }

    @PostMapping("/google-ads/refresh")
    public void refreshGoogleAds(
            @RequestParam UUID companyId,
            Authentication authentication) {
        service.refreshGoogleAds(currentUser.id(authentication), companyId);
    }
}
