package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.exception.ApiException;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleOAuthStateCodecTest {

    private static final Instant NOW = Instant.parse("2026-07-14T10:00:00Z");
    private static final String SECRET = "test-state-secret-with-enough-entropy";

    @Test
    void roundTripPreservesCompanyAndServiceWithoutExposingRawState() {
        UUID companyId = UUID.randomUUID();
        GoogleOAuthStateCodec codec = codecAt(NOW);

        String encoded = codec.encode(companyId, GoogleServiceRegistry.SVC_GOOGLE_ADS);
        GoogleOAuthStateCodec.OAuthState decoded = codec.decode(encoded);

        assertThat(encoded).doesNotContain(companyId + ":GOOGLE_ADS");
        assertThat(decoded.companyId()).isEqualTo(companyId);
        assertThat(decoded.serviceType()).isEqualTo(GoogleServiceRegistry.SVC_GOOGLE_ADS);
    }

    @Test
    void tamperedAndExpiredStatesAreRejected() {
        GoogleOAuthStateCodec codec = codecAt(NOW);
        String encoded = codec.encode(UUID.randomUUID(), GoogleServiceRegistry.SVC_GOOGLE_ADS);

        assertThatThrownBy(() -> codec.decode(encoded + "x"))
                .isInstanceOf(ApiException.class);

        GoogleOAuthStateCodec laterCodec = codecAt(NOW.plusSeconds(601));
        assertThatThrownBy(() -> laterCodec.decode(encoded))
                .isInstanceOf(ApiException.class);
    }

    private GoogleOAuthStateCodec codecAt(Instant instant) {
        return new GoogleOAuthStateCodec(SECRET, Clock.fixed(instant, ZoneOffset.UTC));
    }
}
