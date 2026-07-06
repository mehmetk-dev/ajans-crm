package com.fogistanbul.crm.instagram.infrastructure;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.fogistanbul.crm.exception.ApiException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InstagramGraphClientTest {

    @Mock
    private RestTemplate restTemplate;

    private InstagramGraphClient client;

    @BeforeEach
    void setUp() {
        client = new InstagramGraphClient(restTemplate);
        ReflectionTestUtils.setField(client, "appId", "app-id-123");
        ReflectionTestUtils.setField(client, "appSecret", "secret-xyz");
    }

    @Test
    void exchangeCodeForToken_returnsAccessTokenFromResponse() {
        Map<String, Object> body = Map.of("access_token", "short-token", "token_type", "bearer");
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(body));

        String token = client.exchangeCodeForToken("auth-code", "https://redirect.uri");

        assertThat(token).isEqualTo("short-token");
        verify(restTemplate).getForEntity(any(String.class), eq(Map.class));
    }

    @Test
    void exchangeCodeForToken_throwsWhenBodyIsNull() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(null));

        assertThatThrownBy(() -> client.exchangeCodeForToken("code", "https://redirect.uri"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Facebook token exchange");
    }

    @Test
    void exchangeCodeForToken_throwsWhenAccessTokenMissingInBody() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("token_type", "bearer")));

        assertThatThrownBy(() -> client.exchangeCodeForToken("code", "https://redirect.uri"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("access_token boş");
    }

    @Test
    void exchangeCodeForToken_throwsWhenStatusIsError() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of()));

        assertThatThrownBy(() -> client.exchangeCodeForToken("code", "https://redirect.uri"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Facebook token exchange");
    }

    @Test
    void exchangeForLongLivedToken_returnsResponseMap() {
        Map<String, Object> body = Map.of("access_token", "long-token", "expires_in", 5184000);
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(body));

        Map<String, Object> result = client.exchangeForLongLivedToken("short-token");

        assertThat(result).containsEntry("access_token", "long-token");
    }

    @Test
    void exchangeForLongLivedToken_throwsOnError() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null));

        assertThatThrownBy(() -> client.exchangeForLongLivedToken("short-token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Long-lived token");
    }

    @Test
    void getGrantedPermissions_returnsOnlyGrantedPermissionNames() {
        Map<String, Object> body = Map.of("data", List.of(
                Map.of("permission", "instagram_basic", "status", "granted"),
                Map.of("permission", "instagram_manage_insights", "status", "declined"),
                Map.of("permission", "pages_show_list", "status", "granted")));
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(body));

        Set<String> result = client.getGrantedPermissions("token");

        assertThat(result).containsExactly("instagram_basic", "pages_show_list");
    }

    @Test
    void getGrantedPermissions_throwsWhenBodyIsNull() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(null));

        assertThatThrownBy(() -> client.getGrantedPermissions("token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Instagram izinleri");
    }

    @Test
    void findInstagramAccount_returnsIgAndPageIdsAndUsername() {
        Map<String, Object> page = Map.of(
                "id", "page-1",
                "instagram_business_account", Map.of("id", "ig-1"));
        Map<String, Object> pagesResponseBody = Map.of("data", List.of(page));
        Map<String, Object> igResponseBody = Map.of("username", "fogistanbul");
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(pagesResponseBody))
                .thenReturn(ResponseEntity.ok(igResponseBody));

        Map<String, String> result = client.findInstagramAccount("token");

        assertThat(result).containsEntry("igUserId", "ig-1");
        assertThat(result).containsEntry("pageId", "page-1");
        assertThat(result).containsEntry("username", "fogistanbul");
    }

    @Test
    void findInstagramAccount_throwsWhenNoPagesExist() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("data", List.of())));

        assertThatThrownBy(() -> client.findInstagramAccount("token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Hiçbir Facebook sayfası bulunamadı");
    }

    @Test
    void findInstagramAccount_throwsWhenNoBusinessAccountLinked() {
        Map<String, Object> page = Map.of("id", "page-1");
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(Map.of("data", List.of(page))));

        assertThatThrownBy(() -> client.findInstagramAccount("token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Instagram Business hesabı bulunamadı");
    }

    @Test
    void findInstagramAccount_throwsWhenPagesBodyIsNull() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(null));

        assertThatThrownBy(() -> client.findInstagramAccount("token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Facebook sayfaları alınamadı");
    }

    @Test
    void refreshLongLivedToken_returnsResponseOnSuccess() {
        Map<String, Object> body = Map.of("access_token", "renewed-token", "expires_in", 5184000);
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.ok(body));

        Map<String, Object> result = client.refreshLongLivedToken("old-token");

        assertThat(result).containsEntry("access_token", "renewed-token");
    }

    @Test
    void refreshLongLivedToken_throwsOnFailure() {
        when(restTemplate.getForEntity(any(String.class), eq(Map.class)))
                .thenReturn(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null));

        assertThatThrownBy(() -> client.refreshLongLivedToken("old-token"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Instagram token yenileme");
    }
}
