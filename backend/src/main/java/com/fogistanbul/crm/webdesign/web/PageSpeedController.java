package com.fogistanbul.crm.webdesign.web;

import com.fogistanbul.crm.webdesign.application.PageSpeedAccessPolicy;
import com.fogistanbul.crm.webdesign.application.PageSpeedService;
import com.fogistanbul.crm.webdesign.dto.PageSpeedReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PageSpeedController {

    private final PageSpeedService pageSpeedService;
    private final PageSpeedAccessPolicy accessPolicy;

    @GetMapping("/api/staff/companies/{companyId}/pagespeed")
    public PageSpeedReportResponse getStaff(
            @PathVariable UUID companyId,
            @RequestParam(defaultValue = "false") boolean refresh,
            Authentication auth) {
        String role = auth.getAuthorities().iterator().next().getAuthority();
        accessPolicy.requireStaffReadAccess(role);
        return pageSpeedService.getReport(companyId, refresh);
    }

    @GetMapping("/api/client/pagespeed")
    public PageSpeedReportResponse getClient(
            @RequestParam(defaultValue = "false") boolean refresh,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        return accessPolicy.resolveClientCompanyWithAccess(userId)
                .map(companyId -> pageSpeedService.getReport(companyId, refresh))
                .orElseGet(() -> PageSpeedReportResponse.builder().configured(false).build());
    }

    @PutMapping("/api/client/pagespeed/website")
    public PageSpeedReportResponse updateClientWebsite(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        UUID companyId = accessPolicy.resolveClientCompanyWithAccess(userId)
                .orElse(null);

        if (companyId == null) {
            return PageSpeedReportResponse.builder().configured(false).build();
        }

        pageSpeedService.updateWebsite(companyId, body.get("websiteUrl"));
        return pageSpeedService.getReport(companyId, true);
    }
}
