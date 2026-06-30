package com.fogistanbul.crm.instagram.oauth.application;

import com.fogistanbul.crm.entity.Company;
import com.fogistanbul.crm.entity.enums.CompanyKind;
import com.fogistanbul.crm.instagram.infrastructure.InstagramGraphClient;
import com.fogistanbul.crm.instagram.oauth.domain.InstagramToken;
import com.fogistanbul.crm.instagram.oauth.infrastructure.InstagramTokenRepository;
import com.fogistanbul.crm.repository.CompanyRepository;
import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramOAuthServiceTest {

    @Mock
    private InstagramTokenRepository tokenRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private InstagramGraphClient graphClient;

    private InstagramOAuthService service;

    @BeforeEach
    void setUp() {
        service = new InstagramOAuthService(tokenRepository, companyRepository, graphClient);
        ReflectionTestUtils.setField(service, "appId", "app-id");
        ReflectionTestUtils.setField(service, "appSecret", "secret");
        ReflectionTestUtils.setField(service, "redirectUri", "https://redirect.uri");
        ReflectionTestUtils.setField(service, "frontendUrl", "https://frontend");
    }

    @Test
    void isConfigured_returnsTrueWhenAppIdAndSecretPresent() {
        assertThat(service.isConfigured()).isTrue();
    }

    @Test
    void isConfigured_returnsFalseWhenAppIdBlank() {
        ReflectionTestUtils.setField(service, "appId", "");
        assertThat(service.isConfigured()).isFalse();
    }

    @Test
    void isConfigured_returnsFalseWhenAppSecretBlank() {
        ReflectionTestUtils.setField(service, "appSecret", "");
        assertThat(service.isConfigured()).isFalse();
    }

    @Test
    void buildAuthorizationUrl_containsRequiredParameters() {
        UUID companyId = UUID.randomUUID();

        String url = service.buildAuthorizationUrl(companyId);

        assertThat(url)
                .contains("client_id=app-id")
                .contains("redirect_uri=https://redirect.uri")
                .contains("scope=pages_show_list")
                .contains("state=" + companyId);
    }

    @Test
    void buildAuthorizationUrl_includesSafeReturnPathInState() {
        UUID companyId = UUID.randomUUID();

        String url = service.buildAuthorizationUrl(companyId, "/client/instagram/reels");

        assertThat(url)
                .contains("state=")
                .contains(companyId.toString())
                .contains("client")
                .contains("instagram")
                .contains("reels");
    }

    @Test
    void buildAuthorizationUrl_ignoresUnsafeReturnPath() {
        UUID companyId = UUID.randomUUID();

        String url = service.buildAuthorizationUrl(companyId, "https://evil.example");

        assertThat(url).contains("state=" + companyId);
        assertThat(url).doesNotContain("evil.example");
    }

    @Test
    void handleCallback_savesNewTokenWithExpiryAndIgInfo() {
        UUID companyId = UUID.randomUUID();
        Company company = Company.builder()
                .id(companyId)
                .kind(CompanyKind.CLIENT)
                .name("Test Co")
                .build();
        when(graphClient.exchangeCodeForToken("code", "https://redirect.uri"))
                .thenReturn("short-token");
        when(graphClient.exchangeForLongLivedToken("short-token"))
                .thenReturn(Map.of("access_token", "long-token", "expires_in", 3600));
        when(graphClient.findInstagramAccount("long-token"))
                .thenReturn(Map.of("igUserId", "ig-1", "pageId", "page-1", "username", "fogistanbul"));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.empty());

        String returnPath = service.handleCallback("code", companyId + ":/client/instagram/posts");

        ArgumentCaptor<InstagramToken> captor = ArgumentCaptor.forClass(InstagramToken.class);
        verify(tokenRepository).save(captor.capture());
        InstagramToken saved = captor.getValue();
        assertThat(saved.getCompany()).isEqualTo(company);
        assertThat(saved.getAccessToken()).isEqualTo("long-token");
        assertThat(saved.getIgUserId()).isEqualTo("ig-1");
        assertThat(saved.getIgUsername()).isEqualTo("fogistanbul");
        assertThat(saved.getPageId()).isEqualTo("page-1");
        assertThat(saved.getTokenExpiry()).isAfter(Instant.now().plusSeconds(3000));
        assertThat(returnPath).isEqualTo("/client/instagram/posts");
    }

    @Test
    void handleCallback_updatesExistingToken() {
        UUID companyId = UUID.randomUUID();
        Company company = Company.builder().id(companyId).kind(CompanyKind.CLIENT).name("Test").build();
        InstagramToken existing = InstagramToken.builder()
                .id(UUID.randomUUID())
                .company(company)
                .accessToken("old-token")
                .igUserId("old-ig")
                .build();
        when(graphClient.exchangeCodeForToken("code", "https://redirect.uri")).thenReturn("short");
        when(graphClient.exchangeForLongLivedToken("short"))
                .thenReturn(Map.of("access_token", "new-token", "expires_in", 7200));
        when(graphClient.findInstagramAccount("new-token"))
                .thenReturn(Map.of("igUserId", "new-ig", "pageId", "new-page", "username", "newuser"));
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(existing));

        service.handleCallback("code", companyId.toString());

        assertThat(existing.getAccessToken()).isEqualTo("new-token");
        assertThat(existing.getIgUserId()).isEqualTo("new-ig");
        assertThat(existing.getIgUsername()).isEqualTo("newuser");
        assertThat(existing.getPageId()).isEqualTo("new-page");
        verify(tokenRepository).save(existing);
    }

    @Test
    void handleCallback_throwsWhenCompanyNotFound() {
        UUID companyId = UUID.randomUUID();
        when(graphClient.exchangeCodeForToken("code", "https://redirect.uri")).thenReturn("short");
        when(graphClient.exchangeForLongLivedToken("short"))
                .thenReturn(Map.of("access_token", "long", "expires_in", 3600));
        when(graphClient.findInstagramAccount("long"))
                .thenReturn(Map.of("igUserId", "ig", "pageId", "page", "username", "u"));
        when(companyRepository.findById(companyId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.handleCallback("code", companyId.toString()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Şirket bulunamadı");
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void handleCallback_throwsWhenLongLivedTokenIsMissing() {
        UUID companyId = UUID.randomUUID();
        when(graphClient.exchangeCodeForToken("code", "https://redirect.uri")).thenReturn("short");
        when(graphClient.exchangeForLongLivedToken("short")).thenReturn(Map.of("expires_in", 3600));

        assertThatThrownBy(() -> service.handleCallback("code", companyId.toString()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Instagram long-lived token");
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void getValidAccessToken_returnsExistingTokenWhenNotExpiring() {
        UUID companyId = UUID.randomUUID();
        InstagramToken token = InstagramToken.builder()
                .id(UUID.randomUUID())
                .accessToken("stable-token")
                .tokenExpiry(Instant.now().plusSeconds(86400 * 30))
                .build();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(token));

        Optional<String> result = service.getValidAccessToken(companyId);

        assertThat(result).contains("stable-token");
        verify(graphClient, never()).refreshLongLivedToken(any());
    }

    @Test
    void getValidAccessToken_refreshesWhenExpiringSoon() {
        UUID companyId = UUID.randomUUID();
        InstagramToken token = InstagramToken.builder()
                .id(UUID.randomUUID())
                .accessToken("old-token")
                .tokenExpiry(Instant.now().plusSeconds(60))
                .build();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(token));
        when(graphClient.refreshLongLivedToken("old-token"))
                .thenReturn(Map.of("access_token", "refreshed", "expires_in", 5184000));

        Optional<String> result = service.getValidAccessToken(companyId);

        assertThat(result).contains("refreshed");
        assertThat(token.getAccessToken()).isEqualTo("refreshed");
        verify(tokenRepository).save(token);
    }

    @Test
    void getValidAccessToken_returnsOriginalOnRefreshFailure() {
        UUID companyId = UUID.randomUUID();
        Company company = Company.builder().id(companyId).kind(CompanyKind.CLIENT).name("Test").build();
        InstagramToken token = InstagramToken.builder()
                .id(UUID.randomUUID())
                .company(company)
                .accessToken("original-token")
                .tokenExpiry(Instant.now().plusSeconds(60))
                .build();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(token));
        when(graphClient.refreshLongLivedToken("original-token"))
                .thenThrow(new RuntimeException("network error"));

        Optional<String> result = service.getValidAccessToken(companyId);

        assertThat(result).contains("original-token");
    }

    @Test
    void getValidAccessToken_emptyWhenNoTokenExists() {
        UUID companyId = UUID.randomUUID();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.empty());

        assertThat(service.getValidAccessToken(companyId)).isEmpty();
    }

    @Test
    void disconnect_deletesTokenByCompanyId() {
        UUID companyId = UUID.randomUUID();

        service.disconnect(companyId);

        verify(tokenRepository).deleteByCompanyId(companyId);
    }

    @Test
    void isConnected_delegatesToRepository() {
        UUID companyId = UUID.randomUUID();
        when(tokenRepository.existsByCompanyId(companyId)).thenReturn(true);

        assertThat(service.isConnected(companyId)).isTrue();
    }

    @Test
    void getToken_returnsFromRepository() {
        UUID companyId = UUID.randomUUID();
        InstagramToken token = InstagramToken.builder().id(UUID.randomUUID()).accessToken("x").build();
        when(tokenRepository.findByCompanyId(companyId)).thenReturn(Optional.of(token));

        assertThat(service.getToken(companyId)).contains(token);
    }

    @Test
    void getFrontendUrl_returnsConfiguredValue() {
        assertThat(service.getFrontendUrl()).isEqualTo("https://frontend");
    }
}
