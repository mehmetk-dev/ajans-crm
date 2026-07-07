import type { NotificationResponse } from '../api/features';

export const NOTIFICATION_SOUND_STORAGE_KEY = 'crm.notificationSoundEnabled';
export const DESKTOP_NOTIFICATION_STORAGE_KEY = 'crm.desktopNotificationsEnabled';

type BrowserNotificationPermission = NotificationPermission | 'unsupported';

export interface BrowserNotificationPreferences {
    soundEnabled: boolean;
    desktopEnabled: boolean;
    desktopPermission: BrowserNotificationPermission;
}

type WindowWithWebkitAudio = Window & typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
};

function canUseStorage() {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStoredBoolean(key: string, fallback = false) {
    if (!canUseStorage()) return fallback;
    return window.localStorage.getItem(key) === 'true';
}

function writeStoredBoolean(key: string, value: boolean) {
    if (!canUseStorage()) return;
    window.localStorage.setItem(key, String(value));
}

function getDesktopPermission(): BrowserNotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

export function getBrowserNotificationPreferences(): BrowserNotificationPreferences {
    const desktopPermission = getDesktopPermission();
    const desktopEnabled = desktopPermission === 'granted'
        && readStoredBoolean(DESKTOP_NOTIFICATION_STORAGE_KEY);

    return {
        soundEnabled: readStoredBoolean(NOTIFICATION_SOUND_STORAGE_KEY),
        desktopEnabled,
        desktopPermission,
    };
}

export function setNotificationSoundEnabled(enabled: boolean): BrowserNotificationPreferences {
    writeStoredBoolean(NOTIFICATION_SOUND_STORAGE_KEY, enabled);
    return getBrowserNotificationPreferences();
}

export async function setDesktopNotificationsEnabled(enabled: boolean): Promise<BrowserNotificationPreferences> {
    if (!enabled) {
        writeStoredBoolean(DESKTOP_NOTIFICATION_STORAGE_KEY, false);
        return getBrowserNotificationPreferences();
    }

    if (typeof window === 'undefined' || !('Notification' in window)) {
        writeStoredBoolean(DESKTOP_NOTIFICATION_STORAGE_KEY, false);
        return getBrowserNotificationPreferences();
    }

    let permission = Notification.permission;
    if (permission === 'default') {
        permission = await Notification.requestPermission();
    }

    writeStoredBoolean(DESKTOP_NOTIFICATION_STORAGE_KEY, permission === 'granted');
    return getBrowserNotificationPreferences();
}

export function playNotificationSound(): boolean {
    if (!readStoredBoolean(NOTIFICATION_SOUND_STORAGE_KEY)) return false;
    if (typeof window === 'undefined') return false;

    const AudioContextCtor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextCtor) return false;

    try {
        const context = new AudioContextCtor();
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, now);
        oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.18);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.24);
        window.setTimeout(() => void context.close(), 320);
        return true;
    } catch {
        return false;
    }
}

export function showDesktopNotification(notification: NotificationResponse): boolean {
    const prefs = getBrowserNotificationPreferences();
    if (!prefs.desktopEnabled || prefs.desktopPermission !== 'granted') return false;
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return false;

    const browserNotification = new Notification(notification.title, {
        body: notification.message ?? undefined,
        tag: notification.id,
        icon: '/favicon.ico',
    });

    browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
    };

    return true;
}

export function notifyIncomingBrowserNotification(notification: NotificationResponse) {
    return {
        soundPlayed: playNotificationSound(),
        desktopShown: showDesktopNotification(notification),
    };
}
