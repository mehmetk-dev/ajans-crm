package com.fogistanbul.crm.prproject.application;

import java.time.Instant;
import java.time.format.DateTimeParseException;

final class PrProjectDates {

    private PrProjectDates() {
    }

    static Instant parse(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Instant.parse(value.contains("T") ? value : value + "T00:00:00Z");
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Gecersiz tarih: " + value);
        }
    }
}
