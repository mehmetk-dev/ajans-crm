package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.dto.PageSpeedReportResponse;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.service.CompanyServiceAccessGuard;
import com.fogistanbul.crm.service.PageSpeedService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PageSpeedController {

    private final PageSpeedService pageSpeedService;
    private final CompanyMembershipRepository membershipRepository;
    private final CompanyServiceAccessGuard serviceAccessGuard;

    @GetMapping("/api/staff/companies/{companyId}/pagespeed")
    public PageSpeedReportResponse getStaff(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "false") boolean refresh,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        return pageSpeedService.getReport(companyId, userId, role, refresh);
    }

    @GetMapping("/api/client/pagespeed")
    public PageSpeedReportResponse getClient(
            @RequestParam(defaultValue = "false") boolean refresh,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        UUID companyId = getClientCompanyId(userId);

        if (companyId == null) {
            return PageSpeedReportResponse.builder().configured(false).build();
        }
        serviceAccessGuard.requireService(userId, companyId, ServiceCategory.WEB_DESIGN);
        return pageSpeedService.getReport(companyId, userId, role, refresh);
    }

    @PutMapping("/api/client/pagespeed/website")
    public PageSpeedReportResponse updateClientWebsite(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        String role = auth.getAuthorities().iterator().next().getAuthority();
        UUID companyId = getClientCompanyId(userId);

        if (companyId == null) {
            return PageSpeedReportResponse.builder().configured(false).build();
        }

        serviceAccessGuard.requireService(userId, companyId, ServiceCategory.WEB_DESIGN);
        pageSpeedService.updateWebsite(companyId, userId, role, body.get("websiteUrl"));
        return pageSpeedService.getReport(companyId, userId, role, true);
    }

    private UUID getClientCompanyId(UUID userId) {
        return membershipRepository.findClientCompanyIdsForUser(userId).stream()
                .findFirst()
                .orElse(null);
    }
}
