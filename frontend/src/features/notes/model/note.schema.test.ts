import { describe, expect, it } from 'vitest';
import { parseCreateNoteInput } from './note.schema';

describe('parseCreateNoteInput', () => {
    it('trims content and removes an empty company id', () => {
        expect(parseCreateNoteInput('  Yeni not  ', '')).toEqual({
            content: 'Yeni not',
            companyId: undefined,
        });
    });

    it('rejects empty notes', () => {
        expect(() => parseCreateNoteInput('   ')).toThrow();
    });
});
