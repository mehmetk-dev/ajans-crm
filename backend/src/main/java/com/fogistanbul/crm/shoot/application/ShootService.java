package com.fogistanbul.crm.shoot.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.entity.enums.ShootStatus;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.ShootRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ShootService {

    private final ShootRepository shootRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final NotificationService notificationService;
    private final ShootAccessPolicy accessPolicy;
    private final ShootResourceService resourceService;
    private final ShootMapper mapper;

    @Transactional
    public ShootResponse createShoot(CreateShootRequest request, UUID createdById) {
        UserProfile creator = getUserOrThrow(createdById);
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));
        accessPolicy.requireCompanyAccess(creator, company.getId());

        Shoot shoot = shootRepository.save(Shoot.builder()
                .company(company)
                .title(request.getTitle())
                .description(request.getDescription())
                .shootDate(request.getShootDate())
                .shootTime(request.getShootTime())
                .location(request.getLocation())
                .notes(request.getNotes())
                .photographer(resourceService.resolvePhotographer(request.getPhotographerId(), company.getId()))
                .createdBy(creator)
                .build());

        resourceService.saveParticipants(shoot, request.getParticipants());
        resourceService.saveEquipment(shoot, request.getEquipment());
        notifyCompanyMembers(company.getId(), createdById, NotificationType.SHOOT_CREATED,
                "Yeni çekim planlandı: " + shoot.getTitle(),
                shoot.getShootDate() != null ? "Tarih: " + shoot.getShootDate().toString().substring(0, 10) : null,
                shoot.getId());
        log.info("Shoot created: {} for company {}", shoot.getTitle(), company.getName());
        return mapper.toResponse(shoot);
    }

    @Transactional(readOnly = true)
    public Page<ShootResponse> getAllShoots(Pageable pageable, UUID userId) {
        UserProfile user = getUserOrThrow(userId);
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            return shootRepository.findAll(pageable).map(mapper::toResponse);
        }
        List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
        return companyIds.isEmpty()
                ? Page.empty(pageable)
                : shootRepository.findByCompanyIdIn(companyIds, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShootResponse> getClientShoots(Pageable pageable, UUID userId) {
        List<UUID> companyIds = accessPolicy.accessibleClientCompanyIds(userId);
        return companyIds.isEmpty()
                ? Page.empty(pageable)
                : shootRepository.findByCompanyIdIn(companyIds, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ShootResponse> getShootsByCompany(UUID companyId, Pageable pageable, UUID userId) {
        accessPolicy.requireCompanyAccess(getUserOrThrow(userId), companyId);
        return shootRepository.findByCompanyId(companyId, pageable).map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ShootResponse getShootById(UUID shootId, UUID userId) {
        Shoot shoot = getShootOrThrow(shootId);
        accessPolicy.requireRead(shoot, getUserOrThrow(userId));
        return mapper.toResponse(shoot);
    }

    @Transactional(readOnly = true)
    public Shoot getShootForCompany(UUID shootId, UUID companyId, UUID userId) {
        Shoot shoot = getShootOrThrow(shootId);
        accessPolicy.requireRead(shoot, getUserOrThrow(userId));
        if (!shoot.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("Çekim ve içerik planı farklı şirketlere ait");
        }
        return shoot;
    }

    @Transactional
    public ShootResponse updateStatus(UUID shootId, ShootStatus status, UUID userId) {
        Shoot shoot = getShootOrThrow(shootId);
        accessPolicy.requireManage(shoot, getUserOrThrow(userId));
        ShootStatus oldStatus = shoot.getStatus();
        shoot.setStatus(status);
        shootRepository.save(shoot);
        if (oldStatus != status) {
            notifyCompanyMembers(shoot.getCompany().getId(), userId, NotificationType.SHOOT_UPDATED,
                    "Çekim " + statusLabel(status) + ": " + shoot.getTitle(), null, shoot.getId());
        }
        return mapper.toResponse(shoot);
    }

    @Transactional
    public void deleteShoot(UUID shootId, UUID userId) {
        Shoot shoot = getShootOrThrow(shootId);
        accessPolicy.requireDelete(shoot, getUserOrThrow(userId));
        shootRepository.delete(shoot);
    }

    private Shoot getShootOrThrow(UUID shootId) {
        return shootRepository.findById(shootId)
                .orElseThrow(() -> new RuntimeException("Çekim bulunamadı"));
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private String statusLabel(ShootStatus status) {
        return switch (status) {
            case COMPLETED -> "tamamlandı";
            case CANCELLED -> "iptal edildi";
            case PLANNED -> "planlandı";
        };
    }

    private void notifyCompanyMembers(
            UUID companyId,
            UUID excludeUserId,
            NotificationType type,
            String title,
            String message,
            UUID refId
    ) {
        membershipRepository.findCompanyUserIdsByCompanyId(companyId).stream()
                .filter(memberId -> !memberId.equals(excludeUserId))
                .forEach(memberId -> notificationService.send(
                        memberId, type, title, message, "SHOOT", refId));
    }
}
