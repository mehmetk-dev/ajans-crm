package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleoauth.domain.GoogleOAuthToken;
import com.fogistanbul.crm.googleoauth.infrastructure.GoogleOAuthTokenRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
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
    private final GoogleOAuthStateCodec stateCodec;

    public String buildAuthorizationUrl(UUID companyId, String serviceType) {
        String scope = GoogleServiceRegistry.scopeFor(serviceType);
        String state = stateCodec.encode(companyId, serviceType);
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
        GoogleOAuthStateCodec.OAuthState oauthState = stateCodec.decode(state);
        String serviceType = oauthState.serviceType();
        UUID companyId = oauthState.companyId();

        Map<String, Object> tokenResponse = tokenHttpClient.exchangeCodeForTokens(code);
        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn = (Integer) tokenResponse.get("expires_in");
        String scope = (String) tokenResponse.get("scope");

        if (accessToken == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Google token exchange başarısız");
        }

        Instant expiry = Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600);
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Şirket bulunamadı: " + companyId));

        GoogleOAuthToken token = tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType)
                .orElse(GoogleOAuthToken.builder().company(company).serviceType(serviceType).build());

        if (refreshToken == null || refreshToken.isBlank()) {
            refreshToken = token.getRefreshToken();
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR",
                    "Google yenileme tokenı alınamadı; hesabı yeniden bağlayın");
        }

        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setTokenExpiry(expiry);
        token.setScope(scope);

        tokenRepository.save(token);
        log.info("Google OAuth token kaydedildi, company={}, serviceType={}", companyId, serviceType);

        return GoogleServiceRegistry.redirectFor(serviceType);
    }

    public String getRedirectPathForState(String state) {
        return GoogleServiceRegistry.redirectFor(stateCodec.decode(state).serviceType());
    }

    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId, String serviceType) {
        Optional<GoogleOAuthToken> tokenOptional =
                tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType);
        if (tokenOptional.isEmpty()) {
            return Optional.empty();
        }

        GoogleOAuthToken token = tokenOptional.get();
        if (Instant.now().isAfter(token.getTokenExpiry().minusSeconds(60))) {
            String refreshed = refreshAndSave(token);
            if (refreshed == null || refreshed.isBlank()) {
                tokenRepository.deleteByCompanyIdAndServiceType(companyId, serviceType);
                log.warn("Google OAuth token yenilenemedi, bağlantı kaldırıldı company={}, serviceType={}",
                        companyId, serviceType);
                return Optional.empty();
            }
            return Optional.of(refreshed);
        }
        return Optional.ofNullable(token.getAccessToken());
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
        GoogleOAuthToken token = tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS)
                .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT, "GOOGLE_ADS_NOT_CONNECTED",
                        "Önce Google Ads hesabını bağlayın"));
        token.setAdsCustomerId(customerId);
        tokenRepository.save(token);
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

    public boolean isTokenExpired(UUID companyId, String serviceType) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType)
                .map(token -> Instant.now().isAfter(token.getTokenExpiry()))
                .orElse(false);
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
        String requiredScope = GoogleServiceRegistry.scopeFor(SVC_SEARCH_CONSOLE);
        return tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_SEARCH_CONSOLE)
                .map(GoogleOAuthToken::getScope)
                .map(scope -> java.util.Arrays.stream(scope.split("\\s+"))
                        .anyMatch(requiredScope::equals))
                .orElse(false);
    }

    public boolean hasAdsScope(UUID companyId) {
        String requiredScope = GoogleServiceRegistry.scopeFor(SVC_GOOGLE_ADS);
        return tokenRepository.findByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS)
                .map(GoogleOAuthToken::getScope)
                .map(scope -> java.util.Arrays.stream(scope.split("\\s+"))
                        .anyMatch(requiredScope::equals))
                .orElse(false);
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
