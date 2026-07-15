package com.fogistanbul.crm.googleads.application;

import com.fogistanbul.crm.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class GoogleAdsAccountOperationRateLimiter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_NANOS = Duration.ofMinutes(1).toNanos();
    private static final int MAX_TRACKED_KEYS = 10_000;

    private final Map<RateLimitKey, ArrayDeque<Long>> requests = new ConcurrentHashMap<>();

    public void check(UUID userId, UUID companyId) {
        long now = System.nanoTime();
        ArrayDeque<Long> timestamps = requests.computeIfAbsent(
                new RateLimitKey(userId, companyId), ignored -> new ArrayDeque<>());
        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() >= WINDOW_NANOS) {
                timestamps.removeFirst();
            }
            if (timestamps.size() >= MAX_REQUESTS) {
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "GOOGLE_ADS_ACCOUNT_RATE_LIMITED",
                        "Çok fazla Google Ads hesap isteği yapıldı. Bir dakika sonra tekrar deneyin");
            }
            timestamps.addLast(now);
        }
        if (requests.size() > MAX_TRACKED_KEYS) {
            requests.entrySet().removeIf(entry -> {
                ArrayDeque<Long> values = entry.getValue();
                synchronized (values) {
                    return values.isEmpty() || now - values.peekLast() >= WINDOW_NANOS;
                }
            });
        }
    }

    private record RateLimitKey(UUID userId, UUID companyId) {
    }
}
