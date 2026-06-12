package com.fogistanbul.crm.searchconsole.application;

import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient.QueryRow;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Component
public class SearchConsoleMapper {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public ScOverviewResponse emptyConnectedResponse() {
        return new ScOverviewResponse(
                true, null, null, 0, 0, 0.0, 0.0,
                List.of(), List.of(), List.of(), List.of(), List.of());
    }

    public ScOverviewResponse toOverviewResponse(
            String siteUrl,
            List<QueryRow> overviewRows,
            List<QueryRow> dailyRows,
            List<QueryRow> queryRows,
            List<QueryRow> pageRows,
            List<QueryRow> deviceRows,
            List<QueryRow> countryRows) {
        QueryRow overview = overviewRows.stream().findFirst().orElse(QueryRow.empty());

        List<ScOverviewResponse.ScDailyRow> dailyTrend = dailyRows.stream()
                .map(this::toDailyRow)
                .sorted(Comparator.comparing(ScOverviewResponse.ScDailyRow::date))
                .toList();
        List<ScOverviewResponse.ScQueryRow> topQueries = queryRows.stream()
                .map(this::toQueryRow)
                .toList();
        List<ScOverviewResponse.ScPageRow> topPages = pageRows.stream()
                .map(this::toPageRow)
                .toList();
        List<ScOverviewResponse.ScNamedMetric> devices = deviceRows.stream()
                .map(row -> toNamedMetric(row, true))
                .toList();
        List<ScOverviewResponse.ScNamedMetric> countries = countryRows.stream()
                .map(row -> toNamedMetric(row, false))
                .toList();

        return new ScOverviewResponse(
                true,
                siteUrl,
                null,
                overview.clicks(),
                overview.impressions(),
                Math.round(overview.ctr() * 10000.0) / 100.0,
                round1(overview.position()),
                dailyTrend,
                topQueries,
                topPages,
                devices,
                countries);
    }

    public ScOverviewResponse.ScDailyRow toDailyRow(QueryRow row) {
        return new ScOverviewResponse.ScDailyRow(
                formatDate(row.firstKey()),
                row.clicks(),
                row.impressions(),
                round4(row.ctr()),
                round1(row.position()));
    }

    public ScOverviewResponse.ScQueryRow toQueryRow(QueryRow row) {
        return new ScOverviewResponse.ScQueryRow(
                row.firstKey(),
                row.clicks(),
                row.impressions(),
                round4(row.ctr()),
                round1(row.position()));
    }

    public ScOverviewResponse.ScPageRow toPageRow(QueryRow row) {
        return new ScOverviewResponse.ScPageRow(
                row.firstKey(),
                row.clicks(),
                row.impressions(),
                round4(row.ctr()),
                round1(row.position()));
    }

    public ScOverviewResponse.ScNamedMetric toNamedMetric(QueryRow row, boolean translateDevice) {
        String name = translateDevice ? translateDevice(row.firstKey()) : row.firstKey();
        return new ScOverviewResponse.ScNamedMetric(name, row.clicks(), row.impressions());
    }

    public String resolveDate(String input, LocalDate today) {
        if (input == null || input.isBlank()) {
            return today.minusDays(30).format(DATE_FORMAT);
        }
        if ("today".equalsIgnoreCase(input)) {
            return today.format(DATE_FORMAT);
        }
        if (input.endsWith("daysAgo")) {
            try {
                int days = Integer.parseInt(input.replace("daysAgo", ""));
                return today.minusDays(days).format(DATE_FORMAT);
            } catch (NumberFormatException exception) {
                return today.minusDays(30).format(DATE_FORMAT);
            }
        }
        return input;
    }

    public String formatDate(String value) {
        if (value == null || value.length() < 10) {
            return value;
        }
        return value.substring(8) + "." + value.substring(5, 7);
    }

    public String toUserErrorMessage(String message) {
        if (message.contains("403") || message.contains("Forbidden")) {
            return "Bu Google hesabının Search Console'a erişim yetkisi yok. Lütfen site sahipliğini kontrol edin.";
        }
        if (message.contains("401") || message.contains("Unauthorized")) {
            return "Oturum süresi dolmuş. Lütfen Google hesabınızı yeniden bağlayın.";
        }
        if (message.contains("404") || message.contains("not found")) {
            return "Site URL'i Search Console'da bulunamadı. Lütfen doğru URL'i girin.";
        }
        return "Search Console API hatası: " + message.split("\n")[0];
    }

    private String translateDevice(String device) {
        return switch (device.toUpperCase()) {
            case "DESKTOP" -> "Masaüstü";
            case "MOBILE" -> "Mobil";
            case "TABLET" -> "Tablet";
            default -> device;
        };
    }

    private double round4(double value) {
        return Math.round(value * 10000.0) / 10000.0;
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
