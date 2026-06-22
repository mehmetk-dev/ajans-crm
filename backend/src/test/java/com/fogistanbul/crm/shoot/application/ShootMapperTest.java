package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Person;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.ShootParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.ShootStatus;
import com.fogistanbul.crm.repository.ContentPlanRepository;
import com.fogistanbul.crm.repository.ShootEquipmentRepository;
import com.fogistanbul.crm.repository.ShootParticipantRepository;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ShootMapperTest {

    private final ShootParticipantRepository participantRepository = mock(ShootParticipantRepository.class);
    private final ShootEquipmentRepository equipmentRepository = mock(ShootEquipmentRepository.class);
    private final ContentPlanRepository contentPlanRepository = mock(ContentPlanRepository.class);
    private final ShootMapper mapper = new ShootMapper(
            participantRepository,
            equipmentRepository,
            contentPlanRepository
    );

    @Test
    void mapsPhotographerAndParticipantAvatarUrls() {
        UUID shootId = UUID.randomUUID();
        UserProfile photographer = user("photographer@test.com", "Merve Foto", "/api/settings/avatar/photographer.png");
        UserProfile participant = user("participant@test.com", "Ali Kamera", "/api/settings/avatar/participant.png");
        Shoot shoot = Shoot.builder()
                .id(shootId)
                .company(Company.builder().id(UUID.randomUUID()).name("Acme").build())
                .title("Ürün Çekimi")
                .shootDate(Instant.parse("2026-06-13T10:00:00Z"))
                .status(ShootStatus.PLANNED)
                .photographer(photographer)
                .createdBy(photographer)
                .build();

        when(participantRepository.findByShootId(shootId)).thenReturn(List.of(
                ShootParticipant.builder()
                        .user(participant)
                        .roleInShoot("Kamera")
                        .build()
        ));
        when(equipmentRepository.findByShootId(shootId)).thenReturn(List.of());
        when(contentPlanRepository.countByShootId(shootId)).thenReturn(0L);

        var response = mapper.toResponse(shoot);

        assertEquals("/api/settings/avatar/photographer.png", response.getPhotographerAvatarUrl());
        assertEquals("/api/settings/avatar/participant.png", response.getParticipants().get(0).getAvatarUrl());
    }

    private UserProfile user(String email, String fullName, String avatarUrl) {
        return UserProfile.builder()
                .id(UUID.randomUUID())
                .email(email)
                .person(Person.builder()
                        .fullName(fullName)
                        .avatarUrl(avatarUrl)
                        .build())
                .build();
    }
}
