package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.CompanyServicesManager;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClientActiveServicesServiceTest {

    @Mock
    private CompanyServicesManager companyServicesManager;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;

    @InjectMocks
    private ClientActiveServicesService service;

    @Test
    void agencyUsersCanSeeEveryServiceCategory() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(
                UserProfile.builder().id(userId).globalRole(GlobalRole.AGENCY_STAFF).build()
        ));

        List<String> result = service.getActiveServices(userId);

        assertEquals(Arrays.stream(ServiceCategory.values()).map(ServiceCategory::name).toList(), result);
        verifyNoInteractions(membershipRepository, companyServicesManager);
    }

    @Test
    void companyUsersWithoutClientMembershipSeeNoServices() {
        UUID userId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(
                UserProfile.builder().id(userId).globalRole(GlobalRole.COMPANY_USER).build()
        ));
        when(membershipRepository.findClientCompanyIdsForUser(userId)).thenReturn(List.of());

        assertEquals(List.of(), service.getActiveServices(userId));
        verifyNoInteractions(companyServicesManager);
    }

    @Test
    void companyUsersSeeTheirCompanyActiveServices() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(
                UserProfile.builder().id(userId).globalRole(GlobalRole.COMPANY_USER).build()
        ));
        when(membershipRepository.findClientCompanyIdsForUser(userId)).thenReturn(List.of(companyId));
        when(companyServicesManager.getActiveServiceCategories(companyId))
                .thenReturn(List.of(ServiceCategory.SOCIAL_MEDIA.name()));

        assertEquals(
                List.of(ServiceCategory.SOCIAL_MEDIA.name()),
                service.getActiveServices(userId)
        );
    }
}
