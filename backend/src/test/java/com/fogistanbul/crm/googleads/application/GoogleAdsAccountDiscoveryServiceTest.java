package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.CustomerDescriptor;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAdsAccountDiscoveryServiceTest {

    @Mock GoogleOAuthService oAuthService;
    @Mock GoogleAdsClient client;
    @InjectMocks GoogleAdsAccountDiscoveryService service;

    @Test
    void discoversDirectAndManagerAccountsAndPrefersDirectPath() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.hasAdsScope(companyId)).thenReturn(true);
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of("access"));
        when(client.isConfigured()).thenReturn(true);
        when(client.listAccessibleCustomerIds("access"))
                .thenReturn(List.of("2994497086", "8437875152"));
        when(client.fetchCustomer("access", "2994497086", null))
                .thenReturn(new CustomerDescriptor("2994497086", "Direct Co", false, "ENABLED"));
        when(client.fetchCustomer("access", "8437875152", null))
                .thenReturn(new CustomerDescriptor("8437875152", "Agency MCC", true, "ENABLED"));
        when(client.fetchDirectChildren("access", "8437875152", "8437875152"))
                .thenReturn(List.of(
                        new CustomerDescriptor("2994497086", "Direct Co", false, "ENABLED"),
                        new CustomerDescriptor("1111111111", "Nested MCC", true, "ENABLED")));
        when(client.fetchDirectChildren("access", "1111111111", "8437875152"))
                .thenReturn(List.of(
                        new CustomerDescriptor("2222222222", "Managed Co", false, "ENABLED"),
                        new CustomerDescriptor("3333333333", "Disabled Co", false, "CANCELED")));

        var result = service.discover(companyId);

        assertThat(result.accounts()).hasSize(2);
        assertThat(result.accounts()).filteredOn(account -> account.customerId().equals("2994497086"))
                .singleElement()
                .satisfies(account -> {
                    assertThat(account.accessType()).isEqualTo("DIRECT");
                    assertThat(account.loginCustomerId()).isEqualTo("2994497086");
                });
        assertThat(result.accounts()).filteredOn(account -> account.customerId().equals("2222222222"))
                .singleElement()
                .satisfies(account -> {
                    assertThat(account.accessType()).isEqualTo("MANAGER");
                    assertThat(account.loginCustomerId()).isEqualTo("8437875152");
                    assertThat(account.managerName()).isEqualTo("Agency MCC");
                });
        assertThat(result.warnings()).isEmpty();
    }
}
