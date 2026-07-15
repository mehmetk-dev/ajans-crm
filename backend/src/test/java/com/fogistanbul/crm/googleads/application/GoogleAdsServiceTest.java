package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.googleads.dto.GoogleAdsOverviewResponse;
import com.fogistanbul.crm.googleads.dto.GoogleAdsAccessContext;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.CampaignMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.DailyMetrics;
import com.fogistanbul.crm.googleads.infrastructure.GoogleAdsClient.SummaryMetrics;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleAdsServiceTest {

    @Mock
    GoogleOAuthService oAuthService;

    @Mock
    GoogleAdsClient client;

    @Mock
    GoogleAdsMapper mapper;

    @Mock
    GoogleAdsAccessContextResolver accessContextResolver;

    @InjectMocks
    GoogleAdsService service;

    @Test
    void getOverview_notConnected_returnsDisabledResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(false);

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(client, mapper);
    }

    @Test
    void getOverview_withoutCustomerId_returnsError() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(true);
        when(oAuthService.hasAdsScope(companyId)).thenReturn(true);
        when(oAuthService.getAdsCustomerId(companyId)).thenReturn(Optional.empty());

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("müşteri ID");
        verifyNoInteractions(client);
    }

    @Test
    void getOverview_withoutAdsScopeReturnsReconnectResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS)).thenReturn(true);
        when(oAuthService.hasAdsScope(companyId)).thenReturn(false);

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.hasAdsScope()).isFalse();
        verifyNoInteractions(client, mapper);
    }

    @Test
    void getOverview_withoutAccessToken_returnsError() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(true);
        when(oAuthService.hasAdsScope(companyId)).thenReturn(true);
        when(oAuthService.getAdsCustomerId(companyId)).thenReturn(Optional.of("123-456-7890"));
        when(mapper.sanitizeCustomerId("123-456-7890")).thenReturn("1234567890");
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.empty());

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("access token");
        verify(client, never()).fetchSummary(anyString(), any(), anyString(), anyString());
        verify(client, never()).fetchCampaigns(anyString(), any(), anyString(), anyString());
        verify(client, never()).fetchDailyTrend(anyString(), any(), anyString(), anyString());
    }

    @Test
    void getOverview_withManagerCustomerIdReturnsActionableErrorWithoutProviderCall() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(true);
        when(oAuthService.hasAdsScope(companyId)).thenReturn(true);
        when(oAuthService.getAdsCustomerId(companyId)).thenReturn(Optional.of("123-456-7890"));
        when(mapper.sanitizeCustomerId("123-456-7890")).thenReturn("1234567890");
        when(accessContextResolver.isLegacyManagerCustomerId("1234567890")).thenReturn(true);

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("yönetici hesabı")
                .contains("reklamveren müşteri ID'sini");
        verify(oAuthService, never()).getValidAccessToken(any(), anyString());
        verify(client, never()).fetchSummary(anyString(), any(), anyString(), anyString());
    }

    @Test
    void getOverview_withoutDeveloperToken_returnsError() {
        UUID companyId = configuredCompany();
        when(client.isConfigured()).thenReturn(false);

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("developer token");
    }

    @Test
    void getOverview_fetchesCampaignsAndDailyTrend() {
        UUID companyId = configuredCompany();
        GoogleAdsOverviewResponse expected = GoogleAdsOverviewResponse.error("1234567890", "mapped");
        List<CampaignMetrics> campaigns = List.of();
        List<DailyMetrics> daily = List.of();
        SummaryMetrics summary = new SummaryMetrics("TRY", 0, 0, 0, 0, 0, 0);
        when(client.isConfigured()).thenReturn(true);
        when(mapper.resolveDate(anyString(), any())).thenReturn("2026-06-01", "2026-06-12");
        GoogleAdsAccessContext context = new GoogleAdsAccessContext("1234567890", null);
        when(client.fetchCampaigns("token", context, "2026-06-01", "2026-06-12"))
                .thenReturn(campaigns);
        when(client.fetchSummary("token", context, "2026-06-01", "2026-06-12"))
                .thenReturn(summary);
        when(client.fetchDailyTrend("token", context, "2026-06-01", "2026-06-12"))
                .thenReturn(daily);
        when(mapper.toOverviewResponse("1234567890", summary, campaigns, daily)).thenReturn(expected);

        assertThat(service.getOverview(companyId, "11daysAgo", "today")).isSameAs(expected);
    }

    @Test
    void getOverview_defaultRangeUsesThirtyInclusiveDays() {
        UUID companyId = configuredCompany();
        when(client.isConfigured()).thenReturn(true);
        when(mapper.resolveDate(anyString(), any())).thenReturn("2026-05-14", "2026-06-12");
        when(client.fetchSummary(anyString(), any(), anyString(), anyString()))
                .thenReturn(new SummaryMetrics("TRY", 0, 0, 0, 0, 0, 0));
        when(client.fetchCampaigns(anyString(), any(), anyString(), anyString()))
                .thenReturn(List.of());
        when(client.fetchDailyTrend(anyString(), any(), anyString(), anyString()))
                .thenReturn(List.of());

        service.getOverview(companyId, null, null);

        verify(mapper).resolveDate(eq("29daysAgo"), any());
    }

    @Test
    void getOverview_rejectsReversedDateRangeBeforeProviderCalls() {
        UUID companyId = configuredCompany();
        when(client.isConfigured()).thenReturn(true);
        when(mapper.resolveDate(eq("2026-06-12"), any())).thenReturn("2026-06-12");
        when(mapper.resolveDate(eq("2026-06-01"), any())).thenReturn("2026-06-01");

        assertThatThrownBy(() -> service.getOverview(
                companyId, "2026-06-12", "2026-06-01"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Başlangıç tarihi");
        verify(client, never()).fetchSummary(anyString(), any(), anyString(), anyString());
    }

    @Test
    void getOverview_clientFailure_returnsMappedError() {
        UUID companyId = configuredCompany();
        when(client.isConfigured()).thenReturn(true);
        when(mapper.resolveDate(anyString(), any())).thenReturn("2026-06-01", "2026-06-12");
        when(client.fetchCampaigns(anyString(), any(), anyString(), anyString()))
                .thenThrow(new RuntimeException("403 PERMISSION_DENIED"));
        when(mapper.toUserErrorMessage("403 PERMISSION_DENIED")).thenReturn("mapped error");

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).isEqualTo("mapped error");
    }

    @Test
    void getOverview_unauthorizedDisconnectsStaleAdsToken() {
        UUID companyId = configuredCompany();
        when(client.isConfigured()).thenReturn(true);
        when(mapper.resolveDate(anyString(), any())).thenReturn("2026-06-01", "2026-06-12");
        when(client.fetchSummary(anyString(), any(), anyString(), anyString()))
                .thenThrow(new RuntimeException("401 Unauthorized"));
        when(mapper.toUserErrorMessage("401 Unauthorized")).thenReturn("reconnect");

        GoogleAdsOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verify(oAuthService).disconnect(companyId, GoogleOAuthService.SVC_GOOGLE_ADS);
    }

    @Test
    void expectedAuthorizationFailuresAreRecognizedForCompactLogging() {
        assertThat(GoogleAdsService.isExpectedAuthorizationFailure("401 Unauthorized")).isTrue();
        assertThat(GoogleAdsService.isExpectedAuthorizationFailure("403 PERMISSION_DENIED")).isTrue();
        assertThat(GoogleAdsService.isExpectedAuthorizationFailure("UNAUTHENTICATED")).isTrue();
        assertThat(GoogleAdsService.isExpectedAuthorizationFailure("REQUESTED_METRICS_FOR_MANAGER")).isTrue();
        assertThat(GoogleAdsService.isExpectedAuthorizationFailure("network error")).isFalse();
    }

    private UUID configuredCompany() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(true);
        when(oAuthService.hasAdsScope(companyId)).thenReturn(true);
        when(oAuthService.getAdsCustomerId(companyId)).thenReturn(Optional.of("123-456-7890"));
        when(mapper.sanitizeCustomerId("123-456-7890")).thenReturn("1234567890");
        when(accessContextResolver.isLegacyManagerCustomerId("1234567890")).thenReturn(false);
        when(oAuthService.getAdsLoginCustomerId(companyId)).thenReturn(Optional.of("1234567890"));
        when(accessContextResolver.resolve("1234567890", "1234567890"))
                .thenReturn(new GoogleAdsAccessContext("1234567890", null));
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of("token"));
        return companyId;
    }
}
