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

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstagramOverviewService {

    private static final Logger log = LoggerFactory.getLogger(InstagramOverviewService.class);

    private final InstagramOAuthService oAuthService;
    private final InstagramGraphClient client;
    private final InstagramInsightParser parser;
    private final InstagramInsightFetcher insightFetcher;
    private final InstagramDailyTrendBuilder trendBuilder;
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
        if (token.getIgUserId() == null || token.getIgUserId().isBlank()) {
            return InstagramOverviewResponse.disabled();
        }

        String accessToken = oAuthService.getValidAccessToken(companyId).orElse(null);
        if (accessToken == null) {
            return InstagramOverviewResponse.disabled();
        }

        InsightRange range = insightFetcher.resolver().resolve(rangeStart, rangeEnd);
        try {
            return buildOverview(companyId, token, accessToken, range);
        } catch (Exception exception) {
            log.error("Instagram overview hatası, companyId={}: {}", companyId, exception.getMessage());
            if (isInvalidToken(exception)) {
                log.warn("Instagram token geçersiz, bağlantı siliniyor companyId={}", companyId);
                oAuthService.disconnect(companyId);
                return InstagramOverviewResponse.disabled();
            }
            return InstagramOverviewResponse.error(
                    token.getIgUsername(),
                    "Instagram API hatası: " + exception.getMessage());
        }
    }

    private InstagramOverviewResponse buildOverview(
            UUID companyId, InstagramToken token, String accessToken, InsightRange range) {
        String igUserId = token.getIgUserId();

        Map<String, Object> profile = client.get(
                "/" + igUserId, accessToken,
                Map.of("fields", "followers_count,follows_count,media_count,username"));

        List<Map<String, Object>> followerValues = insightFetcher.fetchInsight(
                igUserId, accessToken, "follower_count", "day", range);
        List<Map<String, Object>> viewValues = insightFetcher.fetchTotalInsight(
                igUserId, accessToken, "views", range);
        Map<String, Long> dailyViews = insightFetcher.fetchDailyTotalInsightByDate(
                igUserId, accessToken, "views", followerValues);
        List<Map<String, Object>> reachValues = insightFetcher.fetchInsight(
                igUserId, accessToken, "reach", "day", range);
        List<Map<String, Object>> profileViewValues = insightFetcher.fetchTotalInsight(
                igUserId, accessToken, "profile_views", range);
        List<Map<String, Object>> websiteClickValues = insightFetcher.fetchTotalInsight(
                igUserId, accessToken, "website_clicks", range);

        FollowStats followStats = resolveFollowStats(igUserId, accessToken, range, followerValues);

        List<DailyRow> dailyTrend = trendBuilder.build(followerValues, reachValues, dailyViews);
        List<MediaRow> recentMedia = mediaService.getRecentMedia(igUserId, accessToken, 12);

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
    }

    private FollowStats resolveFollowStats(
            String igUserId, String accessToken, InsightRange range,
            List<Map<String, Object>> followerValues) {
        FollowStats followStats = insightFetcher.fetchFollowStats(igUserId, accessToken, range);
        if (!followStats.available()) {
            followStats = insightFetcher.fetchFollowStats(
                    igUserId, accessToken, insightFetcher.resolver().currentMonth());
        }
        if (!followStats.available() && followerValues.size() >= 2) {
            long first = parser.toLong(followerValues.get(0).get("value"));
            long last = parser.toLong(followerValues.get(followerValues.size() - 1).get("value"));
            long difference = last - first;
            followStats = new FollowStats(
                    Math.max(0, difference),
                    Math.abs(Math.min(0, difference)),
                    false);
        }
        return followStats;
    }

    private String stringValue(Object value, String fallback) {
        return value != null ? value.toString() : fallback;
    }

    private boolean isInvalidToken(Exception exception) {
        String message = exception.getMessage() != null ? exception.getMessage() : "";
        return message.contains("\"code\":200")
                || message.contains("API access blocked")
                || message.contains("OAuthException")
                || message.contains("Invalid OAuth");
    }
}
