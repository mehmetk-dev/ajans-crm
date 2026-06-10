package com.fogistanbul.crm.prproject.web;

import com.fogistanbul.crm.prproject.application.PrProjectService;
import com.fogistanbul.crm.prproject.dto.AddPrPhaseNoteRequest;
import com.fogistanbul.crm.prproject.dto.CreatePrProjectRequest;
import com.fogistanbul.crm.prproject.dto.PrProjectResponse;
import com.fogistanbul.crm.prproject.dto.UpdatePrProjectRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

import java.util.UUID;

@RestController
@RequestMapping("/api/staff/pr-projects")
@RequiredArgsConstructor
public class PrProjectController {

    private final PrProjectService prProjectService;

    @PostMapping
    public ResponseEntity<PrProjectResponse> create(
            @Valid @RequestBody CreatePrProjectRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prProjectService.createProject(request, userId(authentication)));
    }

    @GetMapping
    public Page<PrProjectResponse> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return prProjectService.getAllProjects(pageable, userId(authentication));
    }

    @GetMapping("/company/{companyId}")
    public Page<PrProjectResponse> getByCompany(
            @PathVariable UUID companyId,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication authentication
    ) {
        return prProjectService.getProjectsByCompany(
                companyId, pageable, userId(authentication));
    }

    @GetMapping("/{id}")
    public PrProjectResponse getById(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return prProjectService.getProjectById(id, userId(authentication));
    }

    @PutMapping("/{id}")
    public PrProjectResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePrProjectRequest request,
            Authentication authentication
    ) {
        return prProjectService.updateProject(id, request, userId(authentication));
    }

    @PostMapping("/{projectId}/phases/{phaseId}/complete")
    public PrProjectResponse completePhase(
            @PathVariable UUID projectId,
            @PathVariable UUID phaseId,
            Authentication authentication
    ) {
        return prProjectService.completePhase(
                projectId, phaseId, userId(authentication));
    }

    @PostMapping("/{projectId}/phases/{phaseId}/notes")
    public PrProjectResponse addPhaseNote(
            @PathVariable UUID projectId,
            @PathVariable UUID phaseId,
            @Valid @RequestBody AddPrPhaseNoteRequest request,
            Authentication authentication
    ) {
        return prProjectService.addPhaseNote(
                projectId, phaseId, request.content(), userId(authentication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        prProjectService.deleteProject(id, userId(authentication));
        return ResponseEntity.noContent().build();
    }

    private UUID userId(Authentication authentication) {
        return (UUID) authentication.getPrincipal();
    }
}
