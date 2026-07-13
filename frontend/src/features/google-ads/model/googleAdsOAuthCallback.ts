export function getGoogleAdsOAuthCallbackError(search: string): string {
    const message = new URLSearchParams(search).get('oauthError')?.trim();
    return message || '';
}
