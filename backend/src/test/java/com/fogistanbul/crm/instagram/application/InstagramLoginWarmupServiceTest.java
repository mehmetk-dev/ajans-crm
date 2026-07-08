package com.fogistanbul.crm.instagram.application;

import com.fogistanbul.crm.entity.CompanyService;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramLoginWarmupServiceTest {

    @Mock
    CompanyServiceRepository companyServiceRepository;

    @Mock
    InstagramOAuthService instagramOAuthService;

    @Mock
    InstagramMediaSnapshotService mediaSnapshotService;

    InstagramLoginWarmupService service;

    @BeforeEach
    void setUp() {
        service = new InstagramLoginWarmupService(
                companyServiceRepository,
                instagramOAuthService,
                mediaSnapshotService);
    }

    @Test
    void warmUpCompany_syncsOnlyWhenSocialMediaIsActiveAndInstagramIsConnected() {
        UUID companyId = UUID.randomUUID();
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(CompanyService.builder().active(true).build()));
        when(instagramOAuthService.isConnected(companyId)).thenReturn(true);

        service.warmUpCompany(companyId);

        verify(mediaSnapshotService).syncMediaSnapshotsNow(companyId, false);
    }

    @Test
    void warmUpCompany_skipsWhenSocialMediaIsInactive() {
        UUID companyId = UUID.randomUUID();
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(CompanyService.builder().active(false).build()));

        service.warmUpCompany(companyId);

        verify(instagramOAuthService, never()).isConnected(companyId);
        verify(mediaSnapshotService, never()).syncMediaSnapshotsNow(companyId, false);
    }

    @Test
    void warmUpCompany_skipsWhenInstagramIsNotConnected() {
        UUID companyId = UUID.randomUUID();
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(CompanyService.builder().active(true).build()));
        when(instagramOAuthService.isConnected(companyId)).thenReturn(false);

        service.warmUpCompany(companyId);

        verify(mediaSnapshotService, never()).syncMediaSnapshotsNow(companyId, false);
    }
}
