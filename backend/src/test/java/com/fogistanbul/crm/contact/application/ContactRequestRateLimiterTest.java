package com.fogistanbul.crm.contact.application;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ContactRequestRateLimiterTest {

    @Test
    void allowsFiveRequestsAndRejectsTheSixthWithinTheWindow() {
        ContactRequestRateLimiter limiter = new ContactRequestRateLimiter();

        for (int attempt = 0; attempt < 5; attempt++) {
            assertThat(limiter.tryAcquire("client")).isTrue();
        }
        assertThat(limiter.tryAcquire("client")).isFalse();
        assertThat(limiter.tryAcquire("another-client")).isTrue();
    }
}
