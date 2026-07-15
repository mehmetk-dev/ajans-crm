package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsAccessContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleAdsAccessContextResolver {

    @Value("${app.google-ads.manager-customer-id:}")
    private String legacyManagerCustomerId;

    public GoogleAdsAccessContext resolve(String customerId, String storedLoginCustomerId) {
        String normalizedCustomerId = digitsOnly(customerId);
        String normalizedLoginCustomerId = digitsOnly(storedLoginCustomerId);
        if (normalizedLoginCustomerId.isBlank()) {
            normalizedLoginCustomerId = digitsOnly(legacyManagerCustomerId);
        }
        if (normalizedLoginCustomerId.isBlank()
                || normalizedLoginCustomerId.equals(normalizedCustomerId)) {
            normalizedLoginCustomerId = null;
        }
        return new GoogleAdsAccessContext(normalizedCustomerId, normalizedLoginCustomerId);
    }

    public boolean isLegacyManagerCustomerId(String customerId) {
        String managerId = digitsOnly(legacyManagerCustomerId);
        return !managerId.isBlank() && managerId.equals(digitsOnly(customerId));
    }

    private String digitsOnly(String value) {
        return value != null ? value.replaceAll("[^0-9]", "") : "";
    }
}
