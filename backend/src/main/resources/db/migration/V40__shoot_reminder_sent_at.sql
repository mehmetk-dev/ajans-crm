ALTER TABLE shoots
    ADD COLUMN shoot_reminder_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_shoots_reminder_due
    ON shoots (status, shoot_date, created_at)
    WHERE shoot_reminder_sent_at IS NULL;
