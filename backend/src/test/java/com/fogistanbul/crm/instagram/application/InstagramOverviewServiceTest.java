package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
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
}
