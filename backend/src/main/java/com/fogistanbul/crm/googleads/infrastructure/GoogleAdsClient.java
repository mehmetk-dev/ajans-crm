package com.fogistanbul.crm.googleads.infrastructure;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

@Component
@RequiredArgsConstructor
public class GoogleAdsClient {

    private static final String API_URL =
            "https://googleads.googleapis.com/v24/customers/%s/googleAds:search";

    private final RestTemplate restTemplate;

    @Value("${app.google-ads.developer-token:}")
    private String developerToken;

    @Value("${app.google-ads.manager-customer-id:}")
    private String managerCustomerId;

    public boolean isConfigured() {
        return developerToken != null && !developerToken.isBlank();
    }

    public boolean isManagerCustomerId(String customerId) {
        String managerId = digitsOnly(managerCustomerId);
        return !managerId.isBlank() && managerId.equals(digitsOnly(customerId));
    }

    public List<CampaignMetrics> fetchCampaigns(
            String accessToken,
            String customerId,
            String startDate,
            String endDate) {
        String query = """
                SELECT
                  campaign.id,
                  campaign.name,
                  campaign.status,
                  metrics.cost_micros,
                  metrics.impressions,
                  metrics.clicks,
                  metrics.conversions,
                  metrics.ctr,
                  metrics.average_cpc
                FROM campaign
                WHERE segments.date BETWEEN '%s' AND '%s'
                  AND campaign.status != 'REMOVED'
                ORDER BY metrics.cost_micros DESC
                LIMIT 20
                """.formatted(startDate, endDate);
        return executeGaql(accessToken, customerId, query).stream()
                .map(this::toCampaignMetrics)
                .filter(row -> row != null)
                .toList();
    }

    public SummaryMetrics fetchSummary(
            String accessToken,
            String customerId,
            String startDate,
            String endDate) {
        String query = """
                SELECT
                  customer.currency_code,
                  metrics.cost_micros,
                  metrics.impressions,
                  metrics.clicks,
                  metrics.conversions,
                  metrics.ctr,
                  metrics.average_cpc
                FROM customer
                WHERE segments.date BETWEEN '%s' AND '%s'
                """.formatted(startDate, endDate);
        return executeGaql(accessToken, customerId, query).stream()
                .map(this::toSummaryMetrics)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(new SummaryMetrics("TRY", 0, 0, 0, 0, 0, 0));
    }

    public List<DailyMetrics> fetchDailyTrend(
            String accessToken,
            String customerId,
            String startDate,
            String endDate) {
        String query = """
                SELECT
                  segments.date,
                  metrics.cost_micros,
                  metrics.clicks,
                  metrics.impressions
                FROM campaign
                WHERE segments.date BETWEEN '%s' AND '%s'
                  AND campaign.status != 'REMOVED'
                ORDER BY segments.date ASC
                """.formatted(startDate, endDate);
        return executeGaql(accessToken, customerId, query).stream()
                .map(this::toDailyMetrics)
                .filter(row -> row != null)
                .toList();
    }

    private List<Map<String, Object>> executeGaql(
            String accessToken,
            String customerId,
            String query) {
        List<Map<String, Object>> allRows = new ArrayList<>();
        Set<String> seenPageTokens = new HashSet<>();
        String pageToken = null;
        do {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("query", query);
            if (pageToken != null) {
                body.put("pageToken", pageToken);
            }

            ResponseEntity<Map> response = restTemplate.exchange(
                    API_URL.formatted(customerId),
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers(accessToken, customerId)),
                    Map.class);
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                break;
            }
            allRows.addAll(mapList(response.getBody().get("results")));
            pageToken = stringValue(response.getBody().get("nextPageToken"));
            if (pageToken.isBlank() || !seenPageTokens.add(pageToken)) {
                pageToken = null;
            }
        } while (pageToken != null);
        return allRows;
    }

    private HttpHeaders headers(String accessToken, String customerId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("developer-token", developerToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String managerId = digitsOnly(managerCustomerId);
        if (!managerId.isBlank() && !managerId.equals(customerId)) {
            headers.set("login-customer-id", managerId);
        }
        return headers;
    }

    private CampaignMetrics toCampaignMetrics(Map<String, Object> row) {
        Map<String, Object> campaign = mapValue(row.get("campaign"));
        Map<String, Object> metrics = mapValue(row.get("metrics"));
        if (campaign == null || metrics == null) {
            return null;
        }
        return new CampaignMetrics(
                stringValue(campaign.get("id")),
                stringValue(campaign.get("name")),
                stringValueOrDefault(campaign.get("status"), "UNKNOWN"),
                longValue(metrics.get("costMicros")),
                longValue(metrics.get("impressions")),
                longValue(metrics.get("clicks")),
                doubleValue(metrics.get("conversions")),
                doubleValue(metrics.get("ctr")),
                longValue(metrics.get("averageCpc")));
    }

    private SummaryMetrics toSummaryMetrics(Map<String, Object> row) {
        Map<String, Object> customer = mapValue(row.get("customer"));
        Map<String, Object> metrics = mapValue(row.get("metrics"));
        if (customer == null || metrics == null) {
            return null;
        }
        return new SummaryMetrics(
                stringValueOrDefault(customer.get("currencyCode"), "TRY"),
                longValue(metrics.get("costMicros")),
                longValue(metrics.get("impressions")),
                longValue(metrics.get("clicks")),
                doubleValue(metrics.get("conversions")),
                doubleValue(metrics.get("ctr")),
                longValue(metrics.get("averageCpc")));
    }

    private DailyMetrics toDailyMetrics(Map<String, Object> row) {
        Map<String, Object> segments = mapValue(row.get("segments"));
        Map<String, Object> metrics = mapValue(row.get("metrics"));
        if (segments == null || metrics == null) {
            return null;
        }
        return new DailyMetrics(
                stringValue(segments.get("date")),
                longValue(metrics.get("costMicros")),
                longValue(metrics.get("clicks")),
                longValue(metrics.get("impressions")));
    }

    private List<Map<String, Object>> mapList(Object value) {
        if (!(value instanceof List<?> values)) {
            return List.of();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object item : values) {
            Map<String, Object> row = mapValue(item);
            if (row != null) {
                rows.add(row);
            }
        }
        return rows;
    }

    private Map<String, Object> mapValue(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return null;
        }
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        map.forEach((key, item) -> result.put(String.valueOf(key), item));
        return result;
    }

    private String digitsOnly(String value) {
        return value != null ? value.replaceAll("[^0-9]", "") : "";
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    private String stringValueOrDefault(Object value, String defaultValue) {
        String result = stringValue(value);
        return result.isBlank() ? defaultValue : result;
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

    public record CampaignMetrics(
            String campaignId,
            String campaignName,
            String status,
            long costMicros,
            long impressions,
            long clicks,
            double conversions,
            double ctr,
            long averageCpcMicros) {
    }

    public record SummaryMetrics(
            String currencyCode,
            long costMicros,
            long impressions,
            long clicks,
            double conversions,
            double ctr,
            long averageCpcMicros) {
    }

    public record DailyMetrics(
            String date,
            long costMicros,
            long clicks,
            long impressions) {
    }
}
