package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShootServiceTest {

    @Mock
    private ShootRepository shootRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private CompanyMembershipRepository membershipRepository;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ShootAccessPolicy accessPolicy;
    @Mock
    private ShootResourceService resourceService;
    @Mock
    private ShootMapper mapper;

    @InjectMocks
    private ShootService shootService;

    @Test
    void clientListUsesAllProductionCompanies() {
        UUID userId = UUID.randomUUID();
        List<UUID> companyIds = List.of(UUID.randomUUID(), UUID.randomUUID());
        PageRequest pageable = PageRequest.of(0, 20);
        when(accessPolicy.accessibleClientCompanyIds(userId)).thenReturn(companyIds);
        when(shootRepository.findByCompanyIdIn(companyIds, pageable))
                .thenReturn(new PageImpl<>(List.of(Shoot.builder().id(UUID.randomUUID()).build())));

        Page<?> result = shootService.getClientShoots(pageable, userId);

        assertEquals(1, result.getTotalElements());
        verify(shootRepository).findByCompanyIdIn(companyIds, pageable);
    }

    @Test
    void linkedShootMustBelongToRequestedCompany() {
        UUID shootId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        UUID actualCompanyId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        Shoot shoot = Shoot.builder()
                .id(shootId)
                .company(Company.builder().id(actualCompanyId).build())
                .build();
        when(shootRepository.findById(shootId)).thenReturn(Optional.of(shoot));
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () ->
                shootService.getShootForCompany(shootId, UUID.randomUUID(), userId));
    }
}
