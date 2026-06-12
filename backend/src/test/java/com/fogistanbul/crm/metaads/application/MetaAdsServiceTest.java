package com.fogistanbul.crm.metaads.application;

import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.metaads.dto.MetaAdsOverviewResponse;
import com.fogistanbul.crm.metaads.infrastructure.MetaAdsClient;
import com.fogistanbul.crm.metaads.infrastructure.MetaAdsClient.DateRange;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MetaAdsServiceTest {

    @Mock
    InstagramOAuthService oAuthService;

    @Mock
    MetaAdsAccountService accountService;

    @Mock
    MetaAdsClient client;

    @Mock
    MetaAdsMapper mapper;

    @InjectMocks
    MetaAdsService service;

    @Test
    void getOverview_notConnected_returnsDisabledResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(false);

        var result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(accountService, client, mapper);
    }

    @Test
    void getOverview_withoutAdAccount_returnsError() {
        UUID companyId = connectedCompany();
        when(accountService.getAdAccountId(companyId)).thenReturn(Optional.empty());

        var result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("hesap ID");
        verifyNoInteractions(client, mapper);
    }

    @Test
    void getOverview_withoutAccessToken_returnsError() {
        UUID companyId = connectedCompany();
        when(accountService.getAdAccountId(companyId))
                .thenReturn(Optional.of("act_123"));
        when(oAuthService.getValidAccessToken(companyId))
                .thenReturn(Optional.empty());

        var result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).contains("access token");
        verifyNoInteractions(client, mapper);
    }

    @Test
    void getOverview_fetchesAndMapsGraphReports() {
        UUID companyId = configuredCompany();
        DateRange range = DateRange.resolve("2026-06-01", "2026-06-12");
        Map<String, Object> account = Map.of("spend", "10");
        List<Map<String, Object>> campaigns = List.of();
        List<Map<String, Object>> daily = List.of();
        MetaAdsOverviewResponse expected =
                MetaAdsOverviewResponse.error("act_123", "mapped");
        when(client.fetchAccountName("act_123", "token")).thenReturn("Fog Ads");
        when(client.fetchAccountInsights("act_123", "token", range))
                .thenReturn(account);
        when(client.fetchCampaignInsights("act_123", "token", range))
                .thenReturn(campaigns);
        when(client.fetchDailyInsights("act_123", "token", range))
                .thenReturn(daily);
        when(mapper.toOverviewResponse(
                "act_123", "Fog Ads", account, campaigns, daily))
                .thenReturn(expected);

        assertThat(service.getOverview(
                companyId, "2026-06-01", "2026-06-12")).isSameAs(expected);
    }

    @Test
    void getOverview_clientFailure_returnsMappedError() {
        UUID companyId = configuredCompany();
        when(client.fetchAccountName("act_123", "token")).thenReturn("");
        when(client.fetchAccountInsights(
                "act_123", "token", DateRange.resolve(null, null)))
                .thenThrow(new RuntimeException("OAuthException code 190"));
        when(mapper.toUserErrorMessage("OAuthException code 190"))
                .thenReturn("mapped error");

        var result = service.getOverview(companyId, null, null);

        assertThat(result.errorMessage()).isEqualTo("mapped error");
    }

    private UUID connectedCompany() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        return companyId;
    }

    private UUID configuredCompany() {
        UUID companyId = connectedCompany();
        when(accountService.getAdAccountId(companyId))
                .thenReturn(Optional.of("act_123"));
        when(oAuthService.getValidAccessToken(companyId))
                .thenReturn(Optional.of("token"));
        return companyId;
    }
}
