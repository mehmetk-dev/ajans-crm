package com.fogistanbul.crm.dto;

import java.util.List;

public record MetaAdsOverviewResponse(
        boolean connected,
        String adAccountId,
        String adAccountName,
        String errorMessage,

        // Temel metrikler
        double totalSpend,
        long impressions,
        long clicks,
        long reach,
        double cpm,
        double cpc,
        double ctr,

        // Kampanya bazlı
        List<CampaignRow> campaigns,

        // Günlük trend
        List<DailyRow> dailyTrend
) {
    public static MetaAdsOverviewResponse disabled() {
        return new MetaAdsOverviewResponse(false, null, null, null,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static MetaAdsOverviewResponse error(String adAccountId, String msg) {
        return new MetaAdsOverviewResponse(true, adAccountId, null, msg,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public record CampaignRow(
            String campaignId,
            String campaignName,
            String status,
            String objective,
            double spend,
            long impressions,
            long clicks,
            long reach,
            double cpm,
            double cpc,
            double ctr
    ) {}

    public record DailyRow(String date, double spend, long impressions, long clicks) {}
}
