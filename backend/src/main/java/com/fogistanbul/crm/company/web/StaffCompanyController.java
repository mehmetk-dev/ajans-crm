package com.fogistanbul.crm.company.web;

import com.fogistanbul.crm.company.application.CompanyService;
import com.fogistanbul.crm.company.dto.CompanyResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/companies")
@PreAuthorize("hasAnyRole('ADMIN', 'AGENCY_STAFF')")
@RequiredArgsConstructor
public class StaffCompanyController {

    private final CompanyService companyService;

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllClients(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(companyService.getAllClientsForUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id, Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return ResponseEntity.ok(companyService.getByIdForUser(id, userId));
    }
}
