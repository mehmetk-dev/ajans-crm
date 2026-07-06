export function getInstagramOAuthCallbackError(search: string): string {
    const params = new URLSearchParams(search);
    if (params.get('ig') !== 'error') {
        return '';
    }

    const message = params.get('message')?.trim();
    return message || 'Instagram bağlantısı tamamlanamadı';
}
