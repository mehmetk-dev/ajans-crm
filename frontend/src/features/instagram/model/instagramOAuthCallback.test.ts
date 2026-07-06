import { describe, expect, it } from 'vitest';
import { getInstagramOAuthCallbackError } from './instagramOAuthCallback';

describe('getInstagramOAuthCallbackError', () => {
    it('returns decoded callback error messages', () => {
        const search = '?ig=error&message=Instagram+izinleri+eksik%3A+pages_read_engagement';

        expect(getInstagramOAuthCallbackError(search))
            .toBe('Instagram izinleri eksik: pages_read_engagement');
    });

    it('ignores successful callbacks', () => {
        expect(getInstagramOAuthCallbackError('?ig=connected')).toBe('');
    });

    it('falls back when error message is empty', () => {
        expect(getInstagramOAuthCallbackError('?ig=error')).toBe('Instagram bağlantısı tamamlanamadı');
    });
});
