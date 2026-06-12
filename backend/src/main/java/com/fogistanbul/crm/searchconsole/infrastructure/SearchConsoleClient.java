package com.fogistanbul.crm.searchconsole.infrastructure;

import com.fogistanbul.crm.searchconsole.dto.ScSiteResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SearchConsoleClient {

    private static final String API_BASE = "https://www.googleapis.com/webmasters/v3/sites/";
    private static final String SITES_URL = "https://www.googleapis.com/webmasters/v3/sites";

    private final RestTemplate restTemplate;

    public List<ScSiteResponse> listSites(String accessToken) {
        ResponseEntity<Map> response = restTemplate.exchange(
                SITES_URL,
                HttpMethod.GET,
                new HttpEntity<>(headers(accessToken)),
                Map.class);
        return parseSites(response.getBody());
    }

    public List<QueryRow> query(
            String accessToken,
            String siteUrl,
            String startDate,
            String endDate,
            String dimension,
            int rowLimit) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("startDate", startDate);
        body.put("endDate", endDate);
        if (dimension != null && !dimension.isBlank()) {
            body.put("dimensions", List.of(dimension));
        }
        body.put("rowLimit", rowLimit);

        String encodedSiteUrl = URLEncoder.encode(siteUrl, StandardCharsets.UTF_8);
        URI uri = URI.create(API_BASE + encodedSiteUrl + "/searchAnalytics/query");
        ResponseEntity<Map> response = restTemplate.exchange(
                uri,
                HttpMethod.POST,
                new HttpEntity<>(body, headers(accessToken)),
                Map.class);
        return parseRows(response.getBody());
    }

    private HttpHeaders headers(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        return headers;
    }

    private List<ScSiteResponse> parseSites(Map<?, ?> body) {
        if (body == null || !(body.get("siteEntry") instanceof List<?> entries)) {
            return List.of();
        }

        List<ScSiteResponse> sites = new ArrayList<>();
        for (Object value : entries) {
            if (!(value instanceof Map<?, ?> entry)) {
                continue;
            }
            String siteUrl = stringValue(entry.get("siteUrl"));
            if (siteUrl.isBlank()) {
                continue;
            }
            sites.add(new ScSiteResponse(siteUrl, stringValue(entry.get("permissionLevel"))));
        }
        return sites;
    }

    private List<QueryRow> parseRows(Map<?, ?> body) {
        if (body == null || !(body.get("rows") instanceof List<?> rows)) {
            return List.of();
        }

        List<QueryRow> result = new ArrayList<>();
        for (Object value : rows) {
            if (!(value instanceof Map<?, ?> row)) {
                continue;
            }
            result.add(new QueryRow(
                    stringList(row.get("keys")),
                    longValue(row.get("clicks")),
                    longValue(row.get("impressions")),
                    doubleValue(row.get("ctr")),
                    doubleValue(row.get("position"))));
        }
        return result;
    }

    private List<String> stringList(Object value) {
        if (!(value instanceof List<?> values)) {
            return List.of();
        }
        return values.stream().map(this::stringValue).toList();
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    private long longValue(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(stringValue(value));
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private double doubleValue(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(stringValue(value));
        } catch (NumberFormatException exception) {
            return 0.0;
        }
    }

    public record QueryRow(
            List<String> keys,
            long clicks,
            long impressions,
            double ctr,
            double position) {

        public static QueryRow empty() {
            return new QueryRow(List.of(), 0, 0, 0.0, 0.0);
        }

        public String firstKey() {
            return keys != null && !keys.isEmpty() ? keys.get(0) : "";
        }
    }
}
