package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsAccessContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class GoogleAdsAccessContextResolverTest {

    private GoogleAdsAccessContextResolver resolver;

    @BeforeEach
    void setUp() {
        resolver = new GoogleAdsAccessContextResolver();
        ReflectionTestUtils.setField(resolver, "legacyManagerCustomerId", "843-787-5152");
    }

    @Test
    void directSelectionDoesNotSendLoginCustomerHeader() {
        GoogleAdsAccessContext context = resolver.resolve(
                "299-449-7086", "2994497086");

        assertThat(context.customerId()).isEqualTo("2994497086");
        assertThat(context.loginCustomerId()).isNull();
    }

    @Test
    void managerSelectionUsesStoredLoginCustomerId() {
        GoogleAdsAccessContext context = resolver.resolve(
                "2994497086", "8437875152");

        assertThat(context.loginCustomerId()).isEqualTo("8437875152");
    }

    @Test
    void legacySelectionFallsBackToConfiguredManagerId() {
        GoogleAdsAccessContext context = resolver.resolve("2994497086", null);

        assertThat(context.loginCustomerId()).isEqualTo("8437875152");
        assertThat(resolver.isLegacyManagerCustomerId("843-787-5152")).isTrue();
    }
}
