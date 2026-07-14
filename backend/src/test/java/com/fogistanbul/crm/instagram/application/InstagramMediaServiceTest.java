package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramMediaServiceTest {

    @Mock
    InstagramOAuthService oAuthService;

    @Mock
    InstagramGraphClient client;

    @Mock
    InstagramMediaInsightService mediaInsightService;

    InstagramMediaService service;

    @BeforeEach
    void setUp() {
        service = new InstagramMediaService(
                oAuthService,
                client,
                new InstagramInsightParser(),
                new InstagramDateRangeResolver(),
                mediaInsightService);
    }

    @Test
    void getReels_propagatesMetaFailureSoSnapshotCanPreservePreviousData() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getToken(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().igUserId("ig-1").build()));
        when(oAuthService.getValidAccessToken(companyId)).thenReturn(Optional.of("token"));
        when(client.get(eq("/ig-1/media"), eq("token"), anyMap()))
                .thenThrow(new RuntimeException("temporary Meta outage"));

        assertThatThrownBy(() -> service.getReels(companyId, 24))
                .hasMessageContaining("temporary Meta outage");
    }

    @Test
    void getPosts_propagatesMetaFailureSoUiDoesNotPretendThereAreNoPosts() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getToken(companyId)).thenReturn(Optional.of(
                InstagramToken.builder().igUserId("ig-1").build()));
        when(oAuthService.getValidAccessToken(companyId)).thenReturn(Optional.of("token"));
        when(client.get(eq("/ig-1/media"), eq("token"), anyMap()))
                .thenThrow(new RuntimeException("temporary Meta outage"));

        assertThatThrownBy(() -> service.getPostsPreview(companyId, 12))
                .hasMessageContaining("temporary Meta outage");
    }
}
