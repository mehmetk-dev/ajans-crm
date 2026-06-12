package com.fogistanbul.crm.searchconsole.application;

import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;
import com.fogistanbul.crm.searchconsole.dto.ScSiteResponse;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient;
import com.fogistanbul.crm.searchconsole.infrastructure.SearchConsoleClient.QueryRow;
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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SearchConsoleServiceTest {

    @Mock
    GoogleOAuthService oAuthService;

    @Mock
    SearchConsoleClient client;

    @Mock
    SearchConsoleMapper mapper;

    @InjectMocks
    SearchConsoleService service;

    @Test
    void isConfigured_requiresConnectionAndSiteUrl() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(true);
        when(oAuthService.getSiteUrl(companyId)).thenReturn(Optional.of("https://example.com"));

        assertThat(service.isConfigured(companyId)).isTrue();
    }

    @Test
    void listSites_withoutAccessToken_returnsEmptyList() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.empty());

        assertThat(service.listSites(companyId)).isEmpty();
        verifyNoInteractions(client);
    }

    @Test
    void listSites_withAccessToken_delegatesToClient() {
        UUID companyId = UUID.randomUUID();
        List<ScSiteResponse> sites = List.of(new ScSiteResponse("https://example.com", "siteOwner"));
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.of("token"));
        when(client.listSites("token")).thenReturn(sites);

        assertThat(service.listSites(companyId)).isEqualTo(sites);
    }

    @Test
    void getOverview_notConnected_returnsDisabledResponse() {
        UUID companyId = UUID.randomUUID();
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(false);

        ScOverviewResponse result = service.getOverview(companyId, null, null);

        assertThat(result.connected()).isFalse();
        verifyNoInteractions(client, mapper);
    }

    @Test
    void getOverview_connectedWithoutSite_returnsEmptyConnectedResponse() {
        UUID companyId = UUID.randomUUID();
        ScOverviewResponse expected = new ScOverviewResponse(
                true, null, null, 0, 0, 0, 0,
                List.of(), List.of(), List.of(), List.of(), List.of());
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(true);
        when(oAuthService.getSiteUrl(companyId)).thenReturn(Optional.empty());
        when(mapper.emptyConnectedResponse()).thenReturn(expected);

        assertThat(service.getOverview(companyId, null, null)).isSameAs(expected);
    }

    @Test
    void getOverview_queriesAllDimensionsAndDelegatesMapping() {
        UUID companyId = UUID.randomUUID();
        String siteUrl = "https://example.com";
        ScOverviewResponse expected = ScOverviewResponse.error(siteUrl, "mapped");
        when(oAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(true);
        when(oAuthService.getSiteUrl(companyId)).thenReturn(Optional.of(siteUrl));
        when(oAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.of("token"));
        when(mapper.resolveDate(anyString(), any())).thenReturn("2026-06-01", "2026-06-12");
        when(client.query(anyString(), anyString(), anyString(), anyString(), nullable(String.class), anyInt()))
                .thenReturn(List.of(QueryRow.empty()));
        when(mapper.toOverviewResponse(
                eq(siteUrl), anyList(), anyList(), anyList(), anyList(), anyList(), anyList()))
                .thenReturn(expected);

        assertThat(service.getOverview(companyId, "12daysAgo", "today")).isSameAs(expected);

        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", null, 1);
        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", "date", 500);
        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", "query", 10);
        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", "page", 10);
        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", "device", 5);
        verify(client).query("token", siteUrl, "2026-06-01", "2026-06-12", "country", 8);
    }
}
