package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.service.CompanyServicesManager;
import com.fogistanbul.crm.service.CompanyServicesManager.ServiceItem;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin endpoint'leri: şirket bazında hizmet yönetimi (listeleme + toggle)
 */
@RestController
@RequestMapping("/api/admin/companies/{companyId}/services")
@RequiredArgsConstructor
public class AdminCompanyServiceController {

    private final CompanyServicesManager companyServicesManager;

    /**
     * GET /api/admin/companies/{companyId}/services
     * Şirketin tüm hizmetlerini (aktif + pasif) döndürür.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceItem>> getServices(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyServicesManager.getAllServices(companyId));
    }

    /**
     * PUT /api/admin/companies/{companyId}/services/{category}/toggle
     * Body: { "active": true/false }
     * Belirtilen hizmetin aktiflik durumunu değiştirir.
     */
    @PutMapping("/{category}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceItem> toggleService(
            @PathVariable UUID companyId,
            @PathVariable String category,
            @RequestBody Map<String, Boolean> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        return ResponseEntity.ok(companyServicesManager.toggleService(companyId, category, active));
    }
}
