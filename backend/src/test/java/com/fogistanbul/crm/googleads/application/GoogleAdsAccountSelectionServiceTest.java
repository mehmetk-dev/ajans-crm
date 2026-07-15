package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountListResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccountOption;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAdsAccountSelectionServiceTest {

    @Mock GoogleAdsAccountDiscoveryService discoveryService;
    @Mock GoogleAdsAccountSelectionPersistenceService persistenceService;
    @InjectMocks GoogleAdsAccountSelectionService service;

    @Test
    void selectsOnlyExactDiscoveredAccessPath() {
        UUID companyId = UUID.randomUUID();
        GoogleAdsAccountOption option = managedOption();
        when(discoveryService.discover(companyId))
                .thenReturn(new GoogleAdsAccountListResponse(List.of(option), List.of()));
        service.select(companyId, option.customerId(), option.loginCustomerId());

        verify(persistenceService).persist(companyId, option);
    }

    @Test
    void rejectsBrowserSuppliedLoginIdThatWasNotDiscovered() {
        UUID companyId = UUID.randomUUID();
        GoogleAdsAccountOption option = managedOption();
        when(discoveryService.discover(companyId))
                .thenReturn(new GoogleAdsAccountListResponse(List.of(option), List.of()));

        assertThatThrownBy(() -> service.select(
                companyId, option.customerId(), "9999999999"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("erişilemiyor");

        verify(persistenceService, never()).persist(companyId, option);
    }

    private GoogleAdsAccountOption managedOption() {
        return new GoogleAdsAccountOption(
                "2994497086",
                "Managed Co",
                "8437875152",
                "MANAGER",
                "Agency MCC",
                "ENABLED");
    }
}
