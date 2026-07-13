package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse.CampaignRow;
import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse.DailySpendRow;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.CampaignMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.DailyMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.SummaryMetrics;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class GoogleAdsMapper {

    public GoogleAdsOverviewResponse toOverviewResponse(
            String customerId,
            SummaryMetrics summary,
            List<CampaignMetrics> campaignMetrics,
            List<DailyMetrics> dailyMetrics) {
        List<CampaignRow> campaigns = campaignMetrics.stream()
                .map(this::toCampaignRow)
                .toList();

        double totalSpend = fromMicros(summary.costMicros());
        double conversionRate = summary.clicks() > 0
                ? summary.conversions() / summary.clicks() * 100
                : 0;

        return new GoogleAdsOverviewResponse(
                true,
                true,
                customerId,
                summary.currencyCode(),
                null,
                totalSpend,
                summary.impressions(),
                summary.clicks(),
                summary.conversions(),
                summary.ctr() * 100,
                fromMicros(summary.averageCpcMicros()),
                conversionRate,
                campaigns,
                aggregateDailyRows(dailyMetrics));
    }

    public CampaignRow toCampaignRow(CampaignMetrics metrics) {
        return new CampaignRow(
                metrics.campaignId(),
                metrics.campaignName(),
                metrics.status(),
                fromMicros(metrics.costMicros()),
                metrics.impressions(),
                metrics.clicks(),
                metrics.conversions(),
                metrics.ctr() * 100,
                fromMicros(metrics.averageCpcMicros()));
    }

    public List<DailySpendRow> aggregateDailyRows(List<DailyMetrics> rows) {
        Map<String, DailyAccumulator> totals = new LinkedHashMap<>();
        for (DailyMetrics row : rows) {
            totals.computeIfAbsent(row.date(), ignored -> new DailyAccumulator())
                    .add(row);
        }
        return totals.entrySet().stream()
                .map(entry -> entry.getValue().toRow(entry.getKey()))
                .toList();
    }

    public String sanitizeCustomerId(String customerId) {
        return customerId != null ? customerId.replaceAll("[^0-9]", "") : "";
    }

    public String resolveDate(String value, LocalDate today) {
        if (value == null || value.isBlank()) {
            return today.minusDays(30).toString();
        }
        if ("today".equalsIgnoreCase(value)) {
            return today.toString();
        }
        if (value.endsWith("daysAgo")) {
            try {
                int days = Integer.parseInt(value.replace("daysAgo", ""));
                return today.minusDays(days).toString();
            } catch (NumberFormatException exception) {
                return today.minusDays(30).toString();
            }
        }
        return value;
    }

    public String toUserErrorMessage(String message) {
        if (message.contains("TWO_STEP_VERIFICATION_NOT_ENROLLED")) {
            return "Google Ads için Google hesabında iki adımlı doğrulamayı etkinleştirin.";
        }
        if (message.contains("DEVELOPER_TOKEN_") || message.contains("developer-token")) {
            return "Google Ads developer token geçersiz, onaysız veya OAuth projesiyle uyumsuz.";
        }
        if (message.contains("INVALID_LOGIN_CUSTOMER_ID_SERVING_CUSTOMER_ID_COMBINATION")
                || message.contains("USER_PERMISSION_DENIED")) {
            return "Google Ads yönetici hesabının bu müşteri hesabına erişimi yok.";
        }
        if (message.contains("401") || message.contains("UNAUTHENTICATED")) {
            return "Google Ads oturumu sona ermiş. Lütfen hesabı yeniden bağlayın.";
        }
        if (message.contains("403") || message.contains("PERMISSION_DENIED")) {
            return "Google Ads hesabına erişim yetkisi yok. Müşteri ve yönetici hesaplarını kontrol edin.";
        }
        return "Veri çekme hatası: " + message.split("\n")[0];
    }

    private double fromMicros(long value) {
        return value / 1_000_000.0;
    }

    private static final class DailyAccumulator {
        private long costMicros;
        private long clicks;
        private long impressions;

        void add(DailyMetrics row) {
            costMicros += row.costMicros();
            clicks += row.clicks();
            impressions += row.impressions();
        }

        DailySpendRow toRow(String date) {
            return new DailySpendRow(date, costMicros / 1_000_000.0, clicks, impressions);
        }
    }
}
