package com.fogistanbul.crm.security;

import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class CurrentUserTest {

    private final CurrentUser currentUser = new CurrentUser();

    @Test
    void uuidPrincipalIsReturned() {
        UUID userId = UUID.randomUUID();
        var authentication = new UsernamePasswordAuthenticationToken(userId, null);

        assertEquals(userId, currentUser.id(authentication));
    }

    @Test
    void nonUuidPrincipalIsRejected() {
        var authentication = new UsernamePasswordAuthenticationToken("user@example.com", null);

        ApiException exception = assertThrows(
                ApiException.class,
                () -> currentUser.id(authentication)
        );

        assertEquals("AUTHENTICATION_REQUIRED", exception.getCode());
    }
}
