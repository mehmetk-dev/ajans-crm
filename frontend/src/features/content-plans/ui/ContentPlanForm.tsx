import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type {
    ContentPlanFormValues,
    ContentPlanResponse,
    ContentPlatform,
} from '../api/contentPlan.types';
import { contentPlatforms, contentSizes } from '../model/contentPlan.constants';

interface ContentPlanFormProps {
    initial?: ContentPlanResponse;
    isLoading?: boolean;
    onSubmit: (values: ContentPlanFormValues) => void;
    onCancel: () => void;
}

export function ContentPlanForm({
    initial,
    isLoading = false,
    onSubmit,
    onCancel,
}: ContentPlanFormProps) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [description, setDescription] = useState(initial?.description ?? '');
    const [authorName, setAuthorName] = useState(initial?.authorName ?? '');
    const [platform, setPlatform] = useState<ContentPlatform>(initial?.platform ?? 'INSTAGRAM');
    const [contentSize, setContentSize] = useState(initial?.contentSize ?? '1080x1920');
    const [direction, setDirection] = useState(initial?.direction ?? '');
    const [speakerModel, setSpeakerModel] = useState(initial?.speakerModel ?? '');
    const [plannedDate, setPlannedDate] = useState(initial?.plannedDate ?? '');

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        onSubmit({
            title: title.trim(),
            description: description.trim() || undefined,
            authorName: authorName.trim(),
            platform,
            contentSize: contentSize || undefined,
            direction: direction.trim() || undefined,
            speakerModel: speakerModel.trim() || undefined,
            plannedDate: plannedDate || undefined,
        });
    };

    return (
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-violet-500/20 bg-[#111114] p-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                    {initial ? 'İçerik Planını Düzenle' : 'Yeni İçerik Planı'}
                </h3>
                <button type="button" onClick={onCancel} className="text-zinc-500 hover:text-white">
                    <X className="h-4 w-4" />
                </button>
            </div>
            <Field label="Başlık *">
                <input required value={title} onChange={event => setTitle(event.target.value)}
                    className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Yazar *">
                    <input required value={authorName} onChange={event => setAuthorName(event.target.value)}
                        className={inputClass} />
                </Field>
                <Field label="Platform *">
                    <select value={platform}
                        onChange={event => setPlatform(event.target.value as ContentPlatform)}
                        className={inputClass}>
                        {contentPlatforms.map(item => (
                            <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                    </select>
                </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Boyut">
                    <select value={contentSize} onChange={event => setContentSize(event.target.value)}
                        className={inputClass}>
                        {contentSizes.map(size => <option key={size}>{size}</option>)}
                    </select>
                </Field>
                <Field label="Önerilen Çekim">
                    <input type="date" value={plannedDate}
                        onChange={event => setPlannedDate(event.target.value)} className={inputClass} />
                </Field>
            </div>
            <Field label="Yönlendirme / Brief">
                <textarea value={direction} onChange={event => setDirection(event.target.value)}
                    rows={2} className={inputClass} />
            </Field>
            <Field label="Konuşmacı / Manken">
                <input value={speakerModel} onChange={event => setSpeakerModel(event.target.value)}
                    className={inputClass} />
            </Field>
            <Field label="Açıklama">
                <textarea value={description} onChange={event => setDescription(event.target.value)}
                    rows={2} className={inputClass} />
            </Field>
            <div className="flex gap-2 pt-1">
                <button disabled={isLoading || !title.trim() || !authorName.trim()}
                    className="flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Kaydet
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-xl border border-white/[0.08] px-4 py-2 text-xs text-zinc-400">
                    İptal
                </button>
            </div>
        </form>
    );
}

const inputClass = 'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-white focus:border-violet-500/50 focus:outline-none';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wider text-zinc-500">{label}</span>
            {children}
        </label>
    );
}
