import { CalendarRange } from 'lucide-react';

import type { InstagramMediaDateRange } from '../model/instagramMediaDateFilter';

type InstagramMediaDateRangeFilterProps = {
    value: InstagramMediaDateRange;
    min: string;
    max: string;
    onChange: (value: InstagramMediaDateRange) => void;
};

export function InstagramMediaDateRangeFilter({
    value,
    min,
    max,
    onChange,
}: InstagramMediaDateRangeFilterProps) {
    const changeStart = (start: string) => {
        onChange({ start, end: start > value.end ? start : value.end });
    };
    const changeEnd = (end: string) => {
        onChange({ start: end < value.start ? end : value.start, end });
    };

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.06] bg-[#0C0C0E] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10">
                    <CalendarRange className="h-4 w-4 text-pink-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-white">Tarih aralığı</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">
                        Bu ayın snapshot verisindeki en fazla 24 içerik filtrelenir.
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="instagram-media-start">Başlangıç tarihi</label>
                <input
                    id="instagram-media-start"
                    aria-label="Başlangıç tarihi"
                    type="date"
                    value={value.start}
                    min={min}
                    max={max}
                    onChange={(event) => changeStart(event.target.value)}
                    className="rounded-xl border border-white/[0.08] bg-[#16161a] px-3 py-2 text-sm text-zinc-300 outline-none transition-colors focus:border-pink-500/40"
                />
                <span className="text-xs text-zinc-600">–</span>
                <label className="sr-only" htmlFor="instagram-media-end">Bitiş tarihi</label>
                <input
                    id="instagram-media-end"
                    aria-label="Bitiş tarihi"
                    type="date"
                    value={value.end}
                    min={min}
                    max={max}
                    onChange={(event) => changeEnd(event.target.value)}
                    className="rounded-xl border border-white/[0.08] bg-[#16161a] px-3 py-2 text-sm text-zinc-300 outline-none transition-colors focus:border-pink-500/40"
                />
            </div>
        </div>
    );
}
