package com.fogistanbul.crm.maintenance.web;

import com.fogistanbul.crm.maintenance.application.MaintenanceLogService;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogRequest;
import com.fogistanbul.crm.maintenance.dto.MaintenanceLogResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/companies/{companyId}/maintenance-log")
@RequiredArgsConstructor
public class StaffMaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    @GetMapping
    public List<MaintenanceLogResponse> list(@PathVariable UUID companyId, Authentication authentication) {
        return maintenanceLogService.listForCompany(companyId, userId(authentication));
    }

    @PostMapping
    public ResponseEntity<MaintenanceLogResponse> create(
            @PathVariable UUID companyId,
            @Valid @RequestBody MaintenanceLogRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(maintenanceLogService.create(companyId, request, userId(authentication)));
    }

    @PutMapping("/{entryId}")
    public MaintenanceLogResponse update(
            @PathVariable UUID companyId,
            @PathVariable UUID entryId,
            @Valid @RequestBody MaintenanceLogRequest request,
            Authentication authentication
    ) {
        return maintenanceLogService.update(companyId, entryId, request, userId(authentication));
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID companyId,
            @PathVariable UUID entryId,
            Authentication authentication
    ) {
        maintenanceLogService.delete(companyId, entryId, userId(authentication));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }
}
