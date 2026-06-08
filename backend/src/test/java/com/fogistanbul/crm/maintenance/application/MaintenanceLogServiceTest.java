package com.fogistanbul.crm.maintenance.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.maintenance.domain.MaintenanceLogEntry;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogRequest;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogResponse;
import com.fogistanbul.crm.maintenance.infrastructure.MaintenanceLogRepository;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceLogServiceTest {

    @Mock
    private MaintenanceLogRepository maintenanceLogRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private MaintenanceLogAccessPolicy accessPolicy;

    private MaintenanceLogService maintenanceLogService;

    @BeforeEach
    void setUp() {
        maintenanceLogService = new MaintenanceLogService(
                maintenanceLogRepository,
                companyRepository,
                userProfileRepository,
                membershipRepository,
                accessPolicy,
                new MaintenanceLogMapper()
        );
    }

    @Test
    void createNormalizesTextAndMapsAuthor() {
        UserProfile author = user();
        Company company = Company.builder().id(UUID.randomUUID()).build();
        MaintenanceLogRequest request = request("  SSL yenilendi  ", "  Aciklama  ");
        when(userProfileRepository.findById(author.getId())).thenReturn(Optional.of(author));
        when(companyRepository.findById(company.getId())).thenReturn(Optional.of(company));
        when(maintenanceLogRepository.save(any(MaintenanceLogEntry.class))).thenAnswer(invocation -> {
            MaintenanceLogEntry entry = invocation.getArgument(0);
            entry.setId(UUID.randomUUID());
            entry.setCreatedAt(Instant.now());
            return entry;
        });

        MaintenanceLogResponse response = maintenanceLogService.create(company.getId(), request, author.getId());

        assertEquals("SSL yenilendi", response.getTitle());
        assertEquals("Aciklama", response.getDescription());
        assertEquals("Test User", response.getPerformedByName());
        verify(accessPolicy).requireManageAccess(author, company.getId());
    }

    @Test
    void clientLogIncludesAllClientMemberships() {
        UserProfile client = user();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        when(userProfileRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(membershipRepository.findClientCompanyIdsForUser(client.getId())).thenReturn(companyIds);
        when(maintenanceLogRepository.findByCompanyIdInOrderByPerformedAtDesc(companyIds)).thenReturn(List.of());

        maintenanceLogService.listForClient(client.getId());

        verify(maintenanceLogRepository).findByCompanyIdInOrderByPerformedAtDesc(companyIds);
    }

    @Test
    void updateChecksRouteCompanyBeforeSaving() {
        UserProfile author = user();
        UUID companyId = UUID.randomUUID();
        MaintenanceLogEntry entry = MaintenanceLogEntry.builder()
                .id(UUID.randomUUID())
                .company(Company.builder().id(companyId).build())
                .performedBy(author)
                .build();
        when(userProfileRepository.findById(author.getId())).thenReturn(Optional.of(author));
        when(maintenanceLogRepository.findById(entry.getId())).thenReturn(Optional.of(entry));
        when(maintenanceLogRepository.save(entry)).thenReturn(entry);

        maintenanceLogService.update(companyId, entry.getId(), request("Guncel", null), author.getId());

        verify(accessPolicy).requireManageAccess(author, companyId);
        verify(accessPolicy).requireEntryCompany(entry, companyId);
    }

    private MaintenanceLogRequest request(String title, String description) {
        MaintenanceLogRequest request = new MaintenanceLogRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setCategory("update");
        request.setPerformedAt(Instant.now());
        return request;
    }

    private UserProfile user() {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .globalRole(GlobalRole.AGENCY_STAFF)
                .email("staff@example.com")
                .passwordHash("hash")
                .person(Person.builder().fullName("Test User").build())
                .build();
    }
}
