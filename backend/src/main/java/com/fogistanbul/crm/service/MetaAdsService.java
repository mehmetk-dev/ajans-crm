package com.fogistanbul.crm.service;

import com.fogistanbul.crm.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.dto.MetaAdsOverviewResponse.CampaignRow;
import com.fogistanbul.crm.dto.MetaAdsOverviewResponse.DailyRow;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.infrastructure.InstagramTokenRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MetaAdsService {

    private static final Logger log = LoggerFactory.getLogger(MetaAdsService.class);
    private static final String GRAPH_URL = "https://graph.facebook.com/v21.0";

    private final InstagramOAuthService igOAuthService;
    private final InstagramTokenRepository tokenRepository;
    private final RestTemplate restTemplate;

    public MetaAdsOverviewResponse getOverview(UUID companyId, String startDate, String endDate) {
        if (!igOAuthService.isConnected(companyId)) {
            return MetaAdsOverviewResponse.disabled();
        }

        String adAccountId = igOAuthService.getMetaAdAccountId(companyId).orElse(null);
        if (adAccountId == null || adAccountId.isBlank()) {
            return new MetaAdsOverviewResponse(true, null, null,
                    "Meta Ads hesap ID'si girilmemiş.", 0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
        }

        String accessToken = igOAuthService.getValidAccessToken(companyId).orElse(null);
        if (accessToken == null) {
            return MetaAdsOverviewResponse.error(adAccountId, "Geçerli access token bulunamadı.");
        }

        // Date range
        String datePreset = "last_30d";
        String since = null, until = null;
        if (startDate != null && !startDate.isBlank() && endDate != null && !endDate.isBlank()) {
            since = startDate;
            until = endDate;
            datePreset = null;
        }

        try {
            // ── Account info ────────────────────────────────────────────────
            String accountName = fetchAccountName(adAccountId, accessToken);

            // ── Account-level insights ────────────────────────────────────
            Map<String, Object> accountInsights = fetchInsights(adAccountId, accessToken,
                    "spend,impressions,clicks,reach,cpm,cpc,ctr", datePreset, since, until, null);

            double totalSpend     = parseDouble(accountInsights, "spend");
            long impressions      = parseLong(accountInsights, "impressions");
            long clicks           = parseLong(accountInsights, "clicks");
            long reach            = parseLong(accountInsights, "reach");
            double cpm            = parseDouble(accountInsights, "cpm");
            double cpc            = parseDouble(accountInsights, "cpc");
            double ctr            = parseDouble(accountInsights, "ctr");

            // ── Campaign insights ─────────────────────────────────────────
            List<CampaignRow> campaigns = fetchCampaignInsights(adAccountId, accessToken, datePreset, since, until);

            // ── Daily trend ───────────────────────────────────────────────
            List<DailyRow> daily = fetchDailyInsights(adAccountId, accessToken, datePreset, since, until);

            return new MetaAdsOverviewResponse(
                    true, adAccountId, accountName, null,
                    totalSpend, impressions, clicks, reach, cpm, cpc, ctr,
                    campaigns, daily
            );

        } catch (Exception e) {
            log.error("Meta Ads overview hatası, company={}: {}", companyId, e.getMessage(), e);
            return MetaAdsOverviewResponse.error(adAccountId, "Veri çekme hatası: " + e.getMessage());
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String fetchAccountName(String adAccountId, String token) {
        try {
            String url = GRAPH_URL + "/" + adAccountId + "?fields=name&access_token=" + token;
            Map<String, Object> resp = restTemplate.getForObject(url, Map.class);
            return resp != null ? String.valueOf(resp.getOrDefault("name", "")) : "";
        } catch (Exception e) { return ""; }
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private Map<String, Object> fetchInsights(String adAccountId, String token,
                                               String fields, String datePreset,
                                               String since, String until, String level) {
        UriComponentsBuilder b = UriComponentsBuilder
                .fromHttpUrl(GRAPH_URL + "/" + adAccountId + "/insights")
                .queryParam("fields", fields)
                .queryParam("access_token", token);
        if (datePreset != null) b.queryParam("date_preset", datePreset);
        if (since != null)      b.queryParam("time_range", "{\"since\":\"" + since + "\",\"until\":\"" + until + "\"}");
        if (level != null)      b.queryParam("level", level);

        Map resp = restTemplate.getForObject(b.build().toUriString(), Map.class);
        if (resp == null) return Map.of();
        List<Map<String, Object>> data = (List<Map<String, Object>>) resp.getOrDefault("data", List.of());
        return data.isEmpty() ? Map.of() : data.get(0);
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<CampaignRow> fetchCampaignInsights(String adAccountId, String token,
                                                     String datePreset, String since, String until) {
        UriComponentsBuilder b = UriComponentsBuilder
                .fromHttpUrl(GRAPH_URL + "/" + adAccountId + "/insights")
                .queryParam("fields", "campaign_id,campaign_name,spend,impressions,clicks,reach,cpm,cpc,ctr")
                .queryParam("level", "campaign")
                .queryParam("limit", "20")
                .queryParam("access_token", token);
        if (datePreset != null) b.queryParam("date_preset", datePreset);
        if (since != null) b.queryParam("time_range", "{\"since\":\"" + since + "\",\"until\":\"" + until + "\"}");

        List<CampaignRow> result = new ArrayList<>();
        try {
            Map resp = restTemplate.getForObject(b.build().toUriString(), Map.class);
            if (resp == null) return result;
            List<Map<String, Object>> data = (List<Map<String, Object>>) resp.getOrDefault("data", List.of());
            for (Map<String, Object> row : data) {
                result.add(new CampaignRow(
                        String.valueOf(row.getOrDefault("campaign_id", "")),
                        String.valueOf(row.getOrDefault("campaign_name", "")),
                        "ACTIVE",
                        "",
                        parseDouble(row, "spend"),
                        parseLong(row, "impressions"),
                        parseLong(row, "clicks"),
                        parseLong(row, "reach"),
                        parseDouble(row, "cpm"),
                        parseDouble(row, "cpc"),
                        parseDouble(row, "ctr")
                ));
            }
        } catch (Exception e) {
            log.warn("Meta kampanya verileri alınamadı: {}", e.getMessage());
        }
        return result;
    }

    @SuppressWarnings({"unchecked", "rawtypes"})
    private List<DailyRow> fetchDailyInsights(String adAccountId, String token,
                                               String datePreset, String since, String until) {
        UriComponentsBuilder b = UriComponentsBuilder
                .fromHttpUrl(GRAPH_URL + "/" + adAccountId + "/insights")
                .queryParam("fields", "spend,impressions,clicks")
                .queryParam("time_increment", "1")
                .queryParam("limit", "90")
                .queryParam("access_token", token);
        if (datePreset != null) b.queryParam("date_preset", datePreset);
        if (since != null) b.queryParam("time_range", "{\"since\":\"" + since + "\",\"until\":\"" + until + "\"}");

        List<DailyRow> result = new ArrayList<>();
        try {
            Map resp = restTemplate.getForObject(b.build().toUriString(), Map.class);
            if (resp == null) return result;
            List<Map<String, Object>> data = (List<Map<String, Object>>) resp.getOrDefault("data", List.of());
            for (Map<String, Object> row : data) {
                result.add(new DailyRow(
                        String.valueOf(row.getOrDefault("date_start", "")),
                        parseDouble(row, "spend"),
                        parseLong(row, "impressions"),
                        parseLong(row, "clicks")
                ));
            }
        } catch (Exception e) {
            log.warn("Meta günlük trend verileri alınamadı: {}", e.getMessage());
        }
        return result;
    }

    private double parseDouble(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) return 0.0;
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }

    private long parseLong(Map<String, Object> map, String key) {
        Object v = map.get(key);
        if (v == null) return 0L;
        try { return Long.parseLong(v.toString()); } catch (Exception e) { return 0L; }
    }
}
