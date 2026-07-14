package com.fogistanbul.crm.instagram.application;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Component
public class InstagramDateRangeResolver {

    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");
    private static final long MAX_INSIGHT_RANGE_SECONDS = 30L * 86400;

    public InsightRange resolve(String rangeStart, String rangeEnd) {
        return resolve(rangeStart, rangeEnd, Instant.now());
    }

    public InsightRange currentMonth() {
        return currentMonth(Instant.now());
    }

    public boolean isCurrentMonth(String timestamp) {
        return isCurrentMonth(timestamp, Instant.now());
    }

    public LocalDate startDate(InsightRange range) {
        return Instant.ofEpochSecond(range.since()).atZone(ZONE).toLocalDate();
    }

    public LocalDate endDate(InsightRange range) {
        return Instant.ofEpochSecond(Math.max(range.since(), range.until() - 1))
                .atZone(ZONE)
                .toLocalDate();
    }

    InsightRange resolve(String rangeStart, String rangeEnd, Instant now) {
        long until = parseEndInstant(rangeEnd).orElse(now).getEpochSecond();
        long since = parseStartInstant(rangeStart)
                .orElseGet(() -> now.minusSeconds((long) parseDays(rangeStart) * 86400))
                .getEpochSecond();
        if (since >= until) {
            return new InsightRange(
                    now.minusSeconds(MAX_INSIGHT_RANGE_SECONDS).getEpochSecond(),
                    now.getEpochSecond());
        }
        return limitToMetaMaxRange(new InsightRange(since, until));
    }

    InsightRange currentMonth(Instant now) {
        LocalDate firstDay = now.atZone(ZONE).toLocalDate().withDayOfMonth(1);
        return limitToMetaMaxRange(new InsightRange(
                firstDay.atStartOfDay(ZONE).toEpochSecond(),
                now.getEpochSecond()));
    }

    boolean isCurrentMonth(String timestamp, Instant now) {
        if (timestamp == null || timestamp.isBlank()) {
            return true;
        }
        try {
            Instant postTime = Instant.parse(timestamp.replace("+0000", "Z"));
            return postTime.getEpochSecond() >= currentMonth(now).since();
        } catch (Exception ignored) {
            return true;
        }
    }

    private Optional<Instant> parseStartInstant(String value) {
        if (value == null || value.isBlank() || value.endsWith("daysAgo")) {
            return Optional.empty();
        }
        try {
            return Optional.of(LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
                    .atStartOfDay(ZONE)
                    .toInstant());
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private Optional<Instant> parseEndInstant(String value) {
        if (value == null || value.isBlank() || "today".equalsIgnoreCase(value)) {
            return Optional.empty();
        }
        try {
            return Optional.of(LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
                    .plusDays(1)
                    .atStartOfDay(ZONE)
                    .toInstant());
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    private int parseDays(String rangeStart) {
        if (rangeStart == null) {
            return 30;
        }
        try {
            String number = rangeStart.replaceAll("[^0-9]", "");
            return number.isEmpty() ? 30 : Integer.parseInt(number);
        } catch (NumberFormatException ignored) {
            return 30;
        }
    }

    public record InsightRange(long since, long until) {}

    public InsightRange limitToMetaMaxRange(InsightRange range) {
        if (range.until() - range.since() <= MAX_INSIGHT_RANGE_SECONDS) {
            return range;
        }
        return new InsightRange(range.until() - MAX_INSIGHT_RANGE_SECONDS, range.until());
    }
}
