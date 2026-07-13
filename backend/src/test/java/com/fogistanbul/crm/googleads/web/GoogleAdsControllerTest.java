package com.fogistanbul.crm.googleads.web;

import com.fogistanbul.crm.exception.ApiException;
import com.fogistanbul.crm.googleads.application.GoogleAdsAccessPolicy;
import com.fogistanbul.crm.googleads.application.GoogleAdsService;
import com.fogistanbul.crm.googleads.dto.GoogleAdsCustomerIdRequest;
import com.fogistanbul.crm.googleoauth.application.GoogleOAuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAdsControllerTest {

    @Mock GoogleAdsService googleAdsService;
    @Mock GoogleOAuthService googleOAuthService;
    @Mock GoogleAdsAccessPolicy accessPolicy;
    @Mock Authentication authentication;
    @InjectMocks GoogleAdsController controller;

    @Test
    void statusKeepsConnectionAndScopeAsSeparateSignals() {
        UUID companyId = authenticatedCompany();
        when(googleOAuthService.getValidAccessToken(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of("access"));
        when(googleOAuthService.hasAdsScope(companyId)).thenReturn(false);
        when(googleOAuthService.buildAuthorizationUrl(companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn("https://accounts.google.test/auth");

        var response = controller.status(companyId, authentication);

        assertThat(response.connected()).isTrue();
        assertThat(response.hasAdsScope()).isFalse();
    }

    @Test
    void saveCustomerIdRejectsInvalidValue() {
        UUID companyId = authenticatedCompany();

        assertThatThrownBy(() -> controller.saveCustomerId(
                companyId, new GoogleAdsCustomerIdRequest("123"), authentication))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("10 haneli");
        verifyNoInteractions(googleAdsService);
    }

    @Test
    void saveCustomerIdNormalizesHyphenatedValue() {
        UUID companyId = authenticatedCompany();

        controller.saveCustomerId(
                companyId, new GoogleAdsCustomerIdRequest("123-456-7890"), authentication);

        verify(googleOAuthService).saveAdsCustomerId(companyId, "1234567890");
    }

    private UUID authenticatedCompany() {
        UUID companyId = UUID.randomUUID();
        when(authentication.getPrincipal()).thenReturn(companyId);
        return companyId;
    }
}
