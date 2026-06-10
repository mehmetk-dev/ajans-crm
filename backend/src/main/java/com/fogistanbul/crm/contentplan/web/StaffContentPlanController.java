package com.fogistanbul.crm.contentplan.web;

import com.fogistanbul.crm.contentplan.application.ContentPlanService;
import com.fogistanbul.crm.contentplan.dto.ContentPlanResponse;
import com.fogistanbul.crm.contentplan.dto.CreateContentPlanRequest;
import com.fogistanbul.crm.contentplan.dto.UpdateContentPlanRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/content-plans")
@RequiredArgsConstructor
public class StaffContentPlanController {

    private final ContentPlanService contentPlanService;

    @PostMapping
    public ResponseEntity<ContentPlanResponse> create(
            @Valid @RequestBody CreateContentPlanRequest request, Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.create(request, userId(auth)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContentPlanResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContentPlanRequest request,
            Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.update(id, request, userId(auth)));
    }

    @GetMapping
    public ResponseEntity<Page<ContentPlanResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getAll(page, size, userId(auth)));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<ContentPlanResponse>> getByCompany(
            @PathVariable UUID companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getByCompany(
                companyId, status, page, size, userId(auth), false));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContentPlanResponse> getById(
            @PathVariable UUID id, Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getById(id, userId(auth), false));
    }

    @GetMapping("/shoot/{shootId}")
    public ResponseEntity<List<ContentPlanResponse>> getByShoot(
            @PathVariable UUID shootId, Authentication auth
    ) {
        return ResponseEntity.ok(contentPlanService.getByShoot(shootId, userId(auth), false));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        contentPlanService.delete(id, userId(auth));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication auth) {
        return (UUID) auth.getPrincipal();
    }
}
