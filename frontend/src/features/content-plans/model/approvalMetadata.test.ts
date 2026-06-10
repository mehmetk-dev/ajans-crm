import { describe, expect, it } from 'vitest';
import { encodeContentApprovalMetadata, parseContentApprovalMetadata } from './approvalMetadata';

describe('content approval metadata', () => {
    it('round trips new shoot details', () => {
        const encoded = encodeContentApprovalMetadata({
            shootTitle: 'Reels çekimi',
            shootDate: '2026-06-12',
            location: 'Stüdyo',
        });

        expect(parseContentApprovalMetadata(encoded)).toEqual({
            shootTitle: 'Reels çekimi',
            shootDate: '2026-06-12',
            location: 'Stüdyo',
        });
    });

    it('keeps existing shoot id in the last field', () => {
        const encoded = encodeContentApprovalMetadata({ existingShootId: 'shoot-1' });

        expect(encoded).toBe('||||||||||shoot-1');
        expect(parseContentApprovalMetadata(encoded).existingShootId).toBe('shoot-1');
    });

    it('removes the legacy delimiter from user input', () => {
        const encoded = encodeContentApprovalMetadata({ shootTitle: 'Başlık||bozuk' });

        expect(parseContentApprovalMetadata(encoded).shootTitle).toBe('Başlık bozuk');
    });
});
