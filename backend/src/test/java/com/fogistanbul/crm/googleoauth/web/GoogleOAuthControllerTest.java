package com.fogistanbul.crm.googleoauth.web;

import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthControllerTest {

    @Mock GoogleOAuthService googleOAuthService;
    @InjectMocks GoogleOAuthController controller;

    @Test
    void deniedConsentReturnsToTheServicePageWithVisibleError() throws Exception {
        when(googleOAuthService.getRedirectPathForState("signed-state"))
                .thenReturn("/client/google-ads?connected=true");
        when(googleOAuthService.getFrontendUrl()).thenReturn("https://crm.example");
        MockHttpServletResponse response = new MockHttpServletResponse();

        controller.callback(null, "access_denied", "signed-state", response);

        assertThat(response.getRedirectedUrl())
                .startsWith("https://crm.example/client/google-ads")
                .contains("oauthError=")
                .doesNotContain("connected=true");
    }
}
