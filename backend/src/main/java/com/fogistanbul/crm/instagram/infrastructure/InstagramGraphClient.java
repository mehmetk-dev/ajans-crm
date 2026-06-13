package com.fogistanbul.crm.instagram.infrastructure;

import com.fogistanbul.crm.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class InstagramGraphClient {

    private static final String TOKEN_URL = "https://graph.facebook.com/v21.0/oauth/access_token";
    private static final String GRAPH_URL = "https://graph.facebook.com/v21.0";

    @Value("${app.instagram.app-id:}")
    private String appId;

    @Value("${app.instagram.app-secret:}")
    private String appSecret;

    private final RestTemplate restTemplate;

    @SuppressWarnings("unchecked")
    public Map<String, Object> get(
            String resourcePath,
            String accessToken,
            Map<String, ?> queryParameters) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(GRAPH_URL)
                .path(resourcePath);
        queryParameters.forEach(builder::queryParam);
        builder.queryParam("access_token", accessToken);

        URI uri = builder.build().encode().toUri();
        ResponseEntity<Map> response = restTemplate.exchange(
                uri, HttpMethod.GET, null, Map.class);
        return response.getBody() != null ? response.getBody() : Map.of();
    }

    public String exchangeCodeForToken(String code, String redirectUri) {
        String url = UriComponentsBuilder.fromHttpUrl(TOKEN_URL)
                .queryParam("client_id", appId)
                .queryParam("client_secret", appSecret)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("code", code)
                .build().toUriString();

        @SuppressWarnings("unchecked")
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Facebook token exchange hatası: " + response.getStatusCode());
        }

        String token = (String) response.getBody().get("access_token");
        if (token == null) throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "access_token boş döndü");
        return token;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> exchangeForLongLivedToken(String shortLivedToken) {
        String url = UriComponentsBuilder.fromHttpUrl(GRAPH_URL + "/oauth/access_token")
                .queryParam("grant_type", "fb_exchange_token")
                .queryParam("client_id", appId)
                .queryParam("client_secret", appSecret)
                .queryParam("fb_exchange_token", shortLivedToken)
                .build().toUriString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Long-lived token exchange hatası");
        }
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, String> findInstagramAccount(String accessToken) {
        String pagesUrl = GRAPH_URL + "/me/accounts?fields=id,name,instagram_business_account&access_token=" + accessToken;
        ResponseEntity<Map> pagesResponse = restTemplate.getForEntity(pagesUrl, Map.class);

        if (pagesResponse.getBody() == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Facebook sayfaları alınamadı");
        }

        List<Map<String, Object>> pages = (List<Map<String, Object>>) pagesResponse.getBody().get("data");
        if (pages == null || pages.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Hiçbir Facebook sayfası bulunamadı");
        }

        for (Map<String, Object> page : pages) {
            Map<String, Object> igAccount = (Map<String, Object>) page.get("instagram_business_account");
            if (igAccount != null) {
                String igUserId = (String) igAccount.get("id");
                String pageId = (String) page.get("id");

                String igUrl = GRAPH_URL + "/" + igUserId + "?fields=username&access_token=" + accessToken;
                ResponseEntity<Map> igResponse = restTemplate.getForEntity(igUrl, Map.class);
                String username = "";

                if (igResponse.getBody() != null) {
                    username = (String) igResponse.getBody().getOrDefault("username", "");
                }

                return Map.of("igUserId", igUserId, "pageId", pageId, "username", username);
            }
        }

        throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Instagram Business hesabı bulunamadı");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> refreshLongLivedToken(String accessToken) {
        String url = GRAPH_URL + "/oauth/access_token?grant_type=fb_exchange_token"
                + "&client_id=" + appId
                + "&client_secret=" + appSecret
                + "&fb_exchange_token=" + accessToken;

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY, "EXTERNAL_SERVICE_ERROR", "Instagram token yenileme hatası");
    }
}
