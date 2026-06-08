import type { Note } from '../api/note.types';

export function filterNotes(notes: Note[], search: string): Note[] {
    const query = search.trim().toLocaleLowerCase('tr-TR');
    if (!query) {
        return notes;
    }

    return notes.filter(note =>
        note.content.toLocaleLowerCase('tr-TR').includes(query)
        || note.userName.toLocaleLowerCase('tr-TR').includes(query)
        || (note.companyName ?? '').toLocaleLowerCase('tr-TR').includes(query)
    );
}
