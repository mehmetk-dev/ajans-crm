package com.fogistanbul.crm.company.web;

import com.fogistanbul.crm.company.application.CompanyService;
import com.fogistanbul.crm.company.dto.AddEmployeeRequest;
import com.fogistanbul.crm.company.dto.CompanyInfrastructureRequest;
import com.fogistanbul.crm.company.dto.CompanyResponse;
import com.fogistanbul.crm.company.dto.CreateCompanyRequest;
import com.fogistanbul.crm.company.dto.UpdateCompanyRequest;
import com.fogistanbul.crm.dto.SurveyResponse;
import com.fogistanbul.crm.entity.enums.ActivityAction;
import com.fogistanbul.crm.service.ActivityLogService;
import com.fogistanbul.crm.service.SurveyService;
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
@RequestMapping("/api/admin/companies")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminCompanyController {

    private final CompanyService companyService;
    private final SurveyService surveyService;
    private final ActivityLogService activityLogService;

    private UUID actorId(Authentication auth) {
        return auth != null ? (UUID) auth.getPrincipal() : null;
    }

    @PostMapping
    public ResponseEntity<CompanyResponse> create(@Valid @RequestBody CreateCompanyRequest request,
                                                   Authentication auth) {
        CompanyResponse created = companyService.createCompanyWithOwner(request);
        activityLogService.log(actorId(auth), ActivityAction.CREATE, "COMPANY",
                UUID.fromString(created.getId()), created.getName(),
                Map.of("industry", created.getIndustry() == null ? "" : created.getIndustry()));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAll() {
        return ResponseEntity.ok(companyService.getAllClients());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponse> update(@PathVariable UUID id,
            @Valid @RequestBody UpdateCompanyRequest request,
            Authentication auth) {
        CompanyResponse updated = companyService.update(id, request);
        activityLogService.log(actorId(auth), ActivityAction.UPDATE, "COMPANY",
                id, updated.getName(), Map.of());
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{id}/infrastructure")
    public ResponseEntity<CompanyResponse> updateInfrastructure(@PathVariable UUID id,
            @Valid @RequestBody CompanyInfrastructureRequest request,
            Authentication auth) {
        CompanyResponse updated = companyService.updateInfrastructure(id, request);
        activityLogService.log(actorId(auth), ActivityAction.UPDATE, "COMPANY",
                id, updated.getName(), Map.of("section", "infrastructure"));
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{companyId}/employees")
    public ResponseEntity<Map<String, String>> addEmployee(
            @PathVariable UUID companyId,
            @Valid @RequestBody AddEmployeeRequest request,
            Authentication auth) {
        companyService.addEmployeeToCompany(companyId, request);
        activityLogService.log(actorId(auth), ActivityAction.CREATE, "USER",
                null, request.getFullName(), Map.of("companyId", companyId.toString(), "email", request.getEmail()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Çalışan başarıyla eklendi"));
    }

    @DeleteMapping("/{companyId}/employees/{userId}")
    public ResponseEntity<Void> removeEmployee(
            @PathVariable UUID companyId,
            @PathVariable UUID userId,
            Authentication auth) {
        companyService.removeEmployeeFromCompany(companyId, userId);
        activityLogService.log(actorId(auth), ActivityAction.DELETE, "USER",
                userId, null, Map.of("companyId", companyId.toString()));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<Void> delete(@PathVariable UUID companyId, Authentication auth) {
        companyService.deleteCompany(companyId);
        activityLogService.log(actorId(auth), ActivityAction.DELETE, "COMPANY",
                companyId, null, Map.of());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{companyId}/surveys")
    public ResponseEntity<List<SurveyResponse>> getCompanySurveys(@PathVariable UUID companyId) {
        return ResponseEntity.ok(surveyService.getCompanySurveys(companyId));
    }

    @GetMapping("/surveys/all")
    public ResponseEntity<List<SurveyResponse>> getAllSurveys() {
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }
}
