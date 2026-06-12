package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaDailyRow;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaNamedMetric;
import com.google.analytics.data.v1beta.DimensionValue;
import com.google.analytics.data.v1beta.MetricValue;
import com.google.analytics.data.v1beta.Row;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleAnalyticsMapperTest {

    GoogleAnalyticsMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new GoogleAnalyticsMapper();
    }

    // ─── formatDate ───────────────────────────────────────────────────────────

    @Test
    void formatDate_validYYYYMMDD_formatsAsDDMM() {
        assertThat(mapper.formatDate("20240115")).isEqualTo("15.01");
    }

    @Test
    void formatDate_anotherValidDate_formatsCorrectly() {
        assertThat(mapper.formatDate("20231231")).isEqualTo("31.12");
    }

    @Test
    void formatDate_invalidLength_returnsInput() {
        assertThat(mapper.formatDate("2024-01-15")).isEqualTo("2024-01-15");
    }

    @Test
    void formatDate_null_returnsNull() {
        assertThat(mapper.formatDate(null)).isNull();
    }

    // ─── toDailyRow ──────────────────────────────────────────────────────────

    @Test
    void toDailyRow_validRow_returnsFormattedRow() {
        Row row = Row.newBuilder()
                .addDimensionValues(DimensionValue.newBuilder().setValue("20240310"))
                .addMetricValues(MetricValue.newBuilder().setValue("150"))
                .addMetricValues(MetricValue.newBuilder().setValue("120"))
                .build();

        GaDailyRow result = mapper.toDailyRow(row);

        assertThat(result.date()).isEqualTo("10.03");
        assertThat(result.sessions()).isEqualTo(150L);
        assertThat(result.users()).isEqualTo(120L);
    }

    @Test
    void toDailyRow_nonNumericMetric_returnsZero() {
        Row row = Row.newBuilder()
                .addDimensionValues(DimensionValue.newBuilder().setValue("20240101"))
                .addMetricValues(MetricValue.newBuilder().setValue("NaN"))
                .addMetricValues(MetricValue.newBuilder().setValue("0"))
                .build();

        GaDailyRow result = mapper.toDailyRow(row);

        assertThat(result.sessions()).isZero();
        assertThat(result.users()).isZero();
    }

    // ─── toNamedMetric ────────────────────────────────────────────────────────

    @Test
    void toNamedMetric_validRow_returnsNameAndValue() {
        Row row = Row.newBuilder()
                .addDimensionValues(DimensionValue.newBuilder().setValue("Organic Search"))
                .addMetricValues(MetricValue.newBuilder().setValue("3200"))
                .build();

        GaNamedMetric result = mapper.toNamedMetric(row);

        assertThat(result.name()).isEqualTo("Organic Search");
        assertThat(result.value()).isEqualTo(3200L);
    }

    @Test
    void toNamedMetric_zeroValue_returnsZero() {
        Row row = Row.newBuilder()
                .addDimensionValues(DimensionValue.newBuilder().setValue("Direct"))
                .addMetricValues(MetricValue.newBuilder().setValue("0"))
                .build();

        GaNamedMetric result = mapper.toNamedMetric(row);

        assertThat(result.value()).isZero();
    }
}
