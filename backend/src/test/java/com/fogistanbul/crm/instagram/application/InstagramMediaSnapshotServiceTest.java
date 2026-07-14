package com.fogistanbul.crm.instagram.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.PostRow;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.ReelRow;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.application.IntegrationSnapshotPersistenceService;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static java.util.Map.entry;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramMediaSnapshotServiceTest {

    @Mock
    IntegrationSnapshotRepository snapshotRepository;

    @Mock
    CompanyRepository companyRepository;

    @Mock
    InstagramMediaService mediaService;

    @Mock
    IntegrationSnapshotPersistenceService persistenceService;

    InstagramMediaSnapshotService service;

    @BeforeEach
    void setUp() {
        service = new InstagramMediaSnapshotService(
                snapshotRepository,
                companyRepository,
                mediaService,
                persistenceService,
                new ObjectMapper());
    }

    @Test
    void getReels_returnsStoredSnapshotWithoutLiveMetaCalls() {
        UUID companyId = UUID.randomUUID();
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.INSTAGRAM, IntegrationSnapshotType.REELS))
                .thenReturn(Optional.of(IntegrationSnapshot.builder()
                        .status(IntegrationSnapshotStatus.READY)
                        .payload(Map.of("items", List.of(Map.ofEntries(
                                entry("id", "reel-1"),
                                entry("caption", "Yeni kampanya"),
                                entry("thumbnailUrl", "https://example.com/reel.jpg"),
                                entry("permalink", "https://instagram.com/reel/1"),
                                entry("timestamp", "2026-07-08T09:00:00+0000"),
                                entry("likeCount", 10),
                                entry("commentsCount", 2),
                                entry("plays", 400),
                                entry("reach", 220),
                                entry("saved", 3),
                                entry("shares", 4)))))
                        .build()));

        List<ReelRow> result = service.getReels(companyId, 12);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).id()).isEqualTo("reel-1");
        assertThat(result.get(0).plays()).isEqualTo(400);
        verify(mediaService, never()).getReels(companyId, 12);
        verify(mediaService, never()).getReelsPreview(companyId, 12);
    }

    @Test
    void getPosts_usesFastPreviewWhenSnapshotIsMissing() {
        UUID companyId = UUID.randomUUID();
        List<PostRow> preview = List.of(new PostRow(
                "post-1",
                "Preview",
                "IMAGE",
                "https://example.com/post.jpg",
                "https://instagram.com/p/1",
                "2026-07-08T09:00:00+0000",
                8,
                1,
                0,
                0,
                0,
                0));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.INSTAGRAM, IntegrationSnapshotType.POSTS))
                .thenReturn(Optional.empty());
        when(mediaService.getPostsPreview(companyId, 12)).thenReturn(preview);

        List<PostRow> result = service.getPosts(companyId, 12);

        assertThat(result).isEqualTo(preview);
        verify(mediaService).getPostsPreview(companyId, 12);
        verify(mediaService, never()).getPosts(companyId, 12);
    }

    @Test
    void syncMediaSnapshotsNow_persistsReelsAndPostsWithSeparateSnapshotTypes() {
        UUID companyId = UUID.randomUUID();
        Company company = Company.builder().id(companyId).name("Client").build();
        List<ReelRow> reels = List.of(new ReelRow(
                "reel-1",
                "Reel",
                "https://example.com/reel.jpg",
                "https://instagram.com/reel/1",
                "2026-07-08T09:00:00+0000",
                10,
                2,
                400,
                220,
                3,
                4));
        List<PostRow> posts = List.of(new PostRow(
                "post-1",
                "Post",
                "IMAGE",
                "https://example.com/post.jpg",
                "https://instagram.com/p/1",
                "2026-07-08T09:00:00+0000",
                8,
                1,
                120,
                90,
                2,
                1));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.INSTAGRAM, IntegrationSnapshotType.REELS))
                .thenReturn(Optional.empty());
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.INSTAGRAM, IntegrationSnapshotType.POSTS))
                .thenReturn(Optional.empty());
        when(mediaService.getReels(companyId, 24)).thenReturn(reels);
        when(mediaService.getPosts(companyId, 24)).thenReturn(posts);

        service.syncMediaSnapshotsNow(companyId, true);

        ArgumentCaptor<IntegrationSnapshotType> typeCaptor =
                ArgumentCaptor.forClass(IntegrationSnapshotType.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> payloadCaptor = ArgumentCaptor.forClass(Map.class);
        verify(persistenceService, times(2)).saveReady(
                eq(company),
                eq(IntegrationType.INSTAGRAM),
                typeCaptor.capture(),
                payloadCaptor.capture(),
                any(),
                any(),
                any());
        assertThat(typeCaptor.getAllValues())
                .containsExactlyInAnyOrder(IntegrationSnapshotType.REELS, IntegrationSnapshotType.POSTS);
        assertThat(payloadCaptor.getAllValues())
                .allSatisfy(payload -> assertThat(payload).containsKey("items"));
    }
}
