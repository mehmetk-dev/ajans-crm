package com.fogistanbul.crm.instagram.oauth.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.infrastructure.InstagramTokenRepository;
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
public class InstagramOAuthService {

    private static final Logger log = LoggerFactory.getLogger(InstagramOAuthService.class);

    private static final String AUTH_URL  = "https://www.facebook.com/v21.0/dialog/oauth";
    private static final String SCOPE = "pages_show_list,pages_read_engagement,ads_read,ads_management";

    @Value("${app.instagram.app-id:}")
    private String appId;

    @Value("${app.instagram.app-secret:}")
    private String appSecret;

    @Value("${app.instagram.redirect-uri:http://localhost:8080/api/oauth/instagram/callback}")
    private String redirectUri;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    private final InstagramTokenRepository tokenRepository;
    private final CompanyRepository companyRepository;
    private final InstagramGraphClient graphClient;

    public boolean isConfigured() {
        return appId != null && !appId.isBlank() && appSecret != null && !appSecret.isBlank();
    }

    public String buildAuthorizationUrl(UUID companyId) {
        return UriComponentsBuilder.fromHttpUrl(AUTH_URL)
                .queryParam("client_id", appId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("scope", SCOPE)
                .queryParam("response_type", "code")
                .queryParam("state", companyId.toString())
                .build()
                .toUriString();
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public void handleCallback(String code, String state) {
        UUID companyId = UUID.fromString(state);

        String shortLivedToken = graphClient.exchangeCodeForToken(code, redirectUri);

        Map<String, Object> longLived = graphClient.exchangeForLongLivedToken(shortLivedToken);
        String accessToken = (String) longLived.get("access_token");
        Integer expiresIn = (Integer) longLived.get("expires_in");

        if (accessToken == null) {
            throw new IllegalStateException("Instagram long-lived token alınamadı");
        }

        Instant expiry = Instant.now().plusSeconds(expiresIn != null ? expiresIn : 5184000);

        Map<String, String> igInfo = graphClient.findInstagramAccount(accessToken);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Şirket bulunamadı: " + companyId));

        InstagramToken token = tokenRepository.findByCompanyId(companyId)
                .orElse(InstagramToken.builder().company(company).build());

        token.setAccessToken(accessToken);
        token.setTokenExpiry(expiry);
        token.setIgUserId(igInfo.get("igUserId"));
        token.setIgUsername(igInfo.get("username"));
        token.setPageId(igInfo.get("pageId"));

        tokenRepository.save(token);
        log.info("Instagram token kaydedildi, company={}, igUser={}", companyId, igInfo.get("username"));
    }

    @Transactional
    public Optional<String> getValidAccessToken(UUID companyId) {
        return tokenRepository.findByCompanyId(companyId).map(token -> {
            if (token.getTokenExpiry() != null &&
                Instant.now().isAfter(token.getTokenExpiry().minusSeconds(86400))) {
                return refreshLongLivedToken(token);
            }
            return token.getAccessToken();
        });
    }

    @Transactional
    public void disconnect(UUID companyId) {
        tokenRepository.deleteByCompanyId(companyId);
        log.info("Instagram bağlantısı kaldırıldı, company={}", companyId);
    }

    public boolean isConnected(UUID companyId) {
        return tokenRepository.existsByCompanyId(companyId);
    }

    public Optional<InstagramToken> getToken(UUID companyId) {
        return tokenRepository.findByCompanyId(companyId);
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    private String refreshLongLivedToken(InstagramToken token) {
        try {
            Map<String, Object> result = graphClient.refreshLongLivedToken(token.getAccessToken());
            String newToken = (String) result.get("access_token");
            Integer newExpiresIn = (Integer) result.get("expires_in");

            if (newToken != null) {
                token.setAccessToken(newToken);
                token.setTokenExpiry(Instant.now().plusSeconds(newExpiresIn != null ? newExpiresIn : 5184000));
                tokenRepository.save(token);
                return newToken;
            }
        } catch (Exception e) {
            log.error("Instagram token yenileme hatası, companyId={}: {}", token.getCompany().getId(), e.getMessage());
        }
        return token.getAccessToken();
    }
}