package com.fogistanbul.crm.metaads.web;

import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.metaads.application.MetaAdsAccountService;
import com.fogistanbul.crm.metaads.application.MetaAdsAccessPolicy;
import com.fogistanbul.crm.metaads.application.MetaAdsService;
import com.fogistanbul.crm.metaads.dto.MetaAdsAccountRequest;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.metaads.dto.MetaAdsStatusResponse;
import com.fogistanbul.crm.metaads.dto.MetaAdsWriteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/meta-ads")
@RequiredArgsConstructor
public class MetaAdsController {

    private final MetaAdsService metaAdsService;
    private final InstagramOAuthService oAuthService;
    private final MetaAdsAccountService accountService;
    private final MetaAdsAccessPolicy accessPolicy;

    @GetMapping("/status")
    public MetaAdsStatusResponse status(
            @RequestParam UUID companyId,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        boolean connected = oAuthService.isConnected(companyId);
        return new MetaAdsStatusResponse(
                connected,
                accountService.getAdAccountId(companyId).orElse(""),
                connected ? "" : oAuthService.buildAuthorizationUrl(companyId));
    }

    @GetMapping("/overview")
    public MetaAdsOverviewResponse overview(
            @RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        return metaAdsService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/ad-account")
    public MetaAdsWriteResponse saveAdAccount(
            @RequestParam UUID companyId,
            @RequestBody MetaAdsAccountRequest request,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        if (request.adAccountId() == null || request.adAccountId().isBlank()) {
            return MetaAdsWriteResponse.error("adAccountId bos olamaz");
        }
        accountService.saveAdAccountId(
                companyId, request.adAccountId().trim());
        return MetaAdsWriteResponse.ok();
    }

    @DeleteMapping("/disconnect")
    public MetaAdsWriteResponse disconnect(
            @RequestParam UUID companyId,
            Authentication authentication) {
        accessPolicy.requireClientAccess(
                (UUID) authentication.getPrincipal(), companyId);
        accountService.saveAdAccountId(companyId, "");
        return MetaAdsWriteResponse.ok();
    }
}
