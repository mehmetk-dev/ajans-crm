package com.fogistanbul.crm.metaads.web;

import com.fogistanbul.crm.instagram.oauth.application.InstagramOAuthService;
import com.fogistanbul.crm.metaads.application.MetaAdsAccessPolicy;
import com.fogistanbul.crm.metaads.application.MetaAdsAccountService;
import com.fogistanbul.crm.metaads.application.MetaAdsService;
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
class MetaAdsControllerTest {

    @Mock
    MetaAdsService metaAdsService;

    @Mock
    InstagramOAuthService oAuthService;

    @Mock
    MetaAdsAccountService accountService;

    @Mock
    MetaAdsAccessPolicy accessPolicy;

    @Mock
    Authentication authentication;

    MetaAdsController controller;

    @BeforeEach
    void setUp() {
        controller = new MetaAdsController(
                metaAdsService,
                oAuthService,
                accountService,
                accessPolicy);
    }

    @Test
    void status_returnsReconnectUrlForConnectedAccountAndKeepsRequestedReturnPath() {
        UUID userId = UUID.randomUUID();
        UUID companyId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(userId);
        when(oAuthService.isConnected(companyId)).thenReturn(true);
        when(accountService.getAdAccountId(companyId)).thenReturn(Optional.of("act_123"));
        when(oAuthService.buildAuthorizationUrl(companyId, "/client/meta-ads"))
                .thenReturn("https://meta.example/oauth");

        var response = controller.status(companyId, "/client/meta-ads", authentication);

        assertThat(response.connected()).isTrue();
        assertThat(response.authUrl()).isEqualTo("https://meta.example/oauth");
        verify(accessPolicy).requireClientAccess(userId, companyId);
    }
}
