package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleAdsAccountOperationRateLimiterTest {

    @Test
    void limitsDiscoveryAndSelectionPerUserAndCompany() {
        GoogleAdsAccountOperationRateLimiter limiter = new GoogleAdsAccountOperationRateLimiter();
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();

        for (int request = 0; request < 10; request++) {
            limiter.check(userId, companyId);
        }

        assertThatThrownBy(() -> limiter.check(userId, companyId))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Çok fazla");
    }
}
