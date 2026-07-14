package com.fogistanbul.crm.metaads.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class MetaAdsMapperTest {

    MetaAdsMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new MetaAdsMapper();
    }

    @Test
    void toCampaignRow_parsesGraphStringMetrics() {
        var row = mapper.toCampaignRow(Map.of(
                "campaign_id", "42",
                "campaign_name", "Brand",
                "spend", "125.50",
                "impressions", "1000",
                "clicks", "75",
                "reach", "800",
                "cpm", "12.5",
                "cpc", "1.67",
                "ctr", "7.5"));

        assertThat(row.campaignId()).isEqualTo("42");
        assertThat(row.spend()).isEqualTo(125.5);
        assertThat(row.impressions()).isEqualTo(1000);
        assertThat(row.ctr()).isEqualTo(7.5);
    }

    @Test
    void toDailyRow_handlesMalformedMetricsAsZero() {
        var row = mapper.toDailyRow(Map.of(
                "date_start", "2026-06-12",
                "spend", "invalid",
                "impressions", "100",
                "clicks", "invalid"));

        assertThat(row.date()).isEqualTo("2026-06-12");
        assertThat(row.spend()).isZero();
        assertThat(row.impressions()).isEqualTo(100);
        assertThat(row.clicks()).isZero();
    }

    @Test
    void toOverviewResponse_mapsAccountCampaignAndDailyMetrics() {
        var result = mapper.toOverviewResponse(
                "act_123",
                "Fog Ads",
                Map.of(
                        "spend", "500.25",
                        "impressions", "20000",
                        "clicks", "900",
                        "reach", "15000",
                        "cpm", "25",
                        "cpc", "0.56",
                        "ctr", "4.5"),
                List.of(Map.of(
                        "campaign_id", "1",
                        "campaign_name", "Brand",
                        "spend", "300")),
                List.of(Map.of(
                        "date_start", "2026-06-12",
                        "spend", "20")));

        assertThat(result.adAccountName()).isEqualTo("Fog Ads");
        assertThat(result.totalSpend()).isEqualTo(500.25);
        assertThat(result.campaigns()).hasSize(1);
        assertThat(result.dailyTrend()).hasSize(1);
    }

    @Test
    void toUserErrorMessage_mapsKnownGraphErrors() {
        assertThat(mapper.toUserErrorMessage("OAuthException code 190"))
                .contains("yeniden bağlayın");
        assertThat(mapper.toUserErrorMessage("Unsupported get request code 100"))
                .contains("erişim yetkisi");
        assertThat(mapper.toUserErrorMessage("timeout\ntrace"))
                .isEqualTo("Meta Ads şu anda yanıt vermedi. Lütfen biraz sonra tekrar deneyin.");
        assertThat(mapper.toUserErrorMessage("Graph internal details"))
                .isEqualTo("Meta Ads verileri şu anda alınamıyor. Lütfen biraz sonra tekrar deneyin.");
    }
}
