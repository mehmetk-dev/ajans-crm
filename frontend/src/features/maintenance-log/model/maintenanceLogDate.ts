export function toLocalDateTimeInput(value = new Date().toISOString()): string {
    const date = new Date(value);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
        .toISOString()
        .slice(0, 16);
}

export function toIsoDateTime(value: string): string {
    return new Date(value).toISOString();
}

export function formatMaintenanceDate(value: string): string {
    return new Date(value).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}
