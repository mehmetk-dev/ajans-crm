import { useId } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DATE_PRESETS } from '../model/searchConsole.utils';

interface SCDateRangePickerProps {
    isCustomRange: boolean;
    activePreset: number;
    customStart: string;
    customEnd: string;
    showDateMenu: boolean;
    onToggleMenu: () => void;
    onSelectPreset: (index: number) => void;
    onSetCustomStart: (value: string) => void;
    onSetCustomEnd: (value: string) => void;
    onApplyCustomRange: () => void;
    onCloseMenu: () => void;
}

export function SCDateRangePicker({
    isCustomRange,
    activePreset,
    customStart,
    customEnd,
    showDateMenu,
    onToggleMenu,
    onSelectPreset,
    onSetCustomStart,
    onSetCustomEnd,
    onApplyCustomRange,
    onCloseMenu,
}: SCDateRangePickerProps) {
    const fid = useId();
    const canApply = Boolean(customStart && customEnd);

    return (
        <div className="relative">
            <button
                onClick={onToggleMenu}
                className="flex items-center gap-1.5 bg-[#0C0C0E] border border-white/[0.06] hover:border-white/[0.12] rounded-full px-3 py-1.5 transition-colors"
            >
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[11px] text-zinc-400">
                    {isCustomRange ? `${customStart} — ${customEnd}` : DATE_PRESETS[activePreset].label}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>
            {showDateMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={onCloseMenu} />
                    <div className="absolute right-0 top-full mt-2 z-50 bg-[#1a1a1f] border border-white/[0.08] rounded-xl shadow-2xl p-2 min-w-[220px]">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1">Hazır Aralıklar</p>
                        {DATE_PRESETS.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => onSelectPreset(i)}
                                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                                    !isCustomRange && activePreset === i
                                        ? 'bg-pink-500/10 text-pink-400'
                                        : 'text-zinc-300 hover:bg-white/[0.05]'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                        <div className="border-t border-white/[0.06] mt-2 pt-2">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-wider px-2 py-1">Özel Tarih Aralığı</p>
                            <div className="px-2 space-y-2 mt-1">
                                <div>
                                    <label htmlFor={`${fid}-scstart`} className="text-[10px] text-zinc-500">Başlangıç</label>
                                    <input id={`${fid}-scstart`} type="date" value={customStart}
                                        onChange={e => onSetCustomStart(e.target.value)}
                                        className="w-full bg-[#0C0C0E] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                                </div>
                                <div>
                                    <label htmlFor={`${fid}-scend`} className="text-[10px] text-zinc-500">Bitiş</label>
                                    <input id={`${fid}-scend`} type="date" value={customEnd}
                                        onChange={e => onSetCustomEnd(e.target.value)}
                                        className="w-full bg-[#0C0C0E] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500/50" />
                                </div>
                                <button
                                    onClick={onApplyCustomRange}
                                    disabled={!canApply}
                                    className="w-full bg-pink-600 hover:bg-pink-500 disabled:opacity-40 text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                                >
                                    Uygula
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
