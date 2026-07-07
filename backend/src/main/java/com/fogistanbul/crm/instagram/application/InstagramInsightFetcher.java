package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.application.InstagramDateRangeResolver.InsightRange;
import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.application.InstagramInsightParser.FollowStats;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class InstagramInsightFetcher {

    private static final Logger log = LoggerFactory.getLogger(InstagramInsightFetcher.class);
    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");

    private final InstagramGraphClient client;
    private final InstagramInsightParser parser;
    private final InstagramDateRangeResolver dateRangeResolver;

    public List<Map<String, Object>> fetchInsight(
            String igUserId, String accessToken, String metric, String period, InsightRange range) {
        try {
            return parser.insightValues(client.get(
                    "/" + igUserId + "/insights",
                    accessToken,
                    Map.of("metric", metric, "period", period,
                            "since", range.since(), "until", range.until())));
        } catch (Exception exception) {
            log.warn("Instagram insight alınamadı, metric={}: {}", metric, exception.getMessage());
            return List.of();
        }
    }

    public List<Map<String, Object>> fetchTotalInsight(
            String igUserId, String accessToken, String metric, InsightRange range) {
        try {
            return parser.totalInsightValues(client.get(
                    "/" + igUserId + "/insights",
                    accessToken,
                    Map.of("metric", metric, "metric_type", "total_value", "period", "day",
                            "since", range.since(), "until", range.until())));
        } catch (Exception exception) {
            log.warn("Instagram total insight alınamadı, metric={}: {}", metric, exception.getMessage());
            return List.of();
        }
    }

    public FollowStats fetchFollowStats(String igUserId, String accessToken, InsightRange range) {
        for (String breakdownName : List.of("breakdown", "breakdowns")) {
            try {
                Map<String, Object> query = new LinkedHashMap<>();
                query.put("metric", "follows_and_unfollows");
                query.put("metric_type", "total_value");
                query.put("period", "day");
                query.put("since", range.since());
                query.put("until", range.until());
                query.put(breakdownName, "follow_type");
                FollowStats stats = parser.followStats(client.get(
                        "/" + igUserId + "/insights", accessToken, query));
                if (stats.available()) {
                    return stats;
                }
            } catch (Exception exception) {
                log.debug("Instagram takipçi hareketi adayı geçersiz: {}", exception.getMessage());
            }
        }
        return FollowStats.unavailable();
    }

    public Map<String, Long> fetchDailyTotalInsightByDate(
            String igUserId, String accessToken, String metric, List<Map<String, Object>> trendRows) {
        Map<String, Long> dailyValues = new LinkedHashMap<>();
        if (trendRows.isEmpty()) {
            return dailyValues;
        }
        if ("views".equals(metric)) {
            return dailyValues;
        }

        String firstDate = insightDate(trendRows.get(0));
        String lastDate = insightDate(trendRows.get(trendRows.size() - 1));

        if (!firstDate.isBlank() && !lastDate.isBlank()) {
            try {
                LocalDate first = LocalDate.parse(firstDate, DateTimeFormatter.ISO_LOCAL_DATE);
                LocalDate last = LocalDate.parse(lastDate, DateTimeFormatter.ISO_LOCAL_DATE).plusDays(1);
                InsightRange fullRange = dateRangeResolver.limitToMetaMaxRange(new InsightRange(
                        first.atStartOfDay(ZONE).toEpochSecond(),
                        last.atStartOfDay(ZONE).toEpochSecond()));
                List<Map<String, Object>> dailyData = fetchInsight(
                        igUserId, accessToken, metric, "day", fullRange);
                for (Map<String, Object> row : dailyData) {
                    String date = insightDate(row);
                    if (!date.isBlank()) {
                        dailyValues.put(date, parser.toLong(row.get("value")));
                    }
                }
            } catch (Exception exception) {
                log.warn("Instagram günlük insight alınamadı, metric={}: {}", metric, exception.getMessage());
            }
        }

        for (Map<String, Object> row : trendRows) {
            String date = insightDate(row);
            if (!date.isBlank() && !dailyValues.containsKey(date)) {
                dailyValues.put(date, 0L);
            }
        }
        return dailyValues;
    }

    private String insightDate(Map<String, Object> row) {
        Object endTime = row.get("end_time");
        if (endTime == null) {
            return "";
        }
        String value = endTime.toString();
        return value.length() >= 10 ? value.substring(0, 10) : value;
    }

    public String dateOfInsight(Map<String, Object> row) {
        return insightDate(row);
    }

    public InstagramDateRangeResolver resolver() {
        return dateRangeResolver;
    }
}
