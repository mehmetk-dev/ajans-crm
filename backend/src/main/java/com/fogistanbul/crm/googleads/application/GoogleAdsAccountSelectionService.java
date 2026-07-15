package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountListResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountOption;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAdsAccountSelectionService {

    private final GoogleAdsAccountDiscoveryService discoveryService;
    private final GoogleAdsAccountSelectionPersistenceService persistenceService;

    public void select(UUID companyId, String customerId, String loginCustomerId) {
        String normalizedCustomerId = digitsOnly(customerId);
        String normalizedLoginCustomerId = digitsOnly(loginCustomerId);
        GoogleAdsAccountListResponse discovered = discoveryService.discover(companyId);
        GoogleAdsAccountOption selected = discovered.accounts().stream()
                .filter(account -> account.customerId().equals(normalizedCustomerId))
                .filter(account -> account.loginCustomerId().equals(normalizedLoginCustomerId))
                .findFirst()
                .orElseThrow(this::notAccessible);
        persist(companyId, selected);
    }

    public void selectByCustomerId(UUID companyId, String customerId) {
        String normalizedCustomerId = digitsOnly(customerId);
        GoogleAdsAccountOption selected = discoveryService.discover(companyId).accounts().stream()
                .filter(account -> account.customerId().equals(normalizedCustomerId))
                .findFirst()
                .orElseThrow(this::notAccessible);
        persist(companyId, selected);
    }

    private void persist(UUID companyId, GoogleAdsAccountOption selected) {
        persistenceService.persist(companyId, selected);
    }

    private ApiException notAccessible() {
        return new ApiException(HttpStatus.FORBIDDEN,
                "GOOGLE_ADS_ACCOUNT_NOT_ACCESSIBLE",
                "Seçilen Google Ads hesabına bu Google kullanıcısıyla erişilemiyor");
    }

    private String digitsOnly(String value) {
        return value != null ? value.replaceAll("[^0-9]", "") : "";
    }
}
