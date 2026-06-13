package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.googleoauth.domain.GoogleOAuthToken;
import com.fogistanbul.crm.googleoauth.infrastructure.GoogleOAuthTokenRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthService.class);
    private static final String AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

    public static final String SVC_ANALYTICS = GoogleServiceRegistry.SVC_ANALYTICS;
    public static final String SVC_SEARCH_CONSOLE = GoogleServiceRegistry.SVC_SEARCH_CONSOLE;
    public static final String SVC_GOOGLE_ADS = GoogleServiceRegistry.SVC_GOOGLE_ADS;

    @Value("${app.google-oauth.client-id}")
    private String clientId;

    @Value("${app.google-oauth.redirect-uri}")
    private String redirectUri;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final GoogleOAuthTokenRepository tokenRepository;
    private final CompanyRepository companyRepository;
    private final GoogleTokenHttpClient tokenHttpClient;

    public String buildAuthorizationUrl(UUID companyId, String serviceType) {
        String scope = GoogleServiceRegistry.scopeFor(serviceType);
        String state = companyId.toString() + ":" + serviceType;
        return UriComponentsBuilder.fromHttpUrl(AUTH_URL)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("scope", scope)
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .toUriString();
    }

    public String buildAuthorizationUrl(UUID companyId) {
        return buildAuthorizationUrl(companyId, SVC_ANALYTICS);
    }

    @Transactional
    public String handleCallback(String code, String state) {
        String serviceType = SVC_ANALYTICS;
        UUID companyId;
        if (state.contains(":")) {
            String[] parts = state.split(":", 2);
            companyId = UUID.fromString(parts[0]);
            serviceType = parts[1];
        } else {
            companyId = UUID.fromString(state);
        }

        Map<String, Object> tokenResponse = tokenHttpClient.exchangeCodeForTokens(code);
        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        String scope = (String) tokenResponse.get("scope");

        if (accessToken == null || refreshToken == null) {
            throw new IllegalStateException("Google token exchange başarısız: access_token veya refresh_token eksik");
        }

        Instant expiry = Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Şirket bulunamadı: " + companyId));

        GoogleOAuthToken token = tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType)
                .orElse(GoogleOAuthToken.builder().company(company).serviceType(serviceType).build());

        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setTokenExpiry(expiry);
        token.setScope(scope);

        tokenRepository.save(token);
        log.info("Google OAuth token kaydedildi, company={}, serviceType={}", companyId, serviceType);

        return GoogleServiceRegistry.redirectFor(serviceType);
    }

    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId, String serviceType) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType).map(token -> {
            if (Instant.now().isAfter(token.getTokenExpiry().minusSeconds(60))) {
                return refreshAndSave(token);
            }
            return token.getAccessToken();
        });
    }

    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId) {
        return getValidAccessToken(companyId, SVC_ANALYTICS);
    }

    @Transactional
    public void savePropertyId(UUID companyId, String propertyId) {
        tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_ANALYTICS).ifPresent(token -> {
            token.setGaPropertyId(propertyId);
            tokenRepository.save(token);
        });
    }

    public Optional<String> getPropertyId(UUID companyId) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_ANALYTICS)
                .map(GoogleOAuthToken::getGaPropertyId);
    }

    @Transactional
    public void saveSiteUrl(UUID companyId, String siteUrl) {
        tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_SEARCH_CONSOLE).ifPresent(token -> {
            token.setScSiteUrl(siteUrl);
            tokenRepository.save(token);
        });
    }

    public Optional<String> getSiteUrl(UUID companyId) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_SEARCH_CONSOLE)
                .map(GoogleOAuthToken::getScSiteUrl);
    }

    @Transactional
    public void saveAdsCustomerId(UUID companyId, String customerId) {
        tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS).ifPresent(token -> {
            token.setAdsCustomerId(customerId.replaceAll("[^0-9]", ""));
            tokenRepository.save(token);
        });
    }

    public Optional<String> getAdsCustomerId(UUID companyId) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS)
                .map(GoogleOAuthToken::getAdsCustomerId);
    }

    public boolean isConnected(UUID companyId, String serviceType) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, serviceType);
    }

    public boolean isConnected(UUID companyId) {
        return isConnected(companyId, SVC_ANALYTICS);
    }

    @Transactional
    public void disconnect(UUID companyId, String serviceType) {
        tokenRepository.deleteByCompanyIdAndServiceType(companyId, serviceType);
        log.info("Google bağlantısı kaldırıldı, company={}, serviceType={}", companyId, serviceType);
    }

    @Transactional
    public void disconnect(UUID companyId) {
        disconnect(companyId, SVC_ANALYTICS);
    }

    public boolean hasScScope(UUID companyId) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, SVC_SEARCH_CONSOLE);
    }

    public boolean hasAdsScope(UUID companyId) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS);
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    private String refreshAndSave(GoogleOAuthToken token) {
        String refreshed = tokenHttpClient.refreshAccessToken(token);
        if (refreshed != null && !refreshed.equals(token.getAccessToken())) {
            tokenRepository.save(token);
        }
        return refreshed;
    }
}
