import type { NotificationResponse } from '../api/features';

const refRoutes: Record<string, Record<string, string>> = {
    client: {
        TASK: '/client/tasks',
        SHOOT: '/client/shoots',
        CONTENT_PLAN: '/client/content-plans',
        MESSAGE: '/client/messaging',
        GROUP_MESSAGE: '/client/messaging',
        APPROVAL_REQUEST: '/client/services',
    },
    staff: {
        TASK: '/staff/tasks',
        SHOOT: '/staff/shoots',
        CONTENT_PLAN: '/staff/content-plans',
        MESSAGE: '/staff/messaging',
        GROUP_MESSAGE: '/staff/messaging',
        APPROVAL_REQUEST: '/staff/requests',
    },
    admin: {
        TASK: '/admin/tasks',
        SHOOT: '/admin/shoots',
        CONTENT_PLAN: '/admin/content-plans',
        MESSAGE: '/admin/messaging',
        GROUP_MESSAGE: '/admin/messaging',
        APPROVAL_REQUEST: '/admin/requests',
    },
};

type NotificationPanel = 'client' | 'staff' | 'admin';
type RoutableNotification = Pick<NotificationResponse, 'referenceType' | 'referenceId'>;

export function getNotificationRoute(panel: NotificationPanel, notification: RoutableNotification): string | null {
    if (!notification.referenceType) return null;
    const baseRoute = refRoutes[panel]?.[notification.referenceType];
    if (!baseRoute) return null;
    if (notification.referenceType === 'MESSAGE' && notification.referenceId) {
        return `${baseRoute}?conversationId=${notification.referenceId}`;
    }
    if (notification.referenceType === 'GROUP_MESSAGE' && notification.referenceId) {
        return `${baseRoute}?groupId=${notification.referenceId}`;
    }
    return baseRoute;
}
