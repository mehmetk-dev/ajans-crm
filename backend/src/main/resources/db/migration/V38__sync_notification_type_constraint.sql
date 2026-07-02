-- Keep the notifications.type database constraint aligned with NotificationType.
ALTER TABLE notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
    ADD CONSTRAINT notifications_type_check
    CHECK (type IN (
        'TASK_ASSIGNED',
        'TASK_COMPLETED',
        'TASK_OVERDUE',
        'TASK_STATUS_CHANGED',
        'MESSAGE_RECEIVED',
        'APPROVAL_REQUEST',
        'APPROVAL_DECIDED',
        'MEETING_REMINDER',
        'SHOOT_CREATED',
        'SHOOT_REMINDER',
        'SHOOT_UPDATED',
        'CONTENT_PLAN_CREATED',
        'CONTENT_PLAN_UPDATED',
        'SURVEY_REQUEST',
        'FILE_SHARED',
        'SYSTEM'
    )) NOT VALID;

ALTER TABLE notifications
    VALIDATE CONSTRAINT notifications_type_check;
