import { describe, expect, it } from 'vitest';
import type { Note } from '../api/note.types';
import { filterNotes } from './filterNotes';

const notes: Note[] = [
    {
        id: '1',
        userId: 'user-1',
        userName: 'Ayse Yilmaz',
        companyId: 'company-1',
        companyName: 'Ornek Ajans',
        content: 'Haziran raporunu hazirla',
        isOpen: true,
        noteDate: '2026-06-09',
        createdAt: '2026-06-09T10:00:00Z',
    },
    {
        id: '2',
        userId: 'user-1',
        userName: 'Ayse Yilmaz',
        companyId: null,
        companyName: null,
        content: 'Musteriyi ara',
        isOpen: false,
        noteDate: '2026-06-09',
        createdAt: '2026-06-09T11:00:00Z',
    },
];

describe('filterNotes', () => {
    it('filters by content, user and company', () => {
        expect(filterNotes(notes, 'rapor')).toEqual([notes[0]]);
        expect(filterNotes(notes, 'ayse')).toHaveLength(2);
        expect(filterNotes(notes, 'ornek')).toEqual([notes[0]]);
    });

    it('returns all notes for an empty search', () => {
        expect(filterNotes(notes, '   ')).toEqual(notes);
    });
});
