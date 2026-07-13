package com.fogistanbul.crm.googleoauth.application;

import com.fogistanbul.crm.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Component
public class GoogleOAuthStateCodec {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final long MAX_AGE_SECONDS = 600;

    private final byte[] secret;
    private final Clock clock;

    @Autowired
    public GoogleOAuthStateCodec(@Value("${app.google-oauth.state-secret}") String secret) {
        this(secret, Clock.systemUTC());
    }

    GoogleOAuthStateCodec(String secret, Clock clock) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException("Google OAuth state secret en az 32 karakter olmalıdır");
        }
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.clock = clock;
    }

    public String encode(UUID companyId, String serviceType) {
        GoogleServiceRegistry.requireSupported(serviceType);
        String payload = companyId + "|" + serviceType + "|" + clock.instant().getEpochSecond()
                + "|" + UUID.randomUUID();
        String encodedPayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        return encodedPayload + "." + sign(encodedPayload);
    }

    public OAuthState decode(String state) {
        try {
            String[] stateParts = state.split("\\.", 2);
            if (stateParts.length != 2 || !MessageDigest.isEqual(
                    sign(stateParts[0]).getBytes(StandardCharsets.US_ASCII),
                    stateParts[1].getBytes(StandardCharsets.US_ASCII))) {
                throw invalidState();
            }

            String payload = new String(Base64.getUrlDecoder().decode(stateParts[0]), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split("\\|", 4);
            if (payloadParts.length != 4) {
                throw invalidState();
            }

            UUID companyId = UUID.fromString(payloadParts[0]);
            String serviceType = payloadParts[1];
            GoogleServiceRegistry.requireSupported(serviceType);
            Instant issuedAt = Instant.ofEpochSecond(Long.parseLong(payloadParts[2]));
            long age = clock.instant().getEpochSecond() - issuedAt.getEpochSecond();
            if (age < 0 || age > MAX_AGE_SECONDS) {
                throw invalidState();
            }
            return new OAuthState(companyId, serviceType);
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw invalidState();
        }
    }

    private String sign(String encodedPayload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return Base64.getUrlEncoder().withoutPadding()
                    .encodeToString(mac.doFinal(encodedPayload.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception exception) {
            throw new IllegalStateException("OAuth state imzalanamadı", exception);
        }
    }

    private ApiException invalidState() {
        return new ApiException(HttpStatus.BAD_REQUEST, "INVALID_OAUTH_STATE",
                "Google bağlantı isteği geçersiz veya süresi dolmuş");
    }

    public record OAuthState(UUID companyId, String serviceType) {}
}
