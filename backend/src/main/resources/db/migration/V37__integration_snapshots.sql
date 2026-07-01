CREATE TABLE IF NOT EXISTS integration_snapshots (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    integration_type VARCHAR(40) NOT NULL,
    snapshot_type VARCHAR(40) NOT NULL,
    period_start DATE,
    period_end DATE,
    payload_json JSONB,
    status VARCHAR(20) NOT NULL,
    last_synced_at TIMESTAMPTZ,
    next_sync_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE integration_snapshots
    ADD CONSTRAINT uq_integration_snapshots_company_type
    UNIQUE (company_id, integration_type, snapshot_type);

CREATE INDEX IF NOT EXISTS idx_integration_snapshots_company_type
    ON integration_snapshots(company_id, integration_type, snapshot_type);

CREATE INDEX IF NOT EXISTS idx_integration_snapshots_next_sync
    ON integration_snapshots(next_sync_at)
    WHERE next_sync_at IS NOT NULL;
