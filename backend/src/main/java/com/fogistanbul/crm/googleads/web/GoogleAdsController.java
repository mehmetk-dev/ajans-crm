package com.fogistanbul.crm.googleads.web;

import com.fogistanbul.crm.googleads.application.GoogleAdsAccessPolicy;
import com.fogistanbul.crm.googleads.application.GoogleAdsService;
import com.fogistanbul.crm.googleads.dto.GoogleAdsCustomerIdRequest;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsStatusResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsWriteResponse;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/analytics/google-ads")
@RequiredArgsConstructor
public class GoogleAdsController {

    private final GoogleAdsService googleAdsService;
    private final GoogleOAuthService googleOAuthService;
    private final GoogleAdsAccessPolicy accessPolicy;

    @GetMapping("/status")
    public GoogleAdsStatusResponse status(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        boolean connected = googleOAuthService.isConnected(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        String customerId = googleOAuthService.getAdsCustomerId(companyId).orElse(null);
        String authUrl = googleOAuthService.buildAuthorizationUrl(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        return new GoogleAdsStatusResponse(
                connected,
                connected,
                customerId != null ? customerId : "",
                authUrl);
    }

    @GetMapping("/overview")
    public GoogleAdsOverviewResponse overview(@RequestParam UUID companyId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        return googleAdsService.getOverview(companyId, startDate, endDate);
    }

    @PostMapping("/customer-id")
    public GoogleAdsWriteResponse saveCustomerId(@RequestParam UUID companyId,
            @RequestBody GoogleAdsCustomerIdRequest request,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        String customerId = request.customerId();
        if (customerId == null || customerId.isBlank()) {
            return GoogleAdsWriteResponse.error("customerId bos olamaz");
        }
        googleOAuthService.saveAdsCustomerId(companyId, customerId.trim());
        return GoogleAdsWriteResponse.ok();
    }

    @DeleteMapping("/disconnect")
    public GoogleAdsWriteResponse disconnect(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        googleOAuthService.disconnect(companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        return GoogleAdsWriteResponse.ok();
    }
}
