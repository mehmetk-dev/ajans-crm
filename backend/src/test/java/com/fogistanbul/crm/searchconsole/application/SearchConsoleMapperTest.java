package com.fogistanbul.crm.searchconsole.application;

import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient.QueryRow;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SearchConsoleMapperTest {

    SearchConsoleMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new SearchConsoleMapper();
    }

    @Test
    void resolveDate_convertsRelativeAndTodayValues() {
        LocalDate today = LocalDate.of(2026, 6, 12);

        assertThat(mapper.resolveDate("30daysAgo", today)).isEqualTo("2026-05-13");
        assertThat(mapper.resolveDate("today", today)).isEqualTo("2026-06-12");
        assertThat(mapper.resolveDate("2026-01-01", today)).isEqualTo("2026-01-01");
    }

    @Test
    void resolveDate_invalidRelativeValue_usesThirtyDayFallback() {
        LocalDate today = LocalDate.of(2026, 6, 12);

        assertThat(mapper.resolveDate("invaliddaysAgo", today)).isEqualTo("2026-05-14");
        assertThat(mapper.resolveDate("", today)).isEqualTo("2026-05-14");
    }

    @Test
    void toOverviewResponse_mapsMetricsAndSortsDailyRows() {
        QueryRow overview = new QueryRow(List.of(), 120, 2400, 0.05, 7.46);
        QueryRow laterDay = new QueryRow(List.of("2026-06-12"), 20, 200, 0.1, 4.44);
        QueryRow earlierDay = new QueryRow(List.of("2026-06-11"), 10, 100, 0.1, 5.55);
        QueryRow query = new QueryRow(List.of("fog istanbul"), 8, 80, 0.1, 2.26);
        QueryRow page = new QueryRow(List.of("https://example.com"), 7, 70, 0.1, 3.34);
        QueryRow device = new QueryRow(List.of("MOBILE"), 6, 60, 0.1, 4);
        QueryRow country = new QueryRow(List.of("tur"), 5, 50, 0.1, 5);

        ScOverviewResponse result = mapper.toOverviewResponse(
                "https://example.com",
                List.of(overview),
                List.of(laterDay, earlierDay),
                List.of(query),
                List.of(page),
                List.of(device),
                List.of(country));

        assertThat(result.totalClicks()).isEqualTo(120);
        assertThat(result.avgCtr()).isEqualTo(5.0);
        assertThat(result.avgPosition()).isEqualTo(7.5);
        assertThat(result.dailyTrend()).extracting(ScOverviewResponse.ScDailyRow::date)
                .containsExactly("11.06", "12.06");
        assertThat(result.topQueries().get(0).position()).isEqualTo(2.3);
        assertThat(result.devices().get(0).name()).isEqualTo("Mobil");
        assertThat(result.countries().get(0).name()).isEqualTo("tur");
    }

    @Test
    void toUserErrorMessage_mapsKnownHttpErrors() {
        assertThat(mapper.toUserErrorMessage("403 Forbidden")).contains("erişim yetkisi yok");
        assertThat(mapper.toUserErrorMessage("401 Unauthorized")).contains("yeniden bağlayın");
        assertThat(mapper.toUserErrorMessage("404 not found")).contains("bulunamadı");
        assertThat(mapper.toUserErrorMessage("429 quota exceeded")).contains("istek limiti");
        assertThat(mapper.toUserErrorMessage("timeout\ntrace")).contains("yanıt vermedi");
        assertThat(mapper.toUserErrorMessage("internal provider detail"))
                .isEqualTo("Search Console verileri şu anda alınamıyor. Lütfen biraz sonra tekrar deneyin.");
    }
}
