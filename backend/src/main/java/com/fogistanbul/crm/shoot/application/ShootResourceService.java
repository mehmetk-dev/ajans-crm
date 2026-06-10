package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.ShootEquipment;
import com.fogistanbul.crm.entity.ShootParticipant;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.ShootEquipmentRepository;
import com.fogistanbul.crm.repository.ShootParticipantRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShootResourceService {

    private final UserProfileRepository userProfileRepository;
    private final ShootParticipantRepository participantRepository;
    private final ShootEquipmentRepository equipmentRepository;
    private final ShootAccessPolicy accessPolicy;

    public UserProfile resolvePhotographer(UUID photographerId, UUID companyId) {
        if (photographerId == null) {
            return null;
        }
        UserProfile photographer = getUserOrThrow(photographerId);
        accessPolicy.requireResourceAccess(photographer, companyId);
        return photographer;
    }

    public void saveParticipants(
            Shoot shoot,
            List<CreateShootRequest.ShootParticipantRequest> requests
    ) {
        if (requests == null) {
            return;
        }
        var distinct = new LinkedHashMap<UUID, CreateShootRequest.ShootParticipantRequest>();
        requests.forEach(request -> distinct.putIfAbsent(request.getUserId(), request));
        distinct.values().forEach(request -> {
            UserProfile user = getUserOrThrow(request.getUserId());
            accessPolicy.requireResourceAccess(user, shoot.getCompany().getId());
            participantRepository.save(ShootParticipant.builder()
                    .shoot(shoot)
                    .user(user)
                    .roleInShoot(request.getRoleInShoot())
                    .build());
        });
    }

    public void saveEquipment(Shoot shoot, List<CreateShootRequest.EquipmentRequest> requests) {
        if (requests == null) {
            return;
        }
        requests.forEach(request -> equipmentRepository.save(ShootEquipment.builder()
                .shoot(shoot)
                .name(request.getName().trim())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .notes(request.getNotes())
                .build()));
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));
    }
}
