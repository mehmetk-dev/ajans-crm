package com.fogistanbul.crm.controller;

import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.CompanyServicesManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/client")
@RequiredArgsConstructor
public class ClientActiveServicesController {

    private final CompanyServicesManager companyServicesManager;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;

    @GetMapping("/active-services")
    public ResponseEntity<Map<String, List<String>>> getActiveServices(Authentication auth) {
        UUID userId = (UUID) auth.getPrincipal();
        var userProfile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi"));

        if (userProfile.getGlobalRole() == GlobalRole.ADMIN || userProfile.getGlobalRole() == GlobalRole.AGENCY_STAFF) {
            return ResponseEntity.ok(Map.of("activeServices", Arrays.stream(ServiceCategory.values())
                    .map(ServiceCategory::name)
                    .toList()));
        }

        var companyId = membershipRepository.findClientCompanyIdsForUser(userId).stream()
                .findFirst()
                .orElse(null);

        if (companyId == null) {
            return ResponseEntity.ok(Map.of("activeServices", List.of()));
        }

        return ResponseEntity.ok(Map.of(
                "activeServices",
                companyServicesManager.getActiveServiceCategories(companyId)));
    }
}
