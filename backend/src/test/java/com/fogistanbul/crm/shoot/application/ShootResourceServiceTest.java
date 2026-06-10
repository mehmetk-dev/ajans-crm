package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.ShootEquipmentRepository;
import com.fogistanbul.crm.repository.ShootParticipantRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShootResourceServiceTest {

    @Mock
    private UserProfileRepository userProfileRepository;
    @Mock
    private ShootParticipantRepository participantRepository;
    @Mock
    private ShootEquipmentRepository equipmentRepository;
    @Mock
    private ShootAccessPolicy accessPolicy;

    @Test
    void photographerMustExistAndHaveCompanyAccess() {
        ShootResourceService service = service();
        UUID photographerId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile photographer = UserProfile.builder().id(photographerId).build();
        when(userProfileRepository.findById(photographerId)).thenReturn(Optional.of(photographer));

        assertEquals(photographer, service.resolvePhotographer(photographerId, companyId));
        verify(accessPolicy).requireResourceAccess(photographer, companyId);
    }

    @Test
    void duplicateParticipantsAreSavedOnce() {
        ShootResourceService service = service();
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        UserProfile user = UserProfile.builder().id(userId).build();
        Shoot shoot = Shoot.builder()
                .id(UUID.randomUUID())
                .company(Company.builder().id(companyId).build())
                .build();
        CreateShootRequest.ShootParticipantRequest first = participant(userId, "Kamera");
        CreateShootRequest.ShootParticipantRequest duplicate = participant(userId, "Ses");
        when(userProfileRepository.findById(userId)).thenReturn(Optional.of(user));

        service.saveParticipants(shoot, List.of(first, duplicate));

        verify(participantRepository).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void equipmentNameIsTrimmedAndQuantityDefaultsToOne() {
        ShootResourceService service = service();
        Shoot shoot = Shoot.builder().id(UUID.randomUUID()).build();
        CreateShootRequest.EquipmentRequest request = new CreateShootRequest.EquipmentRequest();
        request.setName("  Kamera  ");

        service.saveEquipment(shoot, List.of(request));

        ArgumentCaptor<com.fogistanbul.crm.entity.ShootEquipment> captor =
                ArgumentCaptor.forClass(com.fogistanbul.crm.entity.ShootEquipment.class);
        verify(equipmentRepository).save(captor.capture());
        assertEquals("Kamera", captor.getValue().getName());
        assertEquals(1, captor.getValue().getQuantity());
    }

    private ShootResourceService service() {
        return new ShootResourceService(
                userProfileRepository, participantRepository, equipmentRepository, accessPolicy);
    }

    private CreateShootRequest.ShootParticipantRequest participant(UUID userId, String role) {
        CreateShootRequest.ShootParticipantRequest request =
                new CreateShootRequest.ShootParticipantRequest();
        request.setUserId(userId);
        request.setRoleInShoot(role);
        return request;
    }
}
