import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationRecipients } from './useTasks';

const listNotificationRecipientsMock = vi.fn();

vi.mock('../api/taskApi', () => ({
    taskApi: {
        listNotificationRecipients: (...args: unknown[]) => listNotificationRecipientsMock(...args),
    },
}));

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    });

    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}

describe('useNotificationRecipients', () => {
    beforeEach(() => {
        listNotificationRecipientsMock.mockReset();
        listNotificationRecipientsMock.mockResolvedValue([]);
    });

    it('loads agency recipients for staff tasks without a company', async () => {
        renderHook(() => useNotificationRecipients(undefined, 'staff'), { wrapper: makeWrapper() });

        await waitFor(() => {
            expect(listNotificationRecipientsMock).toHaveBeenCalledWith(undefined, 'staff');
        });
    });
});
