package com.fogistanbul.crm.company.application;

import com.fogistanbul.crm.entity.UserProfile;
import com.fogistanbul.crm.entity.enums.GlobalRole;
import com.fogistanbul.crm.entity.enums.ServiceCategory;
import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.repository.CompanyMembershipRepository;
import com.fogistanbul.crm.repository.UserProfileRepository;
import com.fogistanbul.crm.service.CompanyServicesManager;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientActiveServicesService {

    private final CompanyServicesManager companyServicesManager;
    private final UserProfileRepository userProfileRepository;
    private final CompanyMembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public List<String> getActiveServices(UUID userId) {
        UserProfile user = userProfileRepository.findById(userId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "USER_NOT_FOUND",
                        "Kullanıcı bulunamadı"
                ));

        if (user.getGlobalRole() == GlobalRole.ADMIN || user.getGlobalRole() == GlobalRole.AGENCY_STAFF) {
            return Arrays.stream(ServiceCategory.values())
                    .map(ServiceCategory::name)
                    .toList();
        }

        return membershipRepository.findClientCompanyIdsForUser(userId).stream()
                .findFirst()
                .map(companyServicesManager::getActiveServiceCategories)
                .orElseGet(List::of);
    }
}
