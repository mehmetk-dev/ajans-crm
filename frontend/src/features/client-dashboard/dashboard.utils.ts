export const fmt = (n: number) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toLocaleString('tr-TR');
};

export const pct = (n: number) => (n * 100).toFixed(1) + '%';

export const dur = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}dk ${sec}sn` : `${sec}sn`;
};