package com.fogistanbul.crm.integrationsnapshot.dto;

import com.fogistanbul.crm.googleanalytics.dto.GaOverviewResponse;
import com.fogistanbul.crm.instagram.dto.InstagramOverviewResponse;
import com.fogistanbul.crm.searchconsole.dto.ScOverviewResponse;

public record ClientIntegrationSnapshotOverviewResponse(
        GaOverviewResponse ga,
        IntegrationSnapshotMetaResponse gaSnapshot,
        ScOverviewResponse sc,
        IntegrationSnapshotMetaResponse scSnapshot,
        InstagramOverviewResponse ig,
        IntegrationSnapshotMetaResponse igSnapshot
) {
}
