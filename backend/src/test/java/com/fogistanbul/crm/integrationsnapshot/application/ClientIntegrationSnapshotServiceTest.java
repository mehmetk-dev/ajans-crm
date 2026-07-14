package com.fogistanbul.crm.integrationsnapshot.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fogistanbul.crm.company.application.CompanyAccessPolicy;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.CompanyService;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshot;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotType;
import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationType;
import com.fogistanbul.crm.integrationsnapshot.infrastructure.IntegrationSnapshotRepository;
import com.fogistanbul.crm.repository.CompanyServiceRepository;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static java.util.Map.entry;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientIntegrationSnapshotServiceTest {

    @Mock
    IntegrationSnapshotRepository repository;

    @Mock
    CompanyAccessPolicy accessPolicy;

    @Mock
    CompanyServiceRepository companyServiceRepository;

    @Mock
    IntegrationSnapshotSyncService syncService;

    ClientIntegrationSnapshotService service;

    @BeforeEach
    void setUp() {
        service = new ClientIntegrationSnapshotService(
                repository, accessPolicy, companyServiceRepository, syncService, new ObjectMapper());
    }

    @Test
    void getOverview_returnsStoredPayloadsWithoutLiveIntegrationCalls() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        Instant syncedAt = Instant.parse("2026-07-01T09:30:00Z");
        Company company = Company.builder().id(companyId).name("Client").build();

        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.of(activeService()));
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.empty());
        when(repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.GOOGLE_ANALYTICS, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(snapshot(
                        company,
                        IntegrationType.GOOGLE_ANALYTICS,
                        syncedAt,
                        Map.ofEntries(
                                entry("connected", true),
                                entry("propertyId", "properties/123"),
                                entry("sessions", 42),
                                entry("totalUsers", 31),
                                entry("newUsers", 12),
                                entry("pageViews", 88),
                                entry("bounceRate", 35.5),
                                entry("avgSessionDuration", 44.2),
                                entry("dailyTrend", List.of()),
                                entry("trafficSources", List.of()),
                                entry("topPages", List.of()),
                                entry("topCountries", List.of())))));

        when(repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.SEARCH_CONSOLE, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(snapshot(
                        company,
                        IntegrationType.SEARCH_CONSOLE,
                        syncedAt,
                        Map.ofEntries(
                                entry("connected", true),
                                entry("siteUrl", "https://example.com/"),
                                entry("totalClicks", 9),
                                entry("totalImpressions", 120),
                                entry("avgCtr", 7.5),
                                entry("avgPosition", 4.1),
                                entry("dailyTrend", List.of()),
                                entry("topQueries", List.of()),
                                entry("topPages", List.of()),
                                entry("devices", List.of()),
                                entry("countries", List.of())))));

        var result = service.getOverview(userId, companyId);

        verify(accessPolicy).requireMembership(userId, companyId);
        assertThat(result.ga().totalUsers()).isEqualTo(31);
        assertThat(result.gaSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.READY);
        assertThat(result.gaSnapshot().lastSyncedAt()).isEqualTo(syncedAt);
        assertThat(result.sc().totalClicks()).isEqualTo(9);
        assertThat(result.ig()).isEqualTo(InstagramOverviewResponse.disabled());
        assertThat(result.igSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.PENDING);
    }

    @Test
    void getOverview_keepsLastSuccessfulPayloadWhenSnapshotStatusFailed() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        Instant syncedAt = Instant.parse("2026-07-01T08:00:00Z");

        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.empty());
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(activeService()));
        when(repository.findByCompanyIdAndIntegrationTypeAndSnapshotType(
                companyId, IntegrationType.INSTAGRAM, IntegrationSnapshotType.OVERVIEW))
                .thenReturn(Optional.of(IntegrationSnapshot.builder()
                        .company(Company.builder().id(companyId).name("Client").build())
                        .integrationType(IntegrationType.INSTAGRAM)
                        .snapshotType(IntegrationSnapshotType.OVERVIEW)
                        .status(IntegrationSnapshotStatus.FAILED)
                        .periodStart(LocalDate.parse("2026-06-01"))
                        .periodEnd(LocalDate.parse("2026-07-01"))
                        .payload(Map.ofEntries(
                                entry("connected", true),
                                entry("username", "fogistanbul"),
                                entry("followersCount", 1200),
                                entry("followsCount", 100),
                                entry("mediaCount", 55),
                                entry("impressions", 5000),
                                entry("reach", 3200),
                                entry("profileViews", 140),
                                entry("websiteClicks", 22),
                                entry("totalLikes", 450),
                                entry("totalComments", 37),
                                entry("followersGained", 18),
                                entry("followersLost", 3),
                                entry("dailyTrend", List.of()),
                                entry("recentMedia", List.of())))
                        .lastSyncedAt(syncedAt)
                        .nextSyncAt(Instant.parse("2026-07-01T08:30:00Z"))
                        .errorMessage("rate limited")
                        .build()));

        var result = service.getOverview(userId, companyId);

        assertThat(result.ig().followersCount()).isEqualTo(1200);
        assertThat(result.igSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.FAILED);
        assertThat(result.igSnapshot().errorMessage()).isEqualTo("rate limited");
        assertThat(result.ga()).isEqualTo(GaOverviewResponse.disabled());
        assertThat(result.sc()).isEqualTo(ScOverviewResponse.disabled());
    }

    @Test
    void getOverview_hidesStoredPayloadsForInactiveServices() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.DIGITAL_MARKETING))
                .thenReturn(Optional.empty());
        when(companyServiceRepository.findByCompanyIdAndServiceCategory(
                companyId, ServiceCategory.SOCIAL_MEDIA))
                .thenReturn(Optional.of(inactiveService()));

        var result = service.getOverview(userId, companyId);

        assertThat(result.ga()).isEqualTo(GaOverviewResponse.disabled());
        assertThat(result.sc()).isEqualTo(ScOverviewResponse.disabled());
        assertThat(result.ig()).isEqualTo(InstagramOverviewResponse.disabled());
        assertThat(result.gaSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.PENDING);
        assertThat(result.scSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.PENDING);
        assertThat(result.igSnapshot().status()).isEqualTo(IntegrationSnapshotStatus.PENDING);
    }

    @Test
    void refreshOverview_requiresMembershipAndForcesSync() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        service.refreshOverview(userId, companyId);

        verify(accessPolicy).requireMembership(userId, companyId);
        verify(syncService).syncOverviewSnapshotsNow(companyId);
    }

    @Test
    void refreshSearchConsole_requiresMembershipAndOnlyForcesSearchConsoleSync() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        service.refreshSearchConsole(userId, companyId);

        verify(accessPolicy).requireMembership(userId, companyId);
        verify(syncService).syncSearchConsoleSnapshotNow(companyId);
    }

    private IntegrationSnapshot snapshot(
            Company company,
            IntegrationType integrationType,
            Instant syncedAt,
            Map<String, Object> payload) {
        return IntegrationSnapshot.builder()
                .company(company)
                .integrationType(integrationType)
                .snapshotType(IntegrationSnapshotType.OVERVIEW)
                .status(IntegrationSnapshotStatus.READY)
                .periodStart(LocalDate.parse("2026-06-01"))
                .periodEnd(LocalDate.parse("2026-07-01"))
                .payload(payload)
                .lastSyncedAt(syncedAt)
                .nextSyncAt(Instant.parse("2026-07-01T10:30:00Z"))
                .build();
    }

    private CompanyService activeService() {
        return CompanyService.builder()
                .active(true)
                .build();
    }

    private CompanyService inactiveService() {
        return CompanyService.builder()
                .active(false)
                .build();
    }
}
