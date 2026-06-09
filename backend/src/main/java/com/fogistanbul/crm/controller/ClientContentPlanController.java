package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.ContentPlanResponse;
import com.fogistanbul.crm.dto.ApproveContentPlanRequest;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.ContentPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/content-plans")
@RequiredArgsConstructor
public class ClientContentPlanController {

    private final ContentPlanService contentPlanService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping
    public ResponseEntity<Page<ContentPlanResponse>> getByCompany(
            @RequestParam UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.CONTENT_MARKETING);
        return ResponseEntity.ok(contentPlanService.getByCompany(companyId, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentPlanResponse> getById(@PathVariable UUID id, Authentication auth) {
        ContentPlanResponse response = contentPlanService.getById(id);
        serviceAccessGuard.requireService(
                (UUID) auth.getPrincipal(),
                UUID.fromString(response.getCompanyId()),
                ServiceCategory.CONTENT_MARKETING);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/shoot/{shootId}")
    public ResponseEntity<List<ContentPlanResponse>> getByShoot(@PathVariable UUID shootId, Authentication auth) {
        List<ContentPlanResponse> responses = contentPlanService.getByShoot(shootId);
        if (!responses.isEmpty()) {
            serviceAccessGuard.requireService(
                    (UUID) auth.getPrincipal(),
                    UUID.fromString(responses.get(0).getCompanyId()),
                    ServiceCategory.CONTENT_MARKETING);
        }
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ContentPlanResponse> approveWithShoot(
            @PathVariable UUID id,
            @RequestBody ApproveContentPlanRequest req,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        serviceAccessGuard.requireService(userId, req.getCompanyId(), ServiceCategory.CONTENT_MARKETING);
        return ResponseEntity.ok(contentPlanService.approveWithShoot(
            id, userId, req.getCompanyId(), req.getShootTitle(),
            req.getShootDescription(), req.getShootDate(), req.getShootTime(), req.getLocation()
        ));
    }

    @PostMapping("/{id}/approve-existing")
    public ResponseEntity<ContentPlanResponse> approveWithExistingShoot(
            @PathVariable UUID id,
            @RequestParam UUID companyId,
            @RequestParam UUID shootId,
            Authentication auth) {
        serviceAccessGuard.requireService((UUID) auth.getPrincipal(), companyId, ServiceCategory.CONTENT_MARKETING);
        return ResponseEntity.ok(contentPlanService.approveWithExistingShoot(id, companyId, shootId));
    }
}
