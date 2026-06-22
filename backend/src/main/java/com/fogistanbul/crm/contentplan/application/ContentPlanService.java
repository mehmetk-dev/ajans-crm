package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ContentPlanResponse;
import com.fogistanbul.crm.contentplan.dto.CreateContentPlanRequest;
import com.fogistanbul.crm.contentplan.dto.UpdateContentPlanRequest;
import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.ContentStatus;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.NotificationType;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.repository.ContentPlanRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.NotificationService;
import com.fogistanbul.crm.shoot.application.ShootService;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentPlanService {

    private final ContentPlanRepository contentPlanRepository;
    private final CompanyRepository companyRepository;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;
    private final NotificationService notificationService;
    private final ShootService shootService;
    private final ContentPlanAccessPolicy accessPolicy;
    private final ContentPlanWorkflowPolicy workflowPolicy;
    private final ContentPlanMapper mapper;

    @Transactional
    public ContentPlanResponse create(CreateContentPlanRequest request, UUID userId) {
        UserProfile creator = getUserOrThrow(userId);
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Şirket bulunamadı"));
        accessPolicy.requireCompanyAccess(creator, company.getId());

        ContentPlan plan = contentPlanRepository.save(ContentPlan.builder()
                .company(company)
                .createdBy(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .authorName(request.getAuthorName())
                .platform(request.getPlatform())
                .contentSize(request.getContentSize())
                .direction(request.getDirection())
                .speakerModel(request.getSpeakerModel())
                .status(ContentStatus.DRAFT)
                .plannedDate(parseDate(request.getPlannedDate()))
                .build());

        notifyCompanyMembers(company.getId(), userId, NotificationType.CONTENT_PLAN_CREATED,
                "Yeni içerik planı: " + plan.getTitle(),
                "Platform: " + plan.getPlatform().name(), plan.getId());
        return mapper.toResponse(plan);
    }

    @Transactional
    public ContentPlanResponse update(UUID planId, UpdateContentPlanRequest request, UUID userId) {
        ContentPlan plan = getPlanOrThrow(planId);
        accessPolicy.requireManage(plan, getUserOrThrow(userId));
        ContentStatus oldStatus = plan.getStatus();

        if (request.getTitle() != null) plan.setTitle(requireText(request.getTitle(), "Baslik"));
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getAuthorName() != null) plan.setAuthorName(requireText(request.getAuthorName(), "Yazar"));
        if (request.getPlatform() != null) plan.setPlatform(request.getPlatform());
        if (request.getContentSize() != null) plan.setContentSize(request.getContentSize());
        if (request.getDirection() != null) plan.setDirection(request.getDirection());
        if (request.getSpeakerModel() != null) plan.setSpeakerModel(request.getSpeakerModel());
        if (request.getPlannedDate() != null) plan.setPlannedDate(parseDate(request.getPlannedDate()));
        if (request.getStatus() != null) {
            workflowPolicy.requireStatusChange(plan, request.getStatus());
            plan.setStatus(request.getStatus());
        }
        if (request.getRevisionNote() != null) plan.setRevisionNote(request.getRevisionNote());

        ContentPlan saved = contentPlanRepository.save(plan);
        if (oldStatus != saved.getStatus()) {
            notifyStatusChange(saved, userId);
        }
        return mapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ContentPlanResponse> getAll(int page, int size, UUID userId) {
        Pageable pageable = PageRequest.of(page, size);
        UserProfile user = getUserOrThrow(userId);
        Page<ContentPlan> plans;
        if (user.getGlobalRole() == GlobalRole.ADMIN) {
            plans = contentPlanRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else {
            List<UUID> companyIds = accessPolicy.accessibleCompanyIds(user);
            plans = companyIds.isEmpty()
                    ? Page.empty(pageable)
                    : contentPlanRepository.findByCompanyIdInOrderByCreatedAtDesc(companyIds, pageable);
        }
        return plans.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<ContentPlanResponse> getByCompany(
            UUID companyId, String status, int page, int size, UUID userId, boolean client
    ) {
        UserProfile user = getUserOrThrow(userId);
        if (client) {
            accessPolicy.requireClientService(userId, companyId);
        } else {
            accessPolicy.requireCompanyAccess(user, companyId);
        }
        Pageable pageable = PageRequest.of(page, size);
        Page<ContentPlan> plans = status != null && !status.isBlank()
                ? contentPlanRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(
                        companyId, ContentStatus.valueOf(status), pageable)
                : contentPlanRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        return plans.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ContentPlanResponse getById(UUID planId, UUID userId, boolean client) {
        ContentPlan plan = getPlanOrThrow(planId);
        if (client) {
            accessPolicy.requireClientService(userId, plan.getCompany().getId());
        } else {
            accessPolicy.requireRead(plan, getUserOrThrow(userId));
        }
        return mapper.toResponse(plan);
    }

    @Transactional(readOnly = true)
    public List<ContentPlanResponse> getByShoot(UUID shootId, UUID userId, boolean client) {
        ShootResponse shoot = client
                ? shootService.getShootById(shootId, userId)
                : shootService.getShootById(shootId, userId);
        if (client) {
            accessPolicy.requireClientService(userId, shoot.getCompanyId());
        }
        return contentPlanRepository.findByShootId(shootId).stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public void delete(UUID planId, UUID userId) {
        ContentPlan plan = getPlanOrThrow(planId);
        accessPolicy.requireManage(plan, getUserOrThrow(userId));
        contentPlanRepository.delete(plan);
    }

    @Transactional
    public ContentPlanResponse requestClientRevision(UUID planId, String note, UUID userId) {
        ContentPlan plan = getPlanOrThrow(planId);
        accessPolicy.requireClientService(userId, plan.getCompany().getId());
        workflowPolicy.requireStatusChange(plan, ContentStatus.REVISION);
        plan.setStatus(ContentStatus.REVISION);
        plan.setRevisionNote(requireText(note, "Revize notu"));
        return mapper.toResponse(contentPlanRepository.save(plan));
    }

    ContentPlan getPlanForApproval(UUID planId, UUID companyId, UUID userId, boolean manage) {
        ContentPlan plan = getPlanOrThrow(planId);
        if (!plan.getCompany().getId().equals(companyId)) {
            throw new IllegalArgumentException("İçerik planı ve şirket eşleşmiyor");
        }
        if (manage) {
            accessPolicy.requireManage(plan, getUserOrThrow(userId));
        } else {
            accessPolicy.requireClientService(userId, companyId);
        }
        return plan;
    }

    void markApproved(ContentPlan plan) {
        workflowPolicy.requireApprovalResolution(plan, ContentStatus.APPROVED);
        plan.setStatus(ContentStatus.APPROVED);
        plan.setRevisionNote(null);
        contentPlanRepository.save(plan);
    }

    void markRevision(ContentPlan plan, String note) {
        workflowPolicy.requireApprovalResolution(plan, ContentStatus.REVISION);
        plan.setStatus(ContentStatus.REVISION);
        plan.setRevisionNote(note);
        contentPlanRepository.save(plan);
    }

    private ContentPlan getPlanOrThrow(UUID planId) {
        return contentPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("İçerik planı bulunamadı"));
    }

    private UserProfile getUserOrThrow(UUID userId) {
        return userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
    }

    private LocalDate parseDate(String value) {
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    private String requireText(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(field + " bos olamaz");
        }
        return value.trim();
    }


    private void notifyStatusChange(ContentPlan plan, UUID userId) {
        notifyCompanyMembers(plan.getCompany().getId(), userId, NotificationType.CONTENT_PLAN_UPDATED,
                "İçerik planı güncellendi: " + plan.getTitle(),
                "Durum: " + plan.getStatus().name(), plan.getId());
    }

    private void notifyCompanyMembers(
            UUID companyId, UUID excludedUserId, NotificationType type,
            String title, String message, UUID referenceId
    ) {
        membershipRepository.findCompanyUserIdsByCompanyId(companyId).stream()
                .filter(memberId -> !memberId.equals(excludedUserId))
                .forEach(memberId -> notificationService.send(
                        memberId, type, title, message, "CONTENT_PLAN", referenceId));
    }
}
