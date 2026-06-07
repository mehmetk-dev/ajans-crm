package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.dto.GoogleAdsOverviewResponse.CampaignRow;
import com.fogistanbul.crm.dto.GoogleAdsOverviewResponse.DailySpendRow;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAdsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAdsService.class);
    private static final String ADS_API_URL = "https://googleads.googleapis.com/v24/customers/%s/googleAds:search";

    private final GoogleOAuthService oAuthService;
    private final RestTemplate restTemplate;

    @Value("${app.google-ads.developer-token:}")
    private String developerToken;

    @Value("${app.google-ads.manager-customer-id:}")
    private String managerCustomerId;

    public GoogleAdsOverviewResponse getOverview(UUID companyId, String startDate, String endDate) {
        if (!oAuthService.isConnected(companyId, "GOOGLE_ADS")) {
            return GoogleAdsOverviewResponse.disabled();
        }

        String customerId = oAuthService.getAdsCustomerId(companyId).orElse(null);
        if (customerId == null || customerId.isBlank()) {
            return new GoogleAdsOverviewResponse(true, true, null,
                    "Google Ads müşteri ID'si girilmemiş.", 0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
        }
        // Sanitize: only digits
        customerId = customerId.replaceAll("[^0-9]", "");

        String accessToken = oAuthService.getValidAccessToken(companyId, "GOOGLE_ADS").orElse(null);
        if (accessToken == null) {
            return GoogleAdsOverviewResponse.error(customerId, "Geçerli access token bulunamadı.");
        }
        if (developerToken == null || developerToken.isBlank()) {
            return GoogleAdsOverviewResponse.error(customerId, "Google Ads developer token yapılandırılmamış.");
        }

        String rangeStart = (startDate != null && !startDate.isBlank()) ? startDate : "30daysAgo";
        String rangeEnd   = (endDate   != null && !endDate.isBlank())   ? endDate   : "today";
        // Convert GA-style dates to YYYY-MM-DD
        rangeStart = resolveDate(rangeStart);
        rangeEnd   = resolveDate(rangeEnd);

        try {
            String url = String.format(ADS_API_URL, customerId);

            // ── Campaign performance query ──────────────────────────────────
            String campaignQuery = String.format("""
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
                """, rangeStart, rangeEnd);

            List<Map<String, Object>> campaignRows = executeGaql(url, campaignQuery, accessToken, customerId);

            // ── Daily trend query ───────────────────────────────────────────
            String dailyQuery = String.format("""
                SELECT
                  segments.date,
                  metrics.cost_micros,
                  metrics.clicks,
                  metrics.impressions
                FROM campaign
                WHERE segments.date BETWEEN '%s' AND '%s'
                  AND campaign.status != 'REMOVED'
                ORDER BY segments.date ASC
                """, rangeStart, rangeEnd);

            List<Map<String, Object>> dailyRows = executeGaql(url, dailyQuery, accessToken, customerId);

            // ── Parse campaigns ─────────────────────────────────────────────
            List<CampaignRow> campaigns = new ArrayList<>();
            double totalSpend = 0;
            long totalImpressions = 0, totalClicks = 0, totalConversions = 0;

            for (Map<String, Object> row : campaignRows) {
                Map<String, Object> campaign = cast(row.get("campaign"));
                Map<String, Object> metrics  = cast(row.get("metrics"));
                if (campaign == null || metrics == null) continue;

                long costMicros  = toLong(metrics.get("costMicros"));
                long impressions = toLong(metrics.get("impressions"));
                long clicks      = toLong(metrics.get("clicks"));
                long conversions = toLong(metrics.get("conversions"));
                double ctr       = toDouble(metrics.get("ctr"));
                double avgCpc    = toLong(metrics.get("averageCpc")) / 1_000_000.0;
                double spend     = costMicros / 1_000_000.0;
                String status    = String.valueOf(campaign.getOrDefault("status", "UNKNOWN"));

                campaigns.add(new CampaignRow(
                        String.valueOf(campaign.getOrDefault("id", "")),
                        String.valueOf(campaign.getOrDefault("name", "")),
                        status, spend, impressions, clicks, conversions, ctr, avgCpc
                ));

                totalSpend       += spend;
                totalImpressions += impressions;
                totalClicks      += clicks;
                totalConversions += conversions;
            }

            double overallCtr = totalImpressions > 0 ? (double) totalClicks / totalImpressions * 100 : 0;
            double overallCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
            double convRate   = totalClicks > 0 ? (double) totalConversions / totalClicks * 100 : 0;

            // ── Parse daily trend ────────────────────────────────────────────
            Map<String, double[]> dayMap = new LinkedHashMap<>();
            for (Map<String, Object> row : dailyRows) {
                Map<String, Object> segments = cast(row.get("segments"));
                Map<String, Object> metrics  = cast(row.get("metrics"));
                if (segments == null || metrics == null) continue;
                String date = String.valueOf(segments.getOrDefault("date", ""));
                double[] agg = dayMap.computeIfAbsent(date, k -> new double[3]);
                agg[0] += toLong(metrics.get("costMicros")) / 1_000_000.0;
                agg[1] += toLong(metrics.get("clicks"));
                agg[2] += toLong(metrics.get("impressions"));
            }
            List<DailySpendRow> daily = dayMap.entrySet().stream()
                    .map(e -> new DailySpendRow(e.getKey(), e.getValue()[0], (long) e.getValue()[1], (long) e.getValue()[2]))
                    .toList();

            return new GoogleAdsOverviewResponse(
                    true, true, customerId, null,
                    totalSpend, totalImpressions, totalClicks, totalConversions,
                    overallCtr, overallCpc, convRate, campaigns, daily
            );

        } catch (Exception e) {
            log.error("Google Ads overview hatası, company={}: {}", companyId, e.getMessage(), e);
            return GoogleAdsOverviewResponse.error(customerId, "Veri çekme hatası: " + e.getMessage());
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<Map<String, Object>> executeGaql(String url, String query, String accessToken, String customerId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("developer-token", developerToken);
        headers.setContentType(MediaType.APPLICATION_JSON);
        // login-customer-id sadece manager farklı bir hesapsa ve müşteriye erişim gerekiyorsa gönderilmeli
        String cleanManagerId = managerCustomerId != null ? managerCustomerId.replaceAll("[^0-9]", "") : "";
        if (!cleanManagerId.isBlank() && !cleanManagerId.equals(customerId)) {
            headers.set("login-customer-id", cleanManagerId);
        }

        Map<String, String> body = Map.of("query", query);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        log.debug("Google Ads API isteği: url={}, customerId={}, managerId={}", url, customerId, cleanManagerId);

        ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) return List.of();

        Object results = response.getBody().get("results");
        if (results instanceof List<?> list) {
            return (List<Map<String, Object>>) list;
        }
        return List.of();
    }

    private String resolveDate(String d) {
        if (d == null) return java.time.LocalDate.now().toString();
        if (d.equals("today")) return java.time.LocalDate.now().toString();
        if (d.endsWith("daysAgo")) {
            int days = Integer.parseInt(d.replace("daysAgo", ""));
            return java.time.LocalDate.now().minusDays(days).toString();
        }
        return d;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cast(Object o) {
        return o instanceof Map ? (Map<String, Object>) o : null;
    }

    private long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof Number n) return n.longValue();
        try { return Long.parseLong(o.toString()); } catch (Exception e) { return 0L; }
    }

    private double toDouble(Object o) {
        if (o == null) return 0.0;
        if (o instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(o.toString()); } catch (Exception e) { return 0.0; }
    }
}
