package com.fogistanbul.crm.instagram.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class InstagramGraphClient {

    private static final String GRAPH_URL = "https://graph.facebook.com/v21.0";

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
}
