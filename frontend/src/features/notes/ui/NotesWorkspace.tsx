import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileText, Loader2, Plus, Search } from 'lucide-react';
import type { NoteCompanyOption } from '../api/note.types';
import { useNotes } from '../hooks/useNotes';
import { filterNotes } from '../model/filterNotes';
import { NoteCard } from './NoteCard';
import { NoteComposer } from './NoteComposer';

interface NotesWorkspaceProps {
    companies: NoteCompanyOption[];
}

export function NotesWorkspace({ companies }: NotesWorkspaceProps) {
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const { data, isLoading, isError } = useNotes({
        page: 0,
        size: 50,
        companyId: companyFilter || undefined,
    });
    const notes = filterNotes(data?.content ?? [], search);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6 text-pink-400" />
                        Notlar
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Markdown destekli not defteri</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Yeni Not
                </button>
            </div>

            <div className="flex gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        placeholder="Notlarda ara..."
                        className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/40 placeholder:text-zinc-700"
                    />
                </div>
                <select
                    value={companyFilter}
                    onChange={event => setCompanyFilter(event.target.value)}
                    className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white outline-none focus:border-pink-500/40"
                >
                    <option value="">Tum Sirketler</option>
                    {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                    ))}
                </select>
            </div>

            <AnimatePresence>
                {showForm && (
                    <NoteComposer companies={companies} onClose={() => setShowForm(false)} />
                )}
            </AnimatePresence>

            {isError ? (
                <div className="text-center py-12 text-red-400 text-sm">Notlar yuklenemedi.</div>
            ) : notes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
                    <FileText className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">Not bulunamadi</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {notes.map((note, index) => (
                        <NoteCard key={note.id} note={note} index={index} />
                    ))}
                </div>
            )}
        </div>
    );
}
