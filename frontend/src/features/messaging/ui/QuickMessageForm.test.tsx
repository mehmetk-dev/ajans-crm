import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api/messagingApi', () => ({
    messagingApi: {
        startConversation: vi.fn(),
        sendMessage: vi.fn(),
    },
}));

import { messagingApi } from '../api/messagingApi';
import { QuickMessageForm } from './QuickMessageForm';

describe('QuickMessageForm', () => {
    const users = [
        { id: 'u-1', fullName: 'Ali Yılmaz', email: 'ali@test.com', globalRole: 'AGENCY_STAFF' as const, avatarUrl: null },
        { id: 'u-2', fullName: 'Ayşe Demir', email: 'ayse@test.com', globalRole: 'COMPANY_USER' as const, avatarUrl: null },
        { id: 'u-3', fullName: 'Admin', email: 'admin@test.com', globalRole: 'ADMIN' as const, avatarUrl: null },
    ];

    const defaultProps = {
        users,
        loading: false,
        setLoading: vi.fn(),
        onDone: vi.fn(),
        onNavigateMessages: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the user dropdown with localized role labels', () => {
        render(<QuickMessageForm {...defaultProps} />);

        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(screen.getByText(/Ali Yılmaz \(Ajans\)/)).toBeInTheDocument();
        expect(screen.getByText(/Ayşe Demir \(Müşteri\)/)).toBeInTheDocument();
        expect(screen.getByText(/Admin \(Admin\)/)).toBeInTheDocument();
    });

    it('does not submit when target or message is empty', async () => {
        const setLoading = vi.fn();
        render(<QuickMessageForm {...defaultProps} setLoading={setLoading} />);

        fireEvent.click(screen.getByRole('button', { name: 'Mesaj Gönder' }));

        expect(messagingApi.startConversation).not.toHaveBeenCalled();
        expect(setLoading).not.toHaveBeenCalled();
    });

    it('starts a conversation, sends the trimmed message, then calls onDone and onNavigateMessages', async () => {
        vi.mocked(messagingApi.startConversation).mockResolvedValue({ id: 'conv-1' } as never);
        vi.mocked(messagingApi.sendMessage).mockResolvedValue({} as never);
        const onDone = vi.fn();
        const onNavigateMessages = vi.fn();
        const setLoading = vi.fn();

        render(
            <QuickMessageForm
                {...defaultProps}
                setLoading={setLoading}
                onDone={onDone}
                onNavigateMessages={onNavigateMessages}
            />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'u-1' } });
        fireEvent.change(screen.getByRole('textbox'), { target: { value: '  Merhaba  ' } });

        fireEvent.click(screen.getByRole('button', { name: 'Mesaj Gönder' }));

        await waitFor(() => {
            expect(messagingApi.startConversation).toHaveBeenCalledWith('u-1');
            expect(messagingApi.sendMessage).toHaveBeenCalledWith('conv-1', { content: 'Merhaba' });
        });

        await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
            expect(onNavigateMessages).toHaveBeenCalled();
        });

        expect(setLoading).toHaveBeenCalledWith(true);
        expect(setLoading).toHaveBeenLastCalledWith(false);
    });

    it('shows the loading label and disables the button while loading', () => {
        render(<QuickMessageForm {...defaultProps} loading={true} />);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveTextContent('Oluşturuluyor...');
    });

    it('swallows errors and always clears the loading state', async () => {
        vi.mocked(messagingApi.startConversation).mockRejectedValue(new Error('network'));
        const onDone = vi.fn();
        const onNavigateMessages = vi.fn();
        const setLoading = vi.fn();

        render(
            <QuickMessageForm
                {...defaultProps}
                setLoading={setLoading}
                onDone={onDone}
                onNavigateMessages={onNavigateMessages}
            />,
        );

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'u-1' } });
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
        fireEvent.click(screen.getByRole('button', { name: 'Mesaj Gönder' }));

        await waitFor(() => {
            expect(setLoading).toHaveBeenCalledWith(false);
        });
        expect(onDone).not.toHaveBeenCalled();
        expect(onNavigateMessages).not.toHaveBeenCalled();
    });
});
