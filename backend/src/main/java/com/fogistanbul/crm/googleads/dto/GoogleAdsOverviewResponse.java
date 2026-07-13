package com.fogistanbul.crm.googleads.dto;

import java.util.List;

public record GoogleAdsOverviewResponse(
        boolean connected,
        boolean hasAdsScope,
        String customerId,
        String currencyCode,
        String errorMessage,

        // Temel metrikler (son 30 gün)
        double totalSpend,
        long impressions,
        long clicks,
        double conversions,
        double ctr,
        double cpc,
        double conversionRate,

        // Kampanya bazlı
        List<CampaignRow> campaigns,

        // Günlük harcama trendi
        List<DailySpendRow> dailyTrend
) {
    public static GoogleAdsOverviewResponse disabled() {
        return new GoogleAdsOverviewResponse(false, false, null, "TRY", null,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static GoogleAdsOverviewResponse noScope(String customerId) {
        return new GoogleAdsOverviewResponse(true, false, customerId, "TRY",
                "Google Ads yetkisi eksik. Lütfen Google hesabını yeniden bağlayın.",
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static GoogleAdsOverviewResponse error(String customerId, String msg) {
        return new GoogleAdsOverviewResponse(true, true, customerId, "TRY", msg,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static GoogleAdsOverviewResponse disconnected(String customerId, String msg) {
        return new GoogleAdsOverviewResponse(false, false, customerId, "TRY", msg,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public record CampaignRow(
            String campaignId,
            String campaignName,
            String status,
            double spend,
            long impressions,
            long clicks,
            double conversions,
            double ctr,
            double cpc
    ) {}

    public record DailySpendRow(String date, double spend, long clicks, long impressions) {}
}
