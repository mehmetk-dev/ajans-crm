package com.fogistanbul.crm.googleads.web;

import com.fogistanbul.crm.googleads.application.GoogleAdsAccessPolicy;
import com.fogistanbul.crm.googleads.application.GoogleAdsAccountDiscoveryService;
import com.fogistanbul.crm.googleads.application.GoogleAdsAccountOperationRateLimiter;
import com.fogistanbul.crm.googleads.application.GoogleAdsAccountSelectionService;
import com.fogistanbul.crm.googleads.application.GoogleAdsService;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountListResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountSelectionRequest;
import com.fogistanbul.crm.googleads.dto.GoogleAdsCustomerIdRequest;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsStatusResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsWriteResponse;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.fogistanbul.crm.exception.ApiException;
import org.springframework.http.HttpStatus;
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
    private final GoogleAdsAccountDiscoveryService accountDiscoveryService;
    private final GoogleAdsAccountSelectionService accountSelectionService;
    private final GoogleAdsAccountOperationRateLimiter accountRateLimiter;

    @GetMapping("/status")
    public GoogleAdsStatusResponse status(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        boolean connected = googleOAuthService.isConnected(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        boolean hasAdsScope = connected && googleOAuthService.hasAdsScope(companyId);
        boolean hasValidToken = hasAdsScope && googleOAuthService.getValidAccessToken(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS).isPresent();
        boolean needsReconnect = connected && (!hasAdsScope || !hasValidToken);
        String customerId = googleOAuthService.getAdsCustomerId(companyId).orElse(null);
        String authUrl = googleOAuthService.buildAuthorizationUrl(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        return new GoogleAdsStatusResponse(
                connected,
                hasAdsScope,
                needsReconnect,
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

    @GetMapping("/accounts")
    public GoogleAdsAccountListResponse accounts(
            @RequestParam UUID companyId,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        accessPolicy.requireClientAccess(userId, companyId);
        accountRateLimiter.check(userId, companyId);
        return accountDiscoveryService.discover(companyId);
    }

    @PostMapping("/account-selection")
    public GoogleAdsWriteResponse selectAccount(
            @RequestParam UUID companyId,
            @Valid @RequestBody GoogleAdsAccountSelectionRequest request,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        accessPolicy.requireClientAccess(userId, companyId);
        accountRateLimiter.check(userId, companyId);
        accountSelectionService.select(
                companyId, request.customerId(), request.loginCustomerId());
        return GoogleAdsWriteResponse.ok();
    }

    @PostMapping("/customer-id")
    public GoogleAdsWriteResponse saveCustomerId(@RequestParam UUID companyId,
            @RequestBody GoogleAdsCustomerIdRequest request,
            Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        accountRateLimiter.check((UUID) auth.getPrincipal(), companyId);
        String customerId = request.customerId() != null
                ? request.customerId().replaceAll("[^0-9]", "")
                : "";
        if (!customerId.matches("\\d{10}")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_GOOGLE_ADS_CUSTOMER_ID",
                    "Google Ads müşteri ID'si 10 haneli olmalıdır");
        }
        accountSelectionService.selectByCustomerId(companyId, customerId);
        return GoogleAdsWriteResponse.ok();
    }

    @DeleteMapping("/disconnect")
    public GoogleAdsWriteResponse disconnect(@RequestParam UUID companyId, Authentication auth) {
        accessPolicy.requireClientAccess((UUID) auth.getPrincipal(), companyId);
        googleOAuthService.disconnect(companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
        return GoogleAdsWriteResponse.ok();
    }
}
