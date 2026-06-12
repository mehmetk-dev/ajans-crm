package com.fogistanbul.crm.metaads.infrastructure;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MetaAdsClient {

    private static final Logger log = LoggerFactory.getLogger(MetaAdsClient.class);
    private static final String GRAPH_URL = "https://graph.facebook.com/v21.0";

    private final RestTemplate restTemplate;

    public String fetchAccountName(String adAccountId, String accessToken) {
        try {
            Map<String, Object> response = get(
                    "/" + adAccountId,
                    accessToken,
                    Map.of("fields", "name"));
            return stringValue(response.get("name"));
        } catch (Exception exception) {
            log.debug(
                    "Meta Ads hesap adi alinamadi, account={}: {}",
                    adAccountId, exception.getMessage());
            return "";
        }
    }

    public Map<String, Object> fetchAccountInsights(
            String adAccountId,
            String accessToken,
            DateRange dateRange) {
        return firstDataRow(get(
                "/" + adAccountId + "/insights",
                accessToken,
                insightQuery(
                        "spend,impressions,clicks,reach,cpm,cpc,ctr",
                        dateRange)));
    }

    public List<Map<String, Object>> fetchCampaignInsights(
            String adAccountId,
            String accessToken,
            DateRange dateRange) {
        try {
            Map<String, Object> query = insightQuery(
                    "campaign_id,campaign_name,spend,impressions,clicks,reach,cpm,cpc,ctr",
                    dateRange);
            query.put("level", "campaign");
            query.put("limit", 20);
            return dataRows(get(
                    "/" + adAccountId + "/insights", accessToken, query));
        } catch (Exception exception) {
            log.warn(
                    "Meta kampanya verileri alinamadi, account={}: {}",
                    adAccountId, exception.getMessage());
            return List.of();
        }
    }

    public List<Map<String, Object>> fetchDailyInsights(
            String adAccountId,
            String accessToken,
            DateRange dateRange) {
        try {
            Map<String, Object> query = insightQuery(
                    "spend,impressions,clicks", dateRange);
            query.put("time_increment", 1);
            query.put("limit", 90);
            return dataRows(get(
                    "/" + adAccountId + "/insights", accessToken, query));
        } catch (Exception exception) {
            log.warn(
                    "Meta gunluk trend verileri alinamadi, account={}: {}",
                    adAccountId, exception.getMessage());
            return List.of();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(
            String path,
            String accessToken,
            Map<String, ?> queryParameters) {
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromHttpUrl(GRAPH_URL)
                .path(path);
        queryParameters.forEach(builder::queryParam);
        builder.queryParam("access_token", accessToken);
        Map<String, Object> response = restTemplate.getForObject(
                builder.build().encode().toUri(), Map.class);
        return response != null ? response : Map.of();
    }

    private Map<String, Object> insightQuery(
            String fields,
            DateRange dateRange) {
        Map<String, Object> query = new LinkedHashMap<>();
        query.put("fields", fields);
        if (dateRange.datePreset() != null) {
            query.put("date_preset", dateRange.datePreset());
        } else {
            query.put(
                    "time_range",
                    "{\"since\":\"" + dateRange.since()
                            + "\",\"until\":\"" + dateRange.until() + "\"}");
        }
        return query;
    }

    private Map<String, Object> firstDataRow(Map<String, Object> response) {
        List<Map<String, Object>> rows = dataRows(response);
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    private List<Map<String, Object>> dataRows(Map<String, Object> response) {
        if (!(response.get("data") instanceof List<?> values)) {
            return List.of();
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Object value : values) {
            if (value instanceof Map<?, ?> map) {
                Map<String, Object> row = new LinkedHashMap<>();
                map.forEach((key, cell) -> row.put(String.valueOf(key), cell));
                rows.add(row);
            }
        }
        return rows;
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    public record DateRange(String datePreset, String since, String until) {
        public static DateRange resolve(String startDate, String endDate) {
            if (startDate != null && !startDate.isBlank()
                    && endDate != null && !endDate.isBlank()) {
                return new DateRange(null, startDate, endDate);
            }
            return new DateRange("last_30d", null, null);
        }
    }
}
