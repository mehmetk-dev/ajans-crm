package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.repository.ContentPlanRepository;
import com.fogistanbul.crm.repository.ShootEquipmentRepository;
import com.fogistanbul.crm.repository.ShootParticipantRepository;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ShootMapper {

    private final ShootParticipantRepository participantRepository;
    private final ShootEquipmentRepository equipmentRepository;
    private final ContentPlanRepository contentPlanRepository;

    public ShootResponse toResponse(Shoot shoot) {
        var participants = participantRepository.findByShootId(shoot.getId());
        var equipment = equipmentRepository.findByShootId(shoot.getId());
        return ShootResponse.builder()
                .id(shoot.getId())
                .companyId(shoot.getCompany().getId())
                .companyName(shoot.getCompany().getName())
                .title(shoot.getTitle())
                .description(shoot.getDescription())
                .shootDate(shoot.getShootDate())
                .shootTime(shoot.getShootTime())
                .location(shoot.getLocation())
                .status(shoot.getStatus().name())
                .photographerId(shoot.getPhotographer() != null ? shoot.getPhotographer().getId() : null)
                .photographerName(shoot.getPhotographer() != null ? displayName(shoot.getPhotographer()) : null)
                .photographerAvatarUrl(shoot.getPhotographer() != null ? avatarUrl(shoot.getPhotographer()) : null)
                .notes(shoot.getNotes())
                .createdById(shoot.getCreatedBy().getId())
                .createdByName(displayName(shoot.getCreatedBy()))
                .participants(participants.stream().map(participant -> ShootResponse.ParticipantInfo.builder()
                        .userId(participant.getUser().getId())
                        .fullName(displayName(participant.getUser()))
                        .avatarUrl(avatarUrl(participant.getUser()))
                        .roleInShoot(participant.getRoleInShoot())
                        .build()).toList())
                .equipment(equipment.stream().map(item -> ShootResponse.EquipmentInfo.builder()
                        .id(item.getId())
                        .name(item.getName())
                        .quantity(item.getQuantity())
                        .notes(item.getNotes())
                        .build()).toList())
                .linkedContentCount((int) contentPlanRepository.countByShootId(shoot.getId()))
                .createdAt(shoot.getCreatedAt())
                .build();
    }

    private String displayName(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getFullName() : user.getEmail();
    }

    private String avatarUrl(UserProfile user) {
        return user.getPerson() != null ? user.getPerson().getAvatarUrl() : null;
    }
}
