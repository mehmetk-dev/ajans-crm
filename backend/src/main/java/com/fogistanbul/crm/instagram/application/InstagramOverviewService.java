package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.application.InstagramDateRangeResolver.InsightRange;
import com.fogistanbul.crm.instagram.application.InstagramInsightParser.FollowStats;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.DailyRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.MediaRow;
import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstagramOverviewService {

    private static final Logger log =
            LoggerFactory.getLogger(InstagramOverviewService.class);
    private static final ZoneId ZONE = ZoneId.of("Europe/Istanbul");

    private final InstagramOAuthService oAuthService;
    private final InstagramGraphClient client;
    private final InstagramInsightParser parser;
    private final InstagramDateRangeResolver dateRangeResolver;
    private final InstagramMediaService mediaService;

    public InstagramOverviewResponse getOverview(
            UUID companyId,
            String rangeStart,
            String rangeEnd) {
        Optional<InstagramToken> tokenOptional = oAuthService.getToken(companyId);
        if (tokenOptional.isEmpty()) {
            return InstagramOverviewResponse.disabled();
        }

        InstagramToken token = tokenOptional.get();
        String igUserId = token.getIgUserId();
        if (igUserId == null || igUserId.isBlank()) {
            return InstagramOverviewResponse.disabled();
        }

        String accessToken = oAuthService.getValidAccessToken(companyId).orElse(null);
        if (accessToken == null) {
            return InstagramOverviewResponse.disabled();
        }

        InsightRange range = dateRangeResolver.resolve(rangeStart, rangeEnd);
        try {
            Map<String, Object> profile = client.get(
                    "/" + igUserId,
                    accessToken,
                    Map.of(
                            "fields",
                            "followers_count,follows_count,media_count,username"));

            List<Map<String, Object>> followerValues = fetchInsight(
                    igUserId, accessToken, "follower_count", "day", range);
            List<Map<String, Object>> viewValues = fetchTotalInsight(
                    igUserId, accessToken, "views", range);
            Map<String, Long> dailyViews = fetchDailyTotalInsightByDate(
                    igUserId, accessToken, "views", followerValues);
            List<Map<String, Object>> reachValues = fetchInsight(
                    igUserId, accessToken, "reach", "day", range);
            List<Map<String, Object>> profileViewValues = fetchTotalInsight(
                    igUserId, accessToken, "profile_views", range);
            List<Map<String, Object>> websiteClickValues = fetchTotalInsight(
                    igUserId, accessToken, "website_clicks", range);

            FollowStats followStats = fetchFollowStats(
                    igUserId, accessToken, range);
            if (!followStats.available()) {
                followStats = fetchFollowStats(
                        igUserId, accessToken, dateRangeResolver.currentMonth());
            }
            if (!followStats.available() && followerValues.size() >= 2) {
                long first = parser.toLong(followerValues.get(0).get("value"));
                long last = parser.toLong(
                        followerValues.get(followerValues.size() - 1).get("value"));
                long difference = last - first;
                followStats = new FollowStats(
                        Math.max(0, difference),
                        Math.abs(Math.min(0, difference)),
                        false);
            }

            List<DailyRow> dailyTrend = dailyTrend(
                    followerValues, reachValues, dailyViews);
            List<MediaRow> recentMedia = mediaService.getRecentMedia(
                    igUserId, accessToken, 12);

            return new InstagramOverviewResponse(
                    true,
                    stringValue(profile.get("username"), token.getIgUsername()),
                    null,
                    parser.toLong(profile.get("followers_count")),
                    parser.toLong(profile.get("follows_count")),
                    parser.toLong(profile.get("media_count")),
                    parser.sumInsightValues(viewValues),
                    parser.sumInsightValues(reachValues),
                    parser.sumInsightValues(profileViewValues),
                    parser.sumInsightValues(websiteClickValues),
                    recentMedia.stream().mapToLong(MediaRow::likeCount).sum(),
                    recentMedia.stream().mapToLong(MediaRow::commentsCount).sum(),
                    followStats.gained(),
                    followStats.lost(),
                    dailyTrend,
                    recentMedia);
        } catch (Exception exception) {
            log.error(
                    "Instagram overview hatasi, companyId={}: {}",
                    companyId, exception.getMessage());
            if (isInvalidToken(exception)) {
                log.warn(
                        "Instagram token gecersiz, baglanti siliniyor companyId={}",
                        companyId);
                oAuthService.disconnect(companyId);
                return InstagramOverviewResponse.disabled();
            }
            return InstagramOverviewResponse.error(
                    token.getIgUsername(),
                    "Instagram API hatası: " + exception.getMessage());
        }
    }

    private List<Map<String, Object>> fetchInsight(
            String igUserId,
            String accessToken,
            String metric,
            String period,
            InsightRange range) {
        try {
            return parser.insightValues(client.get(
                    "/" + igUserId + "/insights",
                    accessToken,
                    Map.of(
                            "metric", metric,
                            "period", period,
                            "since", range.since(),
                            "until", range.until())));
        } catch (Exception exception) {
            log.warn(
                    "Instagram insight alinamadi, metric={}: {}",
                    metric, exception.getMessage());
            return List.of();
        }
    }

    private List<Map<String, Object>> fetchTotalInsight(
            String igUserId,
            String accessToken,
            String metric,
            InsightRange range) {
        try {
            return parser.totalInsightValues(client.get(
                    "/" + igUserId + "/insights",
                    accessToken,
                    Map.of(
                            "metric", metric,
                            "metric_type", "total_value",
                            "period", "day",
                            "since", range.since(),
                            "until", range.until())));
        } catch (Exception exception) {
            log.warn(
                    "Instagram total insight alinamadi, metric={}: {}",
                    metric, exception.getMessage());
            return List.of();
        }
    }

    private FollowStats fetchFollowStats(
            String igUserId,
            String accessToken,
            InsightRange range) {
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
                log.debug(
                        "Instagram takipci hareketi adayi gecersiz: {}",
                        exception.getMessage());
            }
        }
        return FollowStats.unavailable();
    }

    private Map<String, Long> fetchDailyTotalInsightByDate(
            String igUserId,
            String accessToken,
            String metric,
            List<Map<String, Object>> trendRows) {
        Map<String, Long> dailyValues = new LinkedHashMap<>();
        for (Map<String, Object> row : trendRows) {
            String date = insightDate(row);
            if (date.isBlank() || dailyValues.containsKey(date)) {
                continue;
            }
            try {
                LocalDate day = LocalDate.parse(date, DateTimeFormatter.ISO_LOCAL_DATE);
                InsightRange dayRange = new InsightRange(
                        day.atStartOfDay(ZONE).toEpochSecond(),
                        day.plusDays(1).atStartOfDay(ZONE).toEpochSecond());
                dailyValues.put(
                        date,
                        parser.sumInsightValues(fetchTotalInsight(
                                igUserId, accessToken, metric, dayRange)));
            } catch (Exception exception) {
                log.debug(
                        "Instagram gunluk insight alinamadi, metric={}, date={}: {}",
                        metric, date, exception.getMessage());
                dailyValues.put(date, 0L);
            }
        }
        return dailyValues;
    }

    private List<DailyRow> dailyTrend(
            List<Map<String, Object>> followerValues,
            List<Map<String, Object>> reachValues,
            Map<String, Long> dailyViews) {
        List<DailyRow> rows = new ArrayList<>();
        for (int index = 0; index < followerValues.size(); index++) {
            Map<String, Object> follower = followerValues.get(index);
            String date = insightDate(follower);
            long reach = index < reachValues.size()
                    ? parser.toLong(reachValues.get(index).get("value"))
                    : 0;
            rows.add(new DailyRow(
                    date,
                    parser.toLong(follower.get("value")),
                    dailyViews.getOrDefault(date, 0L),
                    reach));
        }
        return rows;
    }

    private String insightDate(Map<String, Object> row) {
        Object endTime = row.get("end_time");
        if (endTime == null) {
            return "";
        }
        String value = endTime.toString();
        return value.length() >= 10 ? value.substring(0, 10) : value;
    }

    private String stringValue(Object value, String fallback) {
        return value != null ? value.toString() : fallback;
    }

    private boolean isInvalidToken(Exception exception) {
        String message = exception.getMessage() != null
                ? exception.getMessage()
                : "";
        return message.contains("\"code\":200")
                || message.contains("API access blocked")
                || message.contains("OAuthException")
                || message.contains("Invalid OAuth");
    }
}
