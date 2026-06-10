package com.fogistanbul.crm.shoot.web;

import com.fogistanbul.crm.entity.enums.ShootStatus;
import com.fogistanbul.crm.shoot.application.ShootService;
import com.fogistanbul.crm.shoot.dto.CreateShootRequest;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/staff/shoots")
@RequiredArgsConstructor
public class StaffShootController {

    private final ShootService shootService;

    @PostMapping
    public ResponseEntity<ShootResponse> create(
            @Valid @RequestBody CreateShootRequest request,
            Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shootService.createShoot(request, (UUID) auth.getPrincipal()));
    }

    @GetMapping
    public Page<ShootResponse> getAll(
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        return shootService.getAllShoots(pageable, (UUID) auth.getPrincipal());
    }

    @GetMapping("/company/{companyId}")
    public Page<ShootResponse> getByCompany(
            @PathVariable UUID companyId,
            @PageableDefault(size = 20) Pageable pageable,
            Authentication auth) {
        return shootService.getShootsByCompany(companyId, pageable, (UUID) auth.getPrincipal());
    }

    @GetMapping("/{id}")
    public ShootResponse getById(@PathVariable UUID id, Authentication auth) {
        return shootService.getShootById(id, (UUID) auth.getPrincipal());
    }

    @PutMapping("/{id}/status")
    public ShootResponse updateStatus(
            @PathVariable UUID id,
            @RequestParam ShootStatus status,
            Authentication auth) {
        return shootService.updateStatus(id, status, (UUID) auth.getPrincipal());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id, Authentication auth) {
        shootService.deleteShoot(id, (UUID) auth.getPrincipal());
        return ResponseEntity.noContent().build();
    }
}
