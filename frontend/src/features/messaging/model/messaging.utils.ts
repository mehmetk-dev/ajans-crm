/** Returns a short relative time label (e.g. "5dk", "2sa", "3g"). */
export function timeAgo(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'şimdi';
    if (mins < 60) return `${mins}dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa`;
    const days = Math.floor(hours / 24);
    return `${days}g`;
}

/** Formats a date string as HH:MM in Turkish locale. */
export function formatMessageTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/** Returns a human-readable role label for display. */
export function getRoleLabel(
    globalRole: string | null | undefined,
    membershipRole: string | null | undefined,
    companyName: string | null | undefined
): string {
    if (companyName) {
        const roleLabel =
            membershipRole === 'OWNER' ? 'Şirket Sahibi' :
            membershipRole === 'EMPLOYEE' ? 'Şirket Çalışanı' :
            'Ajans Çalışanı';
        return `${companyName} · ${roleLabel}`;
    }
    if (globalRole === 'ADMIN') return 'Yönetici';
    if (globalRole === 'AGENCY_STAFF') return 'Ajans Çalışanı';
    return '';
}
