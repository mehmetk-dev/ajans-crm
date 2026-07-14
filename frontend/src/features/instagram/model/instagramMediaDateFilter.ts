export type InstagramMediaDateRange = {
    start: string;
    end: string;
};

type TimestampedInstagramMedia = {
    timestamp: string;
};

function toLocalIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getCurrentMonthMediaRange(now = new Date()): InstagramMediaDateRange {
    return {
        start: toLocalIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
        end: toLocalIsoDate(now),
    };
}

export function filterInstagramMediaByDate<T extends TimestampedInstagramMedia>(
    items: readonly T[],
    start: string,
    end: string,
): T[] {
    if (!start || !end || start > end) {
        return [];
    }

    return items.filter((item) => {
        const date = /^\d{4}-\d{2}-\d{2}/.exec(item.timestamp)?.[0];
        return Boolean(date && date >= start && date <= end);
    });
}
