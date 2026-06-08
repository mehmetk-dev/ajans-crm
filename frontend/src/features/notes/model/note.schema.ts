import { z } from 'zod';
import type { CreateNoteInput } from '../api/note.types';

export const createNoteSchema = z.object({
    content: z.string().trim().min(1, 'Not bos olamaz').max(5000, 'Not en fazla 5000 karakter olabilir'),
    companyId: z.string().trim().optional(),
});

export function parseCreateNoteInput(content: string, companyId?: string): CreateNoteInput {
    const input = createNoteSchema.parse({
        content,
        companyId: companyId || undefined,
    });

    return {
        content: input.content,
        companyId: input.companyId || undefined,
    };
}
