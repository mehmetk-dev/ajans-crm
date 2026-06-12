package com.fogistanbul.crm.metaads.dto;

import java.util.List;

public record MetaAdsOverviewResponse(
        boolean connected,
        String adAccountId,
        String adAccountName,
        String errorMessage,
        double totalSpend,
        long impressions,
        long clicks,
        long reach,
        double cpm,
        double cpc,
        double ctr,
        List<CampaignRow> campaigns,
        List<DailyRow> dailyTrend
) {
    public static MetaAdsOverviewResponse disabled() {
        return new MetaAdsOverviewResponse(
                false, null, null, null,
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static MetaAdsOverviewResponse missingAccount() {
        return new MetaAdsOverviewResponse(
                true, null, null, "Meta Ads hesap ID'si girilmemiş.",
                0, 0, 0, 0, 0, 0, 0, List.of(), List.of());
    }

    public static MetaAdsOverviewResponse error(String adAccountId, String message) {
        return new MetaAdsOverviewResponse(
                true, adAccountId, null, message,
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
            double ctr) {}

    public record DailyRow(
            String date,
            double spend,
            long impressions,
            long clicks) {}
}
