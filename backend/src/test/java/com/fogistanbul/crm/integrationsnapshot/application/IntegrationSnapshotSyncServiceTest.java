package com.fogistanbul.crm.integrationsnapshot.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyService;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.googleanalytics.application.GoogleAnalyticsService;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.instagram.application.InstagramMediaSnapshotService;
import com.fogistanbul.crm.instagram.application.InstagramOverviewService;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static java.util.Map.entry;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IntegrationSnapshotSyncServiceTest {

    @Mock
    IntegrationSnapshotRepository snapshotRepository;

    @Mock
    CompanyRepository companyRepository;

    @Mock
    CompanyServiceRepository companyServiceRepository;

    @Mock
    GoogleAnalyticsService googleAnalyticsService;

    @Mock
    SearchConsoleService searchConsoleService;

    @Mock
    InstagramOverviewService instagramOverviewService;

    @Mock
    InstagramMediaSnapshotService instagramMediaSnapshotService;

    IntegrationSnapshotSyncService service;

    @BeforeEach
    void setUp() {
        service = new IntegrationSnapshotSyncService(
                snapshotRepository,
                companyRepository,
                companyServiceRepository,
                googleAnalyticsService,
                searchConsoleService,
                instagramOverviewService,
                instagramMediaSnapshotService,
                new ObjectMapper());
    }

    @Test
    void syncDueOverviewSnapshots_skipsExternalCallWhenSnapshotIsNotDue() {
        Company company = company();
        when(companyRepository.findByKind(CompanyKind.CLIENT)).thenReturn(List.of(company));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.of(activeService()));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.empty());
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.GOOGLE_ANALYTICS, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(IntegrationSnapshot.builder()
                        .company(company)
                        .integrationType(IntegrationType.GOOGLE_ANALYTICS)
                        .snapshotType(IntegrationSnapshotType.OVERVIEW)
                        .status(IntegrationSnapshotStatus.READY)
                        .nextSyncAt(Instant.now().plusSeconds(3600))
                        .build()));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.SEARCH_CONSOLE, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(IntegrationSnapshot.builder()
                        .company(company)
                        .integrationType(IntegrationType.SEARCH_CONSOLE)
                        .snapshotType(IntegrationSnapshotType.OVERVIEW)
                        .status(IntegrationSnapshotStatus.READY)
                        .nextSyncAt(Instant.now().plusSeconds(3600))
                        .build()));

        service.syncDueOverviewSnapshots();

        verifyNoInteractions(googleAnalyticsService, searchConsoleService, instagramOverviewService);
        verify(snapshotRepository, never()).save(any());
    }

    @Test
    void syncDueOverviewSnapshots_preservesPayloadWhenFetchReturnsError() {
        Company company = company();
        Map<String, Object> previousPayload = Map.ofEntries(
                entry("connected", true),
                entry("propertyId", "properties/123"),
                entry("sessions", 10),
                entry("totalUsers", 8),
                entry("newUsers", 4),
                entry("pageViews", 20),
                entry("bounceRate", 35.0),
                entry("avgSessionDuration", 44.0),
                entry("dailyTrend", List.of()),
                entry("trafficSources", List.of()),
                entry("topPages", List.of()),
                entry("topCountries", List.of()));
        IntegrationSnapshot previous = IntegrationSnapshot.builder()
                .company(company)
                .integrationType(IntegrationType.GOOGLE_ANALYTICS)
                .snapshotType(IntegrationSnapshotType.OVERVIEW)
                .status(IntegrationSnapshotStatus.READY)
                .payload(previousPayload)
                .lastSyncedAt(Instant.parse("2026-07-01T08:00:00Z"))
                .nextSyncAt(Instant.now().minusSeconds(60))
                .build();

        when(companyRepository.findByKind(CompanyKind.CLIENT)).thenReturn(List.of(company));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.of(activeService()));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.empty());
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.GOOGLE_ANALYTICS, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(previous));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.SEARCH_CONSOLE, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(IntegrationSnapshot.builder()
                        .company(company)
                        .integrationType(IntegrationType.SEARCH_CONSOLE)
                        .snapshotType(IntegrationSnapshotType.OVERVIEW)
                        .status(IntegrationSnapshotStatus.READY)
                        .nextSyncAt(Instant.now().plusSeconds(3600))
                        .build()));
        when(googleAnalyticsService.getOverview(company.getId(), null, null))
                .thenReturn(GaOverviewResponse.error("properties/123", "rate limited"));

        service.syncDueOverviewSnapshots();

        ArgumentCaptor<IntegrationSnapshot> captor = ArgumentCaptor.forClass(IntegrationSnapshot.class);
        verify(snapshotRepository).save(captor.capture());
        IntegrationSnapshot saved = captor.getValue();
        assertThat(saved).isSameAs(previous);
        assertThat(saved.getStatus()).isEqualTo(IntegrationSnapshotStatus.FAILED);
        assertThat(saved.getPayload()).isEqualTo(previousPayload);
        assertThat(saved.getLastSyncedAt()).isEqualTo(Instant.parse("2026-07-01T08:00:00Z"));
        assertThat(saved.getErrorMessage()).isEqualTo("rate limited");
        assertThat(saved.getNextSyncAt()).isAfter(Instant.now());
    }

    @Test
    void syncOverviewSnapshotsNow_refreshesSnapshotEvenWhenItIsNotDue() {
        Company company = company();
        IntegrationSnapshot previous = IntegrationSnapshot.builder()
                .company(company)
                .integrationType(IntegrationType.GOOGLE_ANALYTICS)
                .snapshotType(IntegrationSnapshotType.OVERVIEW)
                .status(IntegrationSnapshotStatus.READY)
                .nextSyncAt(Instant.now().plusSeconds(3600))
                .build();

        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.of(activeService()));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.empty());
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.GOOGLE_ANALYTICS, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(previous));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.SEARCH_CONSOLE, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.empty());
        when(googleAnalyticsService.getOverview(company.getId(), null, null))
                .thenReturn(GaOverviewResponse.disabled());
        when(searchConsoleService.getOverview(company.getId(), null, null))
                .thenReturn(com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse.disabled());

        service.syncOverviewSnapshotsNow(company.getId());

        verify(googleAnalyticsService).getOverview(company.getId(), null, null);
        verify(searchConsoleService).getOverview(company.getId(), null, null);
        verify(snapshotRepository, org.mockito.Mockito.times(2)).save(any());
    }

    @Test
    void syncOverviewSnapshotsNow_refreshesInstagramMediaSnapshotsWhenSocialMediaIsActive() {
        Company company = company();

        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.empty());
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                company.getId(), ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(activeService()));
        when(snapshotRepository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                company.getId(), IntegrationType.INSTAGRAM, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.empty());
        when(instagramOverviewService.getOverview(company.getId(), null, null))
                .thenReturn(com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse.disabled());

        service.syncOverviewSnapshotsNow(company.getId());

        verify(instagramOverviewService).getOverview(company.getId(), null, null);
        verify(instagramMediaSnapshotService).syncMediaSnapshotsNow(company.getId(), true);
    }

    private Company company() {
        return Company.builder()
                .id(UUID.randomUUID())
                .kind(CompanyKind.CLIENT)
                .name("Client")
                .build();
    }

    private CompanyService activeService() {
        return CompanyService.builder()
                .active(true)
                .build();
    }
}
