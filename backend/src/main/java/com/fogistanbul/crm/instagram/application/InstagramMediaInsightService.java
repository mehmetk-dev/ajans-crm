package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.OptionalLong;

@Service
@RequiredArgsConstructor
public class InstagramMediaInsightService {

    private static final Logger log =
            LoggerFactory.getLogger(InstagramMediaInsightService.class);

    private final InstagramGraphClient client;
    private final InstagramInsightParser parser;

    public ReelInsightStats reelInsights(String mediaId, String accessToken) {
        if (mediaId == null || mediaId.isBlank()) {
            return new ReelInsightStats(0, 0, 0, 0);
        }
        return new ReelInsightStats(
                firstAvailable(mediaId, accessToken,
                        List.of("plays", "views",
                                "ig_reels_aggregated_all_plays_count", "video_views")),
                insightValue(mediaId, accessToken, "reach").orElse(0),
                insightValue(mediaId, accessToken, "saved").orElse(0),
                insightValue(mediaId, accessToken, "shares").orElse(0));
    }

    public PostInsightStats postInsights(String mediaId, String accessToken) {
        if (mediaId == null || mediaId.isBlank()) {
            return new PostInsightStats(0, 0, 0, 0);
        }
        return new PostInsightStats(
                firstAvailable(mediaId, accessToken,
                        List.of("impressions", "views", "reach")),
                insightValue(mediaId, accessToken, "reach").orElse(0),
                insightValue(mediaId, accessToken, "saved").orElse(0),
                insightValue(mediaId, accessToken, "shares").orElse(0));
    }

    private long firstAvailable(
            String mediaId,
            String accessToken,
            List<String> metrics) {
        for (String metric : metrics) {
            OptionalLong value = insightValue(mediaId, accessToken, metric);
            if (value.isPresent()) {
                return value.getAsLong();
            }
        }
        return 0;
    }

    private OptionalLong insightValue(
            String mediaId,
            String accessToken,
            String metric) {
        List<Map<String, ?>> candidates = List.of(
                Map.of("metric", metric),
                Map.of("metric", metric, "metric_type", "total_value", "period", "day"),
                Map.of("metric", metric, "period", "day"));

        for (Map<String, ?> query : candidates) {
            try {
                OptionalLong value = parser.singleInsightValue(
                        client.get("/" + mediaId + "/insights", accessToken, query),
                        metric);
                if (value.isPresent()) {
                    return value;
                }
            } catch (Exception exception) {
                log.debug(
                        "Instagram media insight adayi gecersiz, mediaId={}, metric={}: {}",
                        mediaId, metric, exception.getMessage());
            }
        }
        return OptionalLong.empty();
    }

    public record ReelInsightStats(long views, long reach, long saved, long shares) {}

    public record PostInsightStats(
            long impressions,
            long reach,
            long saved,
            long shares) {}
}
