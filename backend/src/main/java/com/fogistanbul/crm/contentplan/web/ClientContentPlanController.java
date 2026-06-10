package com.fogistanbul.crm.contentplan.web;

import com.fogistanbul.crm.contentplan.application.ContentApprovalMetadata;
import com.fogistanbul.crm.contentplan.application.ContentPlanApprovalService;
import com.fogistanbul.crm.contentplan.application.ContentPlanService;
import com.fogistanbul.crm.contentplan.dto.ApproveContentPlanRequest;
import com.fogistanbul.crm.contentplan.dto.ContentPlanResponse;
import com.fogistanbul.crm.contentplan.dto.RequestRevisionRequest;
import jakarta.validation.Valid;
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
    private final ContentPlanApprovalService approvalService;

    @GetMapping
    public ResponseEntity<Page<ContentPlanResponse>> getByCompany(
            @RequestParam UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getByCompany(
                companyId, status, page, size, userId(auth), true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentPlanResponse> getById(
            @PathVariable UUID id, Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getById(id, userId(auth), true));
    }

    @GetMapping("/shoot/{shootId}")
    public ResponseEntity<List<ContentPlanResponse>> getByShoot(
            @PathVariable UUID shootId, Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getByShoot(shootId, userId(auth), true));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<ContentPlanResponse> approveWithShoot(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveContentPlanRequest request,
            Authentication auth
    ) {
        ContentApprovalMetadata.Details details = new ContentApprovalMetadata.Details(
                request.getShootTitle(), request.getShootDescription(), request.getShootDate(),
                request.getShootTime(), request.getLocation(), null);
        return ResponseEntity.ok(approvalService.approveNewClient(
                id, request.getCompanyId(), userId(auth), details));
    }

    @PostMapping("/{id}/approve-existing")
    public ResponseEntity<ContentPlanResponse> approveWithExistingShoot(
            @PathVariable UUID id,
            @RequestParam UUID companyId,
            @RequestParam UUID shootId,
            Authentication auth
    ) {
        return ResponseEntity.ok(approvalService.approveExistingClient(
                id, companyId, shootId, userId(auth)));
    }

    @PostMapping("/{id}/revision")
    public ResponseEntity<ContentPlanResponse> requestRevision(
            @PathVariable UUID id,
            @Valid @RequestBody RequestRevisionRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.requestClientRevision(
                id, request.getNote(), userId(auth)));
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
