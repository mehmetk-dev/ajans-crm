package com.fogistanbul.crm.contact.application;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ContactRequestRateLimiter {

    private static final int MAX_REQUESTS = 5;
    private static final long WINDOW_MILLIS = Duration.ofMinutes(15).toMillis();

    private final Map<String, ArrayDeque<Long>> requests = new ConcurrentHashMap<>();

    public boolean tryAcquire(String key) {
        long now = System.currentTimeMillis();
        ArrayDeque<Long> timestamps = requests.computeIfAbsent(key, ignored -> new ArrayDeque<>());
        synchronized (timestamps) {
            removeExpired(timestamps, now);
            if (timestamps.size() >= MAX_REQUESTS) {
                return false;
            }
            timestamps.addLast(now);
            return true;
        }
    }

    @Scheduled(fixedRate = 900_000)
    void cleanup() {
        long now = System.currentTimeMillis();
        requests.entrySet().removeIf(entry -> {
            ArrayDeque<Long> timestamps = entry.getValue();
            synchronized (timestamps) {
                removeExpired(timestamps, now);
                return timestamps.isEmpty();
            }
        });
    }

    private void removeExpired(ArrayDeque<Long> timestamps, long now) {
        while (!timestamps.isEmpty() && now - timestamps.peekFirst() >= WINDOW_MILLIS) {
            timestamps.removeFirst();
        }
    }
}
