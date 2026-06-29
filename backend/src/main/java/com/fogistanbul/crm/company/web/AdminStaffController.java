package com.fogistanbul.crm.company.web;

import com.fogistanbul.crm.company.application.StaffService;
import com.fogistanbul.crm.company.dto.CreateStaffRequest;
import com.fogistanbul.crm.company.dto.StaffResponse;
import com.fogistanbul.crm.company.dto.UpdateStaffRequest;
import com.fogistanbul.crm.entity.enums.ActivityAction;
import com.fogistanbul.crm.service.ActivityLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminStaffController {

    private final StaffService staffService;
    private final ActivityLogService activityLogService;

    private UUID actorId(Authentication auth) {
        return auth != null ? (UUID) auth.getPrincipal() : null;
    }

    @PostMapping
    public ResponseEntity<StaffResponse> create(@Valid @RequestBody CreateStaffRequest request,
                                                 Authentication auth) {
        StaffResponse created = staffService.createStaff(request);
        activityLogService.log(actorId(auth), ActivityAction.CREATE, "USER",
                UUID.fromString(created.getId()), created.getFullName(),
                Map.of("role", "AGENCY_STAFF", "email", created.getEmail()));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<StaffResponse>> getAll() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffResponse> update(@PathVariable UUID id,
            @Valid @RequestBody UpdateStaffRequest request,
            Authentication auth) {
        StaffResponse updated = staffService.updateStaff(id, request);
        activityLogService.log(actorId(auth), ActivityAction.UPDATE, "USER",
                id, updated.getFullName(), Map.of("role", "AGENCY_STAFF"));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{staffId}/assign/{companyId}")
    public ResponseEntity<Map<String, String>> assign(@PathVariable UUID staffId, @PathVariable UUID companyId,
                                                       Authentication auth) {
        staffService.assignToCompany(staffId, companyId);
        activityLogService.log(actorId(auth), ActivityAction.ASSIGN, "USER",
                staffId, null, Map.of("companyId", companyId.toString()));
        return ResponseEntity.ok(Map.of("message", "Çalışan şirkete başarıyla atandı"));
    }

    @DeleteMapping("/membership/{membershipId}")
    public ResponseEntity<Void> unassign(@PathVariable UUID membershipId, Authentication auth) {
        staffService.unassignFromCompany(membershipId);
        activityLogService.log(actorId(auth), ActivityAction.UNASSIGN, "USER",
                null, null, Map.of("membershipId", membershipId.toString()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{staffId}")
    public ResponseEntity<Void> delete(@PathVariable UUID staffId, Authentication auth) {
        activityLogService.log(actorId(auth), ActivityAction.DELETE, "USER",
                staffId, null, Map.of("role", "AGENCY_STAFF"));
        staffService.deleteStaff(staffId);
        return ResponseEntity.noContent().build();
    }
}
