import { Send } from 'lucide-react';

interface Props {
    value: string;
    onChange: (v: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    placeholder?: string;
    disabled?: boolean;
}

export function MessageComposer({ value, onChange, onSubmit, placeholder = 'Bir mesaj yazın...', disabled }: Props) {
    return (
        <div className="p-4 bg-[#0C0C0E] border-t border-white/[0.06]">
            <form onSubmit={onSubmit} className="max-w-4xl mx-auto flex items-end gap-3">
                <div className="flex-1 relative">
                    <textarea
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSubmit(e);
                            }
                        }}
                        placeholder={placeholder}
                        className="w-full bg-[#09090b] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                        disabled={disabled}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!value.trim() || disabled}
                    className="h-11 w-11 shrink-0 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white flex items-center justify-center disabled:opacity-50 transition-all font-bold group"
                >
                    <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </form>
        </div>
    );
}
