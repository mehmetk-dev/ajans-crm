package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse.CampaignRow;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse.DailyRow;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class MetaAdsMapper {

    public MetaAdsOverviewResponse toOverviewResponse(
            String adAccountId,
            String accountName,
            Map<String, Object> accountInsights,
            List<Map<String, Object>> campaignInsights,
            List<Map<String, Object>> dailyInsights) {
        return new MetaAdsOverviewResponse(
                true,
                adAccountId,
                accountName,
                null,
                doubleValue(accountInsights, "spend"),
                longValue(accountInsights, "impressions"),
                longValue(accountInsights, "clicks"),
                longValue(accountInsights, "reach"),
                doubleValue(accountInsights, "cpm"),
                doubleValue(accountInsights, "cpc"),
                doubleValue(accountInsights, "ctr"),
                campaignInsights.stream().map(this::toCampaignRow).toList(),
                dailyInsights.stream().map(this::toDailyRow).toList());
    }

    public CampaignRow toCampaignRow(Map<String, Object> row) {
        return new CampaignRow(
                stringValue(row, "campaign_id"),
                stringValue(row, "campaign_name"),
                "ACTIVE",
                "",
                doubleValue(row, "spend"),
                longValue(row, "impressions"),
                longValue(row, "clicks"),
                longValue(row, "reach"),
                doubleValue(row, "cpm"),
                doubleValue(row, "cpc"),
                doubleValue(row, "ctr"));
    }

    public DailyRow toDailyRow(Map<String, Object> row) {
        return new DailyRow(
                stringValue(row, "date_start"),
                doubleValue(row, "spend"),
                longValue(row, "impressions"),
                longValue(row, "clicks"));
    }

    public String toUserErrorMessage(String message) {
        String value = message != null ? message : "";
        if (value.contains("OAuthException")
                || value.contains("Invalid OAuth")
                || value.contains("190")) {
            return "Meta bağlantısı geçersiz. Hesabı yeniden bağlayın.";
        }
        if (value.contains("permissions")
                || value.contains("Unsupported get request")
                || value.contains("100")) {
            return "Meta reklam hesabına erişim yetkisi yok.";
        }
        String firstLine = value.lines().findFirst().orElse("");
        return "Veri çekme hatası: " + firstLine;
    }

    private String stringValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        return value != null ? value.toString() : "";
    }

    private double doubleValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) {
            return 0;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }

    private long longValue(Map<String, Object> row, String key) {
        Object value = row.get(key);
        if (value == null) {
            return 0;
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException ignored) {
            return 0;
        }
    }
}
