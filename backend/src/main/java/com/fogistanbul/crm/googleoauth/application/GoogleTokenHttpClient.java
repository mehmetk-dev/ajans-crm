package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleoauth.domain.GoogleOAuthToken;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GoogleTokenHttpClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenHttpClient.class);
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    @Value("${app.google-oauth.client-id}")
    private String clientId;

    @Value("${app.google-oauth.client-secret}")
    private String clientSecret;

    @Value("${app.google-oauth.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate;

    @SuppressWarnings("unchecked")
    public Map<String, Object> exchangeCodeForTokens(String code) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        ResponseEntity<Map> response = restTemplate.exchange(
                TOKEN_URL, HttpMethod.POST,
                new HttpEntity<>(params, formHeaders()),
                Map.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Google token exchange HTTP hatası: " + response.getStatusCode());
        }
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public String refreshAccessToken(GoogleOAuthToken token) {
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("refresh_token", token.getRefreshToken());
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("grant_type", "refresh_token");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    TOKEN_URL, HttpMethod.POST,
                    new HttpEntity<>(params, formHeaders()),
                    Map.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                String newAccessToken = (String) body.get("access_token");
                Integer expiresIn = (Integer) body.get("expires_in");

                token.setAccessToken(newAccessToken);
                token.setTokenExpiry(Instant.now().plusSeconds(expiresIn != null ? expiresIn : 3600));
                return newAccessToken;
            }
        } catch (Exception e) {
            log.error("Access token yenileme hatası, companyId={}: {}", token.getCompany().getId(), e.getMessage());
        }
        return token.getAccessToken();
    }

    private HttpHeaders formHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return headers;
    }
}
