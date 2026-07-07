package com.fogistanbul.crm.instagram.application;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;

class InstagramDateRangeResolverTest {

    private static final ZoneId ISTANBUL = ZoneId.of("Europe/Istanbul");
    private static final Instant NOW = Instant.parse("2026-06-12T12:00:00Z");

    InstagramDateRangeResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new InstagramDateRangeResolver();
    }

    @Test
    void resolve_supportsRelativeDateRanges() {
        var range = resolver.resolve("7daysAgo", "today", NOW);

        assertThat(range.since()).isEqualTo(
                NOW.minusSeconds(7L * 86400).getEpochSecond());
        assertThat(range.until()).isEqualTo(NOW.getEpochSecond());
    }

    @Test
    void resolve_usesInclusiveEndForExplicitDates() {
        var range = resolver.resolve("2026-06-01", "2026-06-11", NOW);

        assertThat(range.since()).isEqualTo(
                LocalDate.of(2026, 6, 1).atStartOfDay(ISTANBUL).toEpochSecond());
        assertThat(range.until()).isEqualTo(
                LocalDate.of(2026, 6, 12).atStartOfDay(ISTANBUL).toEpochSecond());
    }

    @Test
    void resolve_fallsBackToThirtyDaysForInvalidOrder() {
        var range = resolver.resolve("2026-06-13", "2026-06-01", NOW);

        assertThat(range.since()).isEqualTo(
                NOW.minusSeconds(30L * 86400).getEpochSecond());
        assertThat(range.until()).isEqualTo(NOW.getEpochSecond());
    }

    @Test
    void resolve_limitsExplicitRangesToMetaThirtyDayMaximum() {
        var range = resolver.resolve("2026-05-01", "2026-06-11", NOW);

        assertThat(range.until() - range.since()).isEqualTo(30L * 86400);
        assertThat(range.until()).isEqualTo(
                LocalDate.of(2026, 6, 12).atStartOfDay(ISTANBUL).toEpochSecond());
    }

    @Test
    void currentMonth_andTimestampFilterUseIstanbulMonthBoundary() {
        var month = resolver.currentMonth(NOW);

        assertThat(month.since()).isEqualTo(
                LocalDate.of(2026, 6, 1).atStartOfDay(ISTANBUL).toEpochSecond());
        assertThat(resolver.isCurrentMonth("2026-06-01T00:00:00Z", NOW)).isTrue();
        assertThat(resolver.isCurrentMonth("2026-05-31T20:59:59Z", NOW)).isFalse();
        assertThat(resolver.isCurrentMonth("", NOW)).isTrue();
    }
}
