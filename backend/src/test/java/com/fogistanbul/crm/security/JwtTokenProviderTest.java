package com.fogistanbul.crm.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtTokenProviderTest {

    @Test
    void rejectsJwtSecretShorterThanThirtyTwoCharacters() {
        assertThatThrownBy(() -> new JwtTokenProvider("too-short-secret", 900_000L, 86_400_000L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("JWT secret must be at least 32 characters");
    }
}
