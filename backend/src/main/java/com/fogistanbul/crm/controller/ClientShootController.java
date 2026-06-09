package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.ShootResponse;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.company.application.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.ShootService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/client/shoots")
@RequiredArgsConstructor
public class ClientShootController {

    private final ShootService shootService;
    private final CompanyMembershipRepository membershipRepository;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping
    public ResponseEntity<Page<ShootResponse>> getMyCompanyShoots(
            @PageableDefault(size = 20, sort = "shootDate") Pageable pageable,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        List<UUID> companyIds = membershipRepository.findCompanyIdsByUserId(userId);
        if (companyIds.isEmpty()) {
            return ResponseEntity.ok(Page.empty(pageable));
        }
        UUID companyId = companyIds.get(0);
        serviceAccessGuard.requireService(userId, companyId, ServiceCategory.PRODUCTION);
        return ResponseEntity.ok(shootService.getShootsByCompany(companyId, pageable, userId));
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
