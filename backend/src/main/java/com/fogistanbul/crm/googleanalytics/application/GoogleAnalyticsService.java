package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaDailyRow;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse.GaNamedMetric;
import com.fogistanbul.crm.service.GoogleOAuthService;
import com.google.analytics.data.v1beta.*;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.OAuth2Credentials;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAnalyticsService.class);
    private static final String DEFAULT_START = "30daysAgo";
    private static final String DEFAULT_END   = "today";

    private final GoogleOAuthService oAuthService;
    private final GoogleAnalyticsMapper mapper;

    /** Belirtilen şirketin GA bağlantısı var ve propertyId set edilmişse true. */
    public boolean isConfigured(UUID companyId) {
        return oAuthService.isConnected(companyId)
                && oAuthService.getPropertyId(companyId).isPresent();
    }

    public GaOverviewResponse getOverview(UUID companyId, String startDate, String endDate) {
        String rangeStart = (startDate != null && !startDate.isBlank()) ? startDate : DEFAULT_START;
        String rangeEnd   = (endDate   != null && !endDate.isBlank())   ? endDate   : DEFAULT_END;

        if (!oAuthService.isConnected(companyId)) {
            return GaOverviewResponse.disabled();
        }

        String propertyId = oAuthService.getPropertyId(companyId).orElse(null);
        if (propertyId == null || propertyId.isBlank()) {
            return new GaOverviewResponse(
                    true, null, null, 0, 0, 0, 0, 0.0, 0.0,
                    List.of(), List.of(), List.of(), List.of()
            );
        }

        String accessToken = oAuthService.getValidAccessToken(companyId).orElse(null);
        if (accessToken == null) {
            log.warn("GA access token alınamadı, companyId={}", companyId);
            return GaOverviewResponse.disabled();
        }

        try (BetaAnalyticsDataClient client = buildClient(accessToken)) {
            String property = "properties/" + propertyId;
            DateRange dr = DateRange.newBuilder().setStartDate(rangeStart).setEndDate(rangeEnd).build();

            // 1. Temel metrikler
            RunReportResponse overviewReport = client.runReport(RunReportRequest.newBuilder()
                    .setProperty(property)
                    .addDateRanges(dr)
                    .addMetrics(metric("sessions"))
                    .addMetrics(metric("totalUsers"))
                    .addMetrics(metric("newUsers"))
                    .addMetrics(metric("screenPageViews"))
                    .addMetrics(metric("bounceRate"))
                    .addMetrics(metric("averageSessionDuration"))
                    .build());

            long sessions = 0, totalUsers = 0, newUsers = 0, pageViews = 0;
            double bounceRate = 0, avgDuration = 0;

            if (overviewReport.getRowsCount() > 0) {
                Row row = overviewReport.getRows(0);
                sessions    = mapper.parseLong(row, 0);
                totalUsers  = mapper.parseLong(row, 1);
                newUsers    = mapper.parseLong(row, 2);
                pageViews   = mapper.parseLong(row, 3);
                bounceRate  = mapper.parseDouble(row, 4);
                avgDuration = mapper.parseDouble(row, 5);
            }

            // 2. Günlük trend
            RunReportResponse dailyReport = client.runReport(RunReportRequest.newBuilder()
                    .setProperty(property)
                    .addDateRanges(dr)
                    .addDimensions(dimension("date"))
                    .addMetrics(metric("sessions"))
                    .addMetrics(metric("totalUsers"))
                    .addOrderBys(OrderBy.newBuilder()
                            .setDimension(OrderBy.DimensionOrderBy.newBuilder().setDimensionName("date"))
                            .setDesc(false))
                    .build());

            List<GaDailyRow> dailyTrend = new ArrayList<>();
            for (Row row : dailyReport.getRowsList()) {
                dailyTrend.add(mapper.toDailyRow(row));
            }

            // 3. Trafik kaynakları
            RunReportResponse sourcesReport = client.runReport(RunReportRequest.newBuilder()
                    .setProperty(property)
                    .addDateRanges(dr)
                    .addDimensions(dimension("sessionDefaultChannelGroup"))
                    .addMetrics(metric("sessions"))
                    .addOrderBys(orderByMetricDesc("sessions"))
                    .setLimit(6)
                    .build());

            List<GaNamedMetric> trafficSources = new ArrayList<>();
            for (Row row : sourcesReport.getRowsList()) {
                trafficSources.add(mapper.toNamedMetric(row));
            }

            // 4. En çok ziyaret edilen sayfalar
            RunReportResponse pagesReport = client.runReport(RunReportRequest.newBuilder()
                    .setProperty(property)
                    .addDateRanges(dr)
                    .addDimensions(dimension("pagePath"))
                    .addMetrics(metric("screenPageViews"))
                    .addOrderBys(orderByMetricDesc("screenPageViews"))
                    .setLimit(8)
                    .build());

            List<GaNamedMetric> topPages = new ArrayList<>();
            for (Row row : pagesReport.getRowsList()) {
                topPages.add(mapper.toNamedMetric(row));
            }

            // 5. Ülkelere göre
            RunReportResponse countriesReport = client.runReport(RunReportRequest.newBuilder()
                    .setProperty(property)
                    .addDateRanges(dr)
                    .addDimensions(dimension("country"))
                    .addMetrics(metric("sessions"))
                    .addOrderBys(orderByMetricDesc("sessions"))
                    .setLimit(5)
                    .build());

            List<GaNamedMetric> topCountries = new ArrayList<>();
            for (Row row : countriesReport.getRowsList()) {
                topCountries.add(mapper.toNamedMetric(row));
            }

            return new GaOverviewResponse(
                    true, propertyId, null,
                    sessions, totalUsers, newUsers, pageViews,
                    Math.round(bounceRate * 10000.0) / 100.0,
                    Math.round(avgDuration * 10.0) / 10.0,
                    dailyTrend, trafficSources, topPages, topCountries
            );

        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            String userMsg;
            if (msg.contains("PERMISSION_DENIED") || msg.contains("not found") || msg.contains("INVALID_ARGUMENT")) {
                userMsg = "Mülk ID geçersiz veya bu hesabın erişim yetkisi yok. Lütfen doğru Property ID'yi girin.";
            } else if (msg.contains("UNAUTHENTICATED")) {
                userMsg = "Oturum süresi dolmuş. Lütfen Google hesabınızı yeniden bağlayın.";
            } else {
                userMsg = "GA API hatası: " + msg.split("\n")[0];
            }
            log.error("GA API hatası, companyId={}: {}", companyId, msg);
            return GaOverviewResponse.error(propertyId, userMsg);
        }
    }

    // ─── Yardımcılar ─────────────────────────────────────────────────────────

    private BetaAnalyticsDataClient buildClient(String accessToken) throws Exception {
        AccessToken googleAccessToken = new AccessToken(accessToken,
                Date.from(java.time.Instant.now().plusSeconds(3600)));
        OAuth2Credentials credentials = OAuth2Credentials.create(googleAccessToken);

        BetaAnalyticsDataSettings settings = BetaAnalyticsDataSettings.newBuilder()
                .setCredentialsProvider(() -> credentials)
                .build();

        return BetaAnalyticsDataClient.create(settings);
    }

    private Metric metric(String name) {
        return Metric.newBuilder().setName(name).build();
    }

    private Dimension dimension(String name) {
        return Dimension.newBuilder().setName(name).build();
    }

    private OrderBy orderByMetricDesc(String metricName) {
        return OrderBy.newBuilder()
                .setMetric(OrderBy.MetricOrderBy.newBuilder().setMetricName(metricName))
                .setDesc(true)
                .build();
    }
}
