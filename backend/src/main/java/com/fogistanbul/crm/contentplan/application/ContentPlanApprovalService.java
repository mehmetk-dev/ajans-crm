package com.fogistanbul.crm.contentplan.application;

import com.fogistanbul.crm.contentplan.dto.ContentPlanResponse;
import com.fogistanbul.crm.contentplan.dto.ReviewApprovalRequest;
import com.fogistanbul.crm.entity.ContentPlan;
import com.fogistanbul.crm.entity.Shoot;
import com.fogistanbul.crm.shoot.application.ShootService;
import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentPlanApprovalService {

    private final ContentPlanService contentPlanService;
    private final ContentPlanMapper mapper;
    private final ShootService shootService;

    @Transactional
    public ContentPlanResponse approveExisting(
            UUID planId, UUID companyId, UUID shootId, UUID reviewerId
    ) {
        return approveExisting(planId, companyId, shootId, reviewerId, true);
    }

    @Transactional
    public ContentPlanResponse approveExistingClient(
            UUID planId, UUID companyId, UUID shootId, UUID userId
    ) {
        return approveExisting(planId, companyId, shootId, userId, false);
    }

    private ContentPlanResponse approveExisting(
            UUID planId, UUID companyId, UUID shootId, UUID userId, boolean manage
    ) {
        ContentPlan plan = contentPlanService.getPlanForApproval(planId, companyId, userId, manage);
        Shoot shoot = shootService.getShootForCompany(shootId, companyId, userId);
        plan.setShoot(shoot);
        contentPlanService.markApproved(plan);
        return mapper.toResponse(plan);
    }

    @Transactional
    public ContentPlanResponse approveNew(
            UUID planId,
            UUID companyId,
            UUID reviewerId,
            ContentApprovalMetadata.Details details,
            ReviewApprovalRequest review
    ) {
        return approveNew(planId, companyId, reviewerId, details, review, true);
    }

    @Transactional
    public ContentPlanResponse approveNewClient(
            UUID planId,
            UUID companyId,
            UUID userId,
            ContentApprovalMetadata.Details details
    ) {
        return approveNew(planId, companyId, userId, details, null, false);
    }

    private ContentPlanResponse approveNew(
            UUID planId,
            UUID companyId,
            UUID userId,
            ContentApprovalMetadata.Details details,
            ReviewApprovalRequest review,
            boolean manage
    ) {
        if (details.shootTitle() == null || details.shootTitle().isBlank()) {
            throw new IllegalArgumentException("Yeni cekim icin baslik zorunludur");
        }
        ContentPlan plan = contentPlanService.getPlanForApproval(planId, companyId, userId, manage);
        CreateShootRequest request = new CreateShootRequest();
        request.setCompanyId(companyId);
        request.setTitle(details.shootTitle());
        request.setDescription(details.shootDescription());
        request.setShootDate(parseDate(details.shootDate()));
        request.setShootTime(parseTime(details.shootTime()));
        request.setLocation(details.location());
        if (review != null) {
            request.setPhotographerId(review.getPhotographerId());
            request.setNotes(review.getNotes());
            request.setEquipment(review.getEquipment());
        }

        ShootResponse created = shootService.createShoot(request, userId);
        plan.setShoot(shootService.getShootForCompany(created.getId(), companyId, userId));
        contentPlanService.markApproved(plan);
        return mapper.toResponse(plan);
    }

    @Transactional
    public void reject(UUID planId, UUID companyId, UUID reviewerId, String note) {
        ContentPlan plan = contentPlanService.getPlanForApproval(planId, companyId, reviewerId, true);
        contentPlanService.markRevision(plan, note);
    }

    private Instant parseDate(String value) {
        return value == null || value.isBlank()
                ? null
                : LocalDate.parse(value).atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private LocalTime parseTime(String value) {
        return value == null || value.isBlank() ? null : LocalTime.parse(value);
    }
}
