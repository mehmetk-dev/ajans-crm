package com.fogistanbul.crm.googleanalytics.application;

import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAnalyticsServiceTest {

    @Mock
    GoogleOAuthService oAuthService;

    @Mock
    GoogleAnalyticsMapper mapper;

    @InjectMocks
    GoogleAnalyticsService service;

    // ─── isConfigured ─────────────────────────────────────────────────────────

    @Test
    void isConfigured_notConnected_returnsFalse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(false);

        assertThat(service.isConfigured(companyId)).isFalse();
        verify(oAuthService, never()).getPropertyId(any());
    }

    @Test
    void isConfigured_connectedNoProperty_returnsFalse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        when(oAuthService.getPropertyId(companyId)).thenReturn(Optional.empty());

        assertThat(service.isConfigured(companyId)).isFalse();
    }

    @Test
    void isConfigured_connectedWithProperty_returnsTrue() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        when(oAuthService.getPropertyId(companyId)).thenReturn(Optional.of("123456789"));

        assertThat(service.isConfigured(companyId)).isTrue();
    }

    // ─── getOverview ──────────────────────────────────────────────────────────

    @Test
    void getOverview_notConnected_returnsDisabledResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(false);

        GaOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        assertThat(result.sessions()).isZero();
    }

    @Test
    void getOverview_connectedNoProperty_returnsConnectedEmptyResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        when(oAuthService.getPropertyId(companyId)).thenReturn(Optional.empty());

        GaOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isTrue();
        assertThat(result.propertyId()).isNull();
        assertThat(result.sessions()).isZero();
    }

    @Test
    void getOverview_connectedPropertySetNoToken_returnsDisabledResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        when(oAuthService.getPropertyId(companyId)).thenReturn(Optional.of("123456789"));
        when(oAuthService.getValidAccessToken(companyId)).thenReturn(Optional.empty());

        GaOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
    }
}
