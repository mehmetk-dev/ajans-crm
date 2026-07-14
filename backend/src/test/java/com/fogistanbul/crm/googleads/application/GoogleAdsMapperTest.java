package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.CampaignMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.DailyMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.SummaryMetrics;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleAdsMapperTest {

    GoogleAdsMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new GoogleAdsMapper();
    }

    @Test
    void sanitizeCustomerId_keepsOnlyDigits() {
        assertThat(mapper.sanitizeCustomerId("123-456-7890")).isEqualTo("1234567890");
        assertThat(mapper.sanitizeCustomerId(null)).isEmpty();
    }

    @Test
    void resolveDate_convertsRelativeDatesAndHandlesInvalidInput() {
        LocalDate today = LocalDate.of(2026, 6, 12);

        assertThat(mapper.resolveDate("29daysAgo", today)).isEqualTo("2026-05-14");
        assertThat(mapper.resolveDate("today", today)).isEqualTo("2026-06-12");
        assertThat(mapper.resolveDate("2026-01-01", today)).isEqualTo("2026-01-01");
        assertThat(mapper.resolveDate("invaliddaysAgo", today)).isEqualTo("2026-05-14");
    }

    @Test
    void toCampaignRow_convertsMicrosAndCtrRatio() {
        CampaignMetrics metrics = new CampaignMetrics(
                "1", "Brand", "ENABLED",
                12_500_000, 1000, 50, 5.5, 0.05, 250_000);

        GoogleAdsOverviewResponse.CampaignRow result = mapper.toCampaignRow(metrics);

        assertThat(result.spend()).isEqualTo(12.5);
        assertThat(result.cpc()).isEqualTo(0.25);
        assertThat(result.ctr()).isEqualTo(5.0);
        assertThat(result.conversions()).isEqualTo(5.5);
    }

    @Test
    void aggregateDailyRows_groupsCampaignRowsByDate() {
        List<GoogleAdsOverviewResponse.DailySpendRow> result = mapper.aggregateDailyRows(List.of(
                new DailyMetrics("2026-06-11", 1_500_000, 10, 100),
                new DailyMetrics("2026-06-11", 2_500_000, 20, 200),
                new DailyMetrics("2026-06-12", 3_000_000, 30, 300)));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).spend()).isEqualTo(4.0);
        assertThat(result.get(0).clicks()).isEqualTo(30);
        assertThat(result.get(0).impressions()).isEqualTo(300);
    }

    @Test
    void toOverviewResponse_calculatesAggregateMetrics() {
        CampaignMetrics first = new CampaignMetrics(
                "1", "Brand", "ENABLED",
                10_000_000, 1000, 50, 5, 0.05, 200_000);
        CampaignMetrics second = new CampaignMetrics(
                "2", "Search", "PAUSED",
                20_000_000, 2000, 100, 10, 0.05, 200_000);

        GoogleAdsOverviewResponse result = mapper.toOverviewResponse(
                "1234567890",
                new SummaryMetrics("EUR", 45_000_000, 4500, 225, 22.5, 0.05, 200_000),
                List.of(first, second),
                List.of(new DailyMetrics("2026-06-12", 30_000_000, 150, 3000)));

        assertThat(result.currencyCode()).isEqualTo("EUR");
        assertThat(result.totalSpend()).isEqualTo(45.0);
        assertThat(result.impressions()).isEqualTo(4500);
        assertThat(result.clicks()).isEqualTo(225);
        assertThat(result.conversions()).isEqualTo(22.5);
        assertThat(result.ctr()).isEqualTo(5.0);
        assertThat(result.cpc()).isEqualTo(0.2);
        assertThat(result.conversionRate()).isEqualTo(10.0);
    }

    @Test
    void toUserErrorMessage_mapsKnownErrors() {
        assertThat(mapper.toUserErrorMessage("401 UNAUTHENTICATED")).contains("yeniden bağlayın");
        assertThat(mapper.toUserErrorMessage("403 PERMISSION_DENIED")).contains("erişim yetkisi yok");
        assertThat(mapper.toUserErrorMessage("invalid developer-token")).contains("developer token");
        assertThat(mapper.toUserErrorMessage("timeout\ninternal-host=secret"))
                .isEqualTo("Google Ads şu anda yanıt vermedi. Lütfen biraz sonra tekrar deneyin.");
        assertThat(mapper.toUserErrorMessage("429 RESOURCE_EXHAUSTED quota"))
                .isEqualTo("Google Ads istek limiti aşıldı. Lütfen biraz sonra tekrar deneyin.");
        assertThat(mapper.toUserErrorMessage("jdbc:postgresql://internal/private"))
                .isEqualTo("Google Ads verileri şu anda alınamıyor. Lütfen biraz sonra tekrar deneyin.");
    }
}
