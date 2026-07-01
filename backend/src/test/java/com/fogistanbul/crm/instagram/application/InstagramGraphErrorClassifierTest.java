package com.fogistanbul.crm.instagram.application;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class InstagramGraphErrorClassifierTest {

    @Test
    void detectsInvalidAccessTokenErrors() {
        RuntimeException exception = new RuntimeException(
                "{\"error\":{\"message\":\"Error validating access token\", \"code\":190}}");

        assertThat(InstagramGraphErrorClassifier.isInvalidAccessToken(exception)).isTrue();
    }

    @Test
    void doesNotTreatPermissionErrorsAsInvalidToken() {
        RuntimeException exception = new RuntimeException(
                "{\"error\":{\"message\":\"API access blocked\", \"type\":\"OAuthException\", \"code\":200}}");

        assertThat(InstagramGraphErrorClassifier.isInvalidAccessToken(exception)).isFalse();
    }
}
