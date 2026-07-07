package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.MediaRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.PostRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.ReelRow;
import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InstagramMediaService {

    private static final Logger log = LoggerFactory.getLogger(InstagramMediaService.class);
    private static final String MEDIA_FIELDS =
            "id,caption,media_type,media_product_type,media_url,thumbnail_url,"
                    + "permalink,timestamp,like_count,comments_count";

    private final InstagramOAuthService oAuthService;
    private final InstagramGraphClient client;
    private final InstagramInsightParser parser;
    private final InstagramDateRangeResolver dateRangeResolver;
    private final InstagramMediaInsightService mediaInsightService;

    public List<ReelRow> getReels(UUID companyId, int limit) {
        Optional<InstagramContext> context = context(companyId);
        if (context.isEmpty()) {
            return List.of();
        }
        try {
            List<ReelRow> rows = new ArrayList<>();
            for (Map<String, Object> media : fetchMedia(context.get(), mediaFetchLimit(limit))) {
                if (!"REELS".equalsIgnoreCase(stringValue(media.get("media_product_type")))
                        || !dateRangeResolver.isCurrentMonth(
                                stringValue(media.get("timestamp")))) {
                    continue;
                }
                String mediaId = stringValue(media.get("id"));
                var insights = mediaInsightService.reelInsights(
                        mediaId, context.get().accessToken());
                rows.add(new ReelRow(
                        mediaId,
                        truncate(stringValue(media.get("caption")), 80),
                        firstNonBlank(
                                stringValue(media.get("thumbnail_url")),
                                stringValue(media.get("media_url"))),
                        stringValue(media.get("permalink")),
                        stringValue(media.get("timestamp")),
                        parser.toLong(media.get("like_count")),
                        parser.toLong(media.get("comments_count")),
                        insights.views(),
                        insights.reach(),
                        insights.saved(),
                        insights.shares()));
                if (rows.size() >= limit) {
                    break;
                }
            }
            return rows;
        } catch (Exception exception) {
            log.error(
                    "Instagram reels hatası, companyId={}: {}",
                    companyId, exception.getMessage());
            if (InstagramGraphErrorClassifier.isInvalidAccessToken(exception)) {
                log.warn("Instagram token geçersiz, bağlantı siliniyor companyId={}", companyId);
                oAuthService.disconnect(companyId);
            }
            return List.of();
        }
    }

    public List<PostRow> getPosts(UUID companyId, int limit) {
        Optional<InstagramContext> context = context(companyId);
        if (context.isEmpty()) {
            return List.of();
        }
        try {
            List<PostRow> rows = new ArrayList<>();
            for (Map<String, Object> media : fetchMedia(context.get(), mediaFetchLimit(limit))) {
                if ("REELS".equalsIgnoreCase(stringValue(media.get("media_product_type")))
                        || !dateRangeResolver.isCurrentMonth(
                                stringValue(media.get("timestamp")))) {
                    continue;
                }
                String mediaId = stringValue(media.get("id"));
                var insights = mediaInsightService.postInsights(
                        mediaId, context.get().accessToken());
                rows.add(new PostRow(
                        mediaId,
                        truncate(stringValue(media.get("caption")), 80),
                        stringValue(media.get("media_type")),
                        firstNonBlank(
                                stringValue(media.get("media_url")),
                                stringValue(media.get("thumbnail_url"))),
                        stringValue(media.get("permalink")),
                        stringValue(media.get("timestamp")),
                        parser.toLong(media.get("like_count")),
                        parser.toLong(media.get("comments_count")),
                        insights.impressions(),
                        insights.reach(),
                        insights.saved(),
                        insights.shares()));
                if (rows.size() >= limit) {
                    break;
                }
            }
            return rows;
        } catch (Exception exception) {
            log.error(
                    "Instagram posts hatası, companyId={}: {}",
                    companyId, exception.getMessage());
            if (InstagramGraphErrorClassifier.isInvalidAccessToken(exception)) {
                log.warn("Instagram token geçersiz, bağlantı siliniyor companyId={}", companyId);
                oAuthService.disconnect(companyId);
            }
            return List.of();
        }
    }

    public List<MediaRow> getRecentMedia(
            String igUserId,
            String accessToken,
            int limit) {
        try {
            Map<String, Object> response = client.get(
                    "/" + igUserId + "/media",
                    accessToken,
                    Map.of(
                            "fields", MEDIA_FIELDS,
                            "limit", limit));
            return parser.dataRows(response).stream()
                    .map(media -> new MediaRow(
                            stringValue(media.get("id")),
                            truncate(stringValue(media.get("caption")), 120),
                            stringValue(media.get("media_type")),
                            stringValue(media.get("media_product_type")),
                            stringValue(media.get("media_url")),
                            stringValue(media.get("thumbnail_url")),
                            stringValue(media.get("permalink")),
                            stringValue(media.get("timestamp")),
                            parser.toLong(media.get("like_count")),
                            parser.toLong(media.get("comments_count"))))
                    .toList();
        } catch (Exception exception) {
            log.warn("Instagram media alınamadı: {}", exception.getMessage());
            return List.of();
        }
    }

    private Optional<InstagramContext> context(UUID companyId) {
        Optional<InstagramToken> token = oAuthService.getToken(companyId);
        if (token.isEmpty()
                || token.get().getIgUserId() == null
                || token.get().getIgUserId().isBlank()) {
            return Optional.empty();
        }
        return oAuthService.getValidAccessToken(companyId)
                .map(accessToken -> new InstagramContext(
                        token.get().getIgUserId(), accessToken));
    }

    private List<Map<String, Object>> fetchMedia(
            InstagramContext context,
            int limit) {
        return parser.dataRows(client.get(
                "/" + context.igUserId() + "/media",
                context.accessToken(),
                Map.of("fields", MEDIA_FIELDS, "limit", limit)));
    }

    private int mediaFetchLimit(int requestedLimit) {
        return Math.min(100, Math.max(12, requestedLimit * 4));
    }

    private String stringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    private String firstNonBlank(String first, String second) {
        return !first.isBlank() ? first : second;
    }

    private String truncate(String value, int maxLength) {
        return value.length() <= maxLength
                ? value
                : value.substring(0, maxLength) + "...";
    }

    private record InstagramContext(String igUserId, String accessToken) {}
}
