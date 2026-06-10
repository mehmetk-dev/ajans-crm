export function formatPrProjectDate(value: string | null) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('tr-TR');
}

export function toOptional(value: string) {
    const normalized = value.trim();
    return normalized || undefined;
}
