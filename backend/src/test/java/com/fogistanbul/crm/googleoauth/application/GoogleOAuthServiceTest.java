package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.googleoauth.domain.GoogleOAuthToken;
import com.fogistanbul.crm.googleoauth.infrastructure.GoogleOAuthTokenRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleOAuthServiceTest {

    @Mock
    GoogleOAuthTokenRepository tokenRepository;

    @Mock
    CompanyRepository companyRepository;

    @Mock
    GoogleTokenHttpClient tokenHttpClient;

    @InjectMocks
    GoogleOAuthService service;

    @Test
    void getValidAccessToken_disconnectsExpiredTokenWhenRefreshFails() {
        UUID companyId = UUID.randomUUID();
        Company company = Company.builder().id(companyId).build();
        GoogleOAuthToken token = GoogleOAuthToken.builder()
                .company(company)
                .serviceType(GoogleOAuthService.SVC_SEARCH_CONSOLE)
                .accessToken("expired-access-token")
                .refreshToken("revoked-refresh-token")
                .tokenExpiry(Instant.now().minusSeconds(30))
                .build();

        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.of(token));
        when(tokenHttpClient.refreshAccessToken(token)).thenReturn(null);

        Optional<String> accessToken = service.getValidAccessToken(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);

        assertThat(accessToken).isEmpty();
        verify(tokenRepository).deleteByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE);
    }

    @Test
    void saveAdsAccountSelectionRejectsDisconnectedCompany() {
        UUID companyId = UUID.randomUUID();
        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.saveAdsAccountSelection(
                companyId, "1234567890", "1234567890"))
                .isInstanceOf(com.fogistanbul.crm.exception.ApiException.class);
    }

    @Test
    void saveAdsAccountSelectionStoresTargetAndLoginCustomerIds() {
        UUID companyId = UUID.randomUUID();
        GoogleOAuthToken token = GoogleOAuthToken.builder()
                .serviceType(GoogleOAuthService.SVC_GOOGLE_ADS)
                .adsCustomerId("1111111111")
                .build();
        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of(token));

        boolean customerChanged = service.saveAdsAccountSelection(
                companyId, "2222222222", "8437875152");

        assertThat(customerChanged).isTrue();
        assertThat(token.getAdsCustomerId()).isEqualTo("2222222222");
        assertThat(token.getAdsLoginCustomerId()).isEqualTo("8437875152");
        verify(tokenRepository).save(token);
    }

    @Test
    void saveAdsAccountSelectionReportsUnchangedTargetForDirectAccess() {
        UUID companyId = UUID.randomUUID();
        GoogleOAuthToken token = GoogleOAuthToken.builder()
                .serviceType(GoogleOAuthService.SVC_GOOGLE_ADS)
                .adsCustomerId("2222222222")
                .adsLoginCustomerId("8437875152")
                .build();
        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of(token));

        boolean customerChanged = service.saveAdsAccountSelection(
                companyId, "2222222222", "2222222222");

        assertThat(customerChanged).isFalse();
        assertThat(token.getAdsLoginCustomerId()).isEqualTo("2222222222");
    }

    @Test
    void hasScScope_checksTheGrantedScopeInsteadOfTokenExistence() {
        UUID companyId = UUID.randomUUID();
        GoogleOAuthToken searchConsoleToken = GoogleOAuthToken.builder()
                .serviceType(GoogleOAuthService.SVC_SEARCH_CONSOLE)
                .scope("openid https://www.googleapis.com/auth/webmasters.readonly")
                .build();
        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_SEARCH_CONSOLE))
                .thenReturn(Optional.of(searchConsoleToken));

        assertThat(service.hasScScope(companyId)).isTrue();

        searchConsoleToken.setScope("openid email");
        assertThat(service.hasScScope(companyId)).isFalse();
    }

    @Test
    void hasAdsScope_matchesAnExactGrantedScope() {
        UUID companyId = UUID.randomUUID();
        GoogleOAuthToken adsToken = GoogleOAuthToken.builder()
                .serviceType(GoogleOAuthService.SVC_GOOGLE_ADS)
                .scope("openid prefix-https://www.googleapis.com/auth/adwords-suffix")
                .build();
        when(tokenRepository.findByCompanyIdAndServiceType(
                companyId, GoogleOAuthService.SVC_GOOGLE_ADS))
                .thenReturn(Optional.of(adsToken));

        assertThat(service.hasAdsScope(companyId)).isFalse();

        adsToken.setScope("openid https://www.googleapis.com/auth/adwords email");
        assertThat(service.hasAdsScope(companyId)).isTrue();
    }
}
