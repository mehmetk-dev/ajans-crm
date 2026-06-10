package com.fogistanbul.crm.shoot.web;

import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.shoot.application.ShootService;
import com.fogistanbul.crm.shoot.dto.ShootResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/client/shoots")
@RequiredArgsConstructor
public class ClientShootController {

    private final ShootService shootService;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping
    public ResponseEntity<Page<ShootResponse>> getMyCompanyShoots(
            @PageableDefault(size = 20, sort = "shootDate") Pageable pageable,
            Authentication auth) {
        return ResponseEntity.ok(shootService.getClientShoots(pageable, (UUID) auth.getPrincipal()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShootResponse> getShootById(
            @PathVariable UUID id,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        ShootResponse response = shootService.getShootById(id, userId);
        serviceAccessGuard.requireService(userId, response.getCompanyId(), ServiceCategory.PRODUCTION);
        return ResponseEntity.ok(response);
    }
}
