package com.fogistanbul.crm.searchconsole.web;

import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleAccessPolicy;
import com.fogistanbul.crm.searchconsole.application.SearchConsoleService;
import com.fogistanbul.crm.searchconsole.dto.ScStatusResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SearchConsoleControllerTest {

    @Mock
    SearchConsoleService searchConsoleService;

    @Mock
    GoogleOAuthService googleOAuthService;

    @Mock
    SearchConsoleAccessPolicy accessPolicy;

    @Mock
    Authentication authentication;

    SearchConsoleController controller;

    @BeforeEach
    void setUp() {
        controller = new SearchConsoleController(
                searchConsoleService,
                googleOAuthService,
                accessPolicy);
    }

    @Test
    void status_refreshesExpiredAccessTokenBeforeRequestingReconnect() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(userId);
        when(googleOAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(true);
        when(googleOAuthService.hasScScope(companyId)).thenReturn(true);
        when(googleOAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.of("refreshed-token"));
        when(googleOAuthService.getSiteUrl(companyId)).thenReturn(Optional.of("sc-domain:example.com"));
        when(googleOAuthService.buildAuthorizationUrl(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn("https://google.example/oauth");

        ScStatusResponse result = controller.status(companyId, authentication);

        assertThat(result.connected()).isTrue();
        assertThat(result.hasScScope()).isTrue();
        assertThat(result.needsReconnect()).isFalse();
        verify(googleOAuthService)
                .getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);
    }

    @Test
    void status_requestsReconnectOnlyWhenStoredConnectionCannotBeRefreshed() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(userId);
        when(googleOAuthService.isConnected(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(true);
        when(googleOAuthService.hasScScope(companyId)).thenReturn(true);
        when(googleOAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.empty());
        when(googleOAuthService.getSiteUrl(companyId)).thenReturn(Optional.of("sc-domain:example.com"));
        when(googleOAuthService.buildAuthorizationUrl(companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn("https://google.example/oauth");

        ScStatusResponse result = controller.status(companyId, authentication);

        assertThat(result.connected()).isTrue();
        assertThat(result.needsReconnect()).isTrue();
    }
}
