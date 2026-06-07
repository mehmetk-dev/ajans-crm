package com.fogistanbul.crm.service;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.GoogleOAuthToken;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.GoogleOAuthTokenRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleOAuthService.class);

    private static final String AUTH_URL  = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    public static final String SVC_ANALYTICS      = "ANALYTICS";
    public static final String SVC_SEARCH_CONSOLE  = "SEARCH_CONSOLE";
    public static final String SVC_GOOGLE_ADS      = "GOOGLE_ADS";

    private static final Map<String, String> SCOPE_MAP = Map.of(
            SVC_ANALYTICS,      "https://www.googleapis.com/auth/analytics.readonly",
            SVC_SEARCH_CONSOLE, "https://www.googleapis.com/auth/webmasters.readonly",
            SVC_GOOGLE_ADS,     "https://www.googleapis.com/auth/adwords"
    );

    private static final Map<String, String> REDIRECT_MAP = Map.of(
            SVC_ANALYTICS,      "/client/google-analytics?connected=true",
            SVC_SEARCH_CONSOLE, "/client/search-console?connected=true",
            SVC_GOOGLE_ADS,     "/client/google-ads?connected=true"
    );

    @Value("${app.google-oauth.client-id}")
    private String clientId;

    @Value("${app.google-oauth.client-secret}")
    private String clientSecret;

    @Value("${app.google-oauth.redirect-uri}")
    private String redirectUri;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final GoogleOAuthTokenRepository tokenRepository;
    private final CompanyRepository companyRepository;
    private final RestTemplate restTemplate;

    // ─── Authorization URL (servis bazlı) ────────────────────────────────────

    public String buildAuthorizationUrl(UUID companyId, String serviceType) {
        String scope = SCOPE_MAP.getOrDefault(serviceType, SCOPE_MAP.get(SVC_ANALYTICS));
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

    /** Eski tek-scope buildAuthorizationUrl — geriye uyumluluk */
    public String buildAuthorizationUrl(UUID companyId) {
        return buildAuthorizationUrl(companyId, SVC_ANALYTICS);
    }

    // ─── Callback: code → token exchange ─────────────────────────────────────

    @Transactional
    public String handleCallback(String code, String state) {
        // state = "companyId:SERVICE_TYPE" veya sadece "companyId"
        String serviceType = SVC_ANALYTICS;
        UUID companyId;
        if (state.contains(":")) {
            String[] parts = state.split(":", 2);
            companyId = UUID.fromString(parts[0]);
            serviceType = parts[1];
        } else {
            companyId = UUID.fromString(state);
        }

        Map<String, Object> tokenResponse = exchangeCodeForTokens(code);

        String accessToken  = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");
        Integer expiresIn   = (Integer) tokenResponse.get("expires_in");
        String scope        = (String) tokenResponse.get("scope");

        if (accessToken == null || refreshToken == null) {
            throw new IllegalStateException("Google token exchange başarısız: access_token veya refresh_token eksik");
        }

        Instant expiry = Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Şirket bulunamadı: " + companyId));

        // Upsert — servis bazlı
        GoogleOAuthToken token = tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType)
                .orElse(GoogleOAuthToken.builder().company(company).serviceType(serviceType).build());

        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setTokenExpiry(expiry);
        token.setScope(scope);

        tokenRepository.save(token);
        log.info("Google OAuth token kaydedildi, company={}, serviceType={}", companyId, serviceType);

        return REDIRECT_MAP.getOrDefault(serviceType, "/client/analytics");
    }

    // ─── Token erişimi (servis bazlı, refresh gerekirse otomatik yenile) ─────

    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId, String serviceType) {
        return tokenRepository.findByCompanyIdAndServiceType(companyId, serviceType).map(token -> {
            if (Instant.now().isAfter(token.getTokenExpiry().minusSeconds(60))) {
                return refreshAccessToken(token);
            }
            return token.getAccessToken();
        });
    }

    /** Eski — geriye uyumluluk (ANALYTICS varsayılan) */
    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId) {
        return getValidAccessToken(companyId, SVC_ANALYTICS);
    }

    // ─── GA Property ID ──────────────────────────────────────────────────────

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

    // ─── Search Console Site URL ─────────────────────────────────────────────

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

    // ─── Google Ads Customer ID ──────────────────────────────────────────────

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

    // ─── Bağlantı durumu (servis bazlı) ──────────────────────────────────────

    public boolean isConnected(UUID companyId, String serviceType) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, serviceType);
    }

    public boolean isConnected(UUID companyId) {
        return isConnected(companyId, SVC_ANALYTICS);
    }

    // ─── Bağlantıyı kes (servis bazlı) ──────────────────────────────────────

    @Transactional
    public void disconnect(UUID companyId, String serviceType) {
        tokenRepository.deleteByCompanyIdAndServiceType(companyId, serviceType);
        log.info("Google bağlantısı kaldırıldı, company={}, serviceType={}", companyId, serviceType);
    }

    @Transactional
    public void disconnect(UUID companyId) {
        disconnect(companyId, SVC_ANALYTICS);
    }

    // ── Geriye uyumluluk metodları (eski kodun kırılmaması için) ──────────────

    public boolean hasScScope(UUID companyId) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, SVC_SEARCH_CONSOLE);
    }

    public boolean hasAdsScope(UUID companyId) {
        return tokenRepository.existsByCompanyIdAndServiceType(companyId, SVC_GOOGLE_ADS);
    }

    // ─── Yardımcı: token exchange ─────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private Map<String, Object> exchangeCodeForTokens(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        ResponseEntity<Map> response = restTemplate.exchange(
                TOKEN_URL, HttpMethod.POST,
                new HttpEntity<>(params, headers),
                Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Google token exchange HTTP hatası: " + response.getStatusCode());
        }
        return response.getBody();
    }

    // ─── Yardımcı: access token yenile ───────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String refreshAccessToken(GoogleOAuthToken token) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("refresh_token", token.getRefreshToken());
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", "refresh_token");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    TOKEN_URL, HttpMethod.POST,
                    new HttpEntity<>(params, headers),
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String newAccessToken = (String) body.get("access_token");
                Integer expiresIn = (Integer) body.get("expires_in");

                token.setAccessToken(newAccessToken);
                token.setTokenExpiry(Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600));
                tokenRepository.save(token);
                return newAccessToken;
            }
        } catch (Exception e) {
            log.error("Access token yenileme hatası, companyId={}: {}", token.getCompany().getId(), e.getMessage());
        }
        return token.getAccessToken();
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }
}
