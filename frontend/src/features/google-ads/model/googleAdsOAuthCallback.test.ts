import { describe, expect, it } from 'vitest';
import { getGoogleAdsOAuthCallbackError } from './googleAdsOAuthCallback';

describe('getGoogleAdsOAuthCallbackError', () => {
    it('returns decoded OAuth errors', () => {
        expect(getGoogleAdsOAuthCallbackError('?oauthError=Google+Ads+izni+reddedildi'))
            .toBe('Google Ads izni reddedildi');
    });

    it('ignores successful callbacks', () => {
        expect(getGoogleAdsOAuthCallbackError('?connected=true')).toBe('');
    });
});
