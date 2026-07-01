package com.fogistanbul.crm.integrationsnapshot.dto;

import com.fogistanbul.crm.integrationsnapshot.domain.IntegrationSnapshotStatus;

import java.time.Instant;

public record IntegrationSnapshotMetaResponse(
        IntegrationSnapshotStatus status,
        Instant lastSyncedAt,
        Instant nextSyncAt,
        boolean stale,
        String errorMessage
) {
    public static IntegrationSnapshotMetaResponse pending() {
        return new IntegrationSnapshotMetaResponse(
                IntegrationSnapshotStatus.PENDING,
                null,
                null,
                false,
                null);
    }
}
