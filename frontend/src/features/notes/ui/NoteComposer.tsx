import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { NoteCompanyOption } from '../api/note.types';
import { useCreateNote } from '../hooks/useNotes';
import { parseCreateNoteInput } from '../model/note.schema';

interface NoteComposerProps {
    companies: NoteCompanyOption[];
    onClose: () => void;
}

export function NoteComposer({ companies, onClose }: NoteComposerProps) {
    const [content, setContent] = useState('');
    const [companyId, setCompanyId] = useState('');
    const createNote = useCreateNote();

    const submit = () => {
        createNote.mutate(parseCreateNoteInput(content, companyId), {
            onSuccess: onClose,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl space-y-3"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Yeni Not</h3>
                <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400" aria-label="Formu kapat">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <select
                value={companyId}
                onChange={event => setCompanyId(event.target.value)}
                className="w-full px-3 py-2 bg-[#09090b] border border-white/[0.08] rounded-xl text-sm text-white outline-none"
            >
                <option value="">Genel Not</option>
                {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                ))}
            </select>
            <textarea
                value={content}
                onChange={event => setContent(event.target.value)}
                placeholder="Markdown formatinda yazabilirsiniz..."
                rows={6}
                maxLength={5000}
                className="w-full px-3 py-2 bg-[#09090b] border border-white/[0.08] rounded-xl text-sm text-white outline-none resize-none font-mono placeholder:text-zinc-700"
            />
            <div className="flex justify-end">
                <button
                    onClick={submit}
                    disabled={!content.trim() || createNote.isPending}
                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-30 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    Kaydet
                </button>
            </div>
        </motion.div>
    );
}
