package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramOverviewServiceTest {

    @Mock
    InstagramOAuthService oAuthService;

    @Mock
    InstagramGraphClient client;

    @Mock
    InstagramMediaService mediaService;

    InstagramOverviewService service;

    @BeforeEach
    void setUp() {
        InstagramDateRangeResolver dateRangeResolver = new InstagramDateRangeResolver();
        InstagramInsightFetcher insightFetcher = new InstagramInsightFetcher(client, new InstagramInsightParser(), dateRangeResolver);
        InstagramDailyTrendBuilder trendBuilder = new InstagramDailyTrendBuilder(new InstagramInsightParser());
        service = new InstagramOverviewService(
                oAuthService,
                client,
                new InstagramInsightParser(),
                insightFetcher,
                trendBuilder,
                mediaService);
    }

    @Test
    void getOverview_returnsDisabledWhenTokenIsMissing() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getToken(companyId)).thenReturn(Optional.empty());

        var result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(client, mediaService);
    }

    @Test
    void getOverview_returnsDisabledWhenInstagramUserIdIsMissing() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getToken(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().igUserId(" ").build()));

        var result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(client, mediaService);
    }

    @Test
    void getOverview_returnsDisabledWhenAccessTokenCannotBeRefreshed() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getToken(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().igUserId("1789").build()));
        when(oAuthService.getValidAccessToken(companyId)).thenReturn(Optional.empty());

        var result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(client, mediaService);
    }

    @Test
    void getOverview_skipsInsightCallsWhenInsightsPermissionIsMissing() {
        UUID companyId = UUID.randomUUID();
        String igUserId = "1789";
        when(oAuthService.getToken(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().igUserId(igUserId).igUsername("fallback").build()));
        when(oAuthService.getValidAccessToken(companyId)).thenReturn(Optional.of("token"));
        when(client.getGrantedPermissions("token"))
                .thenReturn(Set.of("pages_show_list", "pages_read_engagement", "instagram_basic"));
        when(client.get(eq("/" + igUserId), eq("token"), eq(Map.of(
                "fields", "followers_count,follows_count,media_count,username"))))
                .thenReturn(Map.of(
                        "username", "aydinlifemobilya",
                        "followers_count", 224500,
                        "follows_count", 3,
                        "media_count", 4));
        when(mediaService.getRecentMedia(igUserId, "token", 12))
                .thenReturn(List.of(
                        new InstagramOverviewResponse.MediaRow(
                                "media-1", "caption", "IMAGE", "FEED",
                                "https://example.com/img.jpg", "",
                                "https://instagram.com/p/1", "2026-07-08T00:00:00+0000", 10, 2)));

        var result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isTrue();
        assertThat(result.errorMessage()).isNull();
        assertThat(result.warningMessage()).contains("Instagram analiz izni bekleniyor");
        assertThat(result.username()).isEqualTo("aydinlifemobilya");
        assertThat(result.periodStart()).isNotBlank();
        assertThat(result.periodEnd()).isNotBlank();
        assertThat(result.followersCount()).isEqualTo(224500);
        assertThat(result.totalLikes()).isEqualTo(10);
        assertThat(result.totalComments()).isEqualTo(2);
        assertThat(result.reach()).isZero();
        assertThat(result.impressions()).isZero();
        verify(client).getGrantedPermissions("token");
        verify(client).get(eq("/" + igUserId), eq("token"), eq(Map.of(
                "fields", "followers_count,follows_count,media_count,username")));
        verifyNoMoreInteractions(client);
    }
}
