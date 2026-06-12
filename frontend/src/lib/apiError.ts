import { isAxiosError } from 'axios';

export function getApiErrorMessage(err: unknown, fallback: string): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (data) {
            if (typeof data.message === 'string') return data.message;
            if (typeof data === 'object') {
                const messages = Object.values(data).filter((v): v is string => typeof v === 'string');
                if (messages.length > 0) return messages.join(', ');
            }
        }
    }
    if (err instanceof Error) return err.message;
    return fallback;
}