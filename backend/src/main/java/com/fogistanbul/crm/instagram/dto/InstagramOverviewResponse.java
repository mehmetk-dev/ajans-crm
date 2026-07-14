package com.fogistanbul.crm.instagram.dto;

import java.util.List;

public record InstagramOverviewResponse(
        boolean connected,
        String username,
        String errorMessage,
        String warningMessage,
        String periodStart,
        String periodEnd,
        long followersCount,
        long followsCount,
        long mediaCount,
        long impressions,
        long reach,
        long profileViews,
        long websiteClicks,
        long totalLikes,
        long totalComments,
        long followersGained,
        long followersLost,
        List<DailyRow> dailyTrend,
        List<MediaRow> recentMedia
) {
    public static InstagramOverviewResponse disabled() {
        return new InstagramOverviewResponse(
                false, null, null, null, null, null,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                List.of(), List.of());
    }

    public static InstagramOverviewResponse error(String username, String message) {
        return new InstagramOverviewResponse(
                true, username, message, null, null, null,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                List.of(), List.of());
    }

    public record DailyRow(String date, long followers, long impressions, long reach) {}

    public record MediaRow(
            String id,
            String caption,
            String mediaType,
            String mediaProductType,
            String mediaUrl,
            String thumbnailUrl,
            String permalink,
            String timestamp,
            long likeCount,
            long commentsCount) {}

    public record ReelRow(
            String id,
            String caption,
            String thumbnailUrl,
            String permalink,
            String timestamp,
            long likeCount,
            long commentsCount,
            long plays,
            long reach,
            long saved,
            long shares) {}

    public record PostRow(
            String id,
            String caption,
            String mediaType,
            String mediaUrl,
            String permalink,
            String timestamp,
            long likeCount,
            long commentsCount,
            long impressions,
            long reach,
            long saved,
            long shares) {}
}
