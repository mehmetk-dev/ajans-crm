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
        Map<String, Long> values = batchInsightValues(mediaId, accessToken,
                List.of("plays", "views", "ig_reels_aggregated_all_plays_count", "video_views",
                        "reach", "saved", "shares"));
        long views = values.getOrDefault("plays",
                values.getOrDefault("views",
                values.getOrDefault("ig_reels_aggregated_all_plays_count",
                values.getOrDefault("video_views", 0L))));
        return new ReelInsightStats(
                views,
                values.getOrDefault("reach", 0L),
                values.getOrDefault("saved", 0L),
                values.getOrDefault("shares", 0L));
    }

    public PostInsightStats postInsights(String mediaId, String accessToken) {
        if (mediaId == null || mediaId.isBlank()) {
            return new PostInsightStats(0, 0, 0, 0);
        }
        Map<String, Long> values = batchInsightValues(mediaId, accessToken,
                List.of("impressions", "views", "reach", "saved", "shares"));
        long impressions = values.getOrDefault("impressions",
                values.getOrDefault("views",
                values.getOrDefault("reach", 0L)));
        return new PostInsightStats(
                impressions,
                values.getOrDefault("reach", 0L),
                values.getOrDefault("saved", 0L),
                values.getOrDefault("shares", 0L));
    }

    private Map<String, Long> batchInsightValues(
            String mediaId, String accessToken, List<String> metrics) {
        String metricParam = String.join(",", metrics);
        try {
            Map<String, Object> response = client.get(
                    "/" + mediaId + "/insights", accessToken,
                    Map.of("metric", metricParam));
            java.util.LinkedHashMap<String, Long> result = new java.util.LinkedHashMap<>();
            for (Map<String, Object> insight : parser.dataRows(response)) {
                Object name = insight.get("name");
                if (name != null) {
                    long value = parser.toLong(insight.get("values"));
                    if (value == 0) {
                        Object rawValue = insight.get("values");
                        if (rawValue instanceof List<?> list && !list.isEmpty()) {
                            Object last = list.get(list.size() - 1);
                            if (last instanceof Map<?, ?> lastMap) {
                                value = parser.toLong(lastMap.get("value"));
                            }
                        }
                    }
                    result.put(name.toString(), value);
                }
            }
            return result;
        } catch (Exception exception) {
            log.debug("Instagram media insight batch alınamadı, mediaId={}: {}",
                    mediaId, exception.getMessage());
            return Map.of();
        }
    }

    public record ReelInsightStats(long views, long reach, long saved, long shares) {}

    public record PostInsightStats(
            long impressions,
            long reach,
            long saved,
            long shares) {}
}
