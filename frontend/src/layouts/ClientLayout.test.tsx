import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const useClientDashboardMock = vi.fn();
const hasServiceMock = vi.fn();
const membershipRoleMock = vi.fn();

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({
        user: {
            id: 'user-1',
            email: 'client@test.com',
            fullName: 'Client User',
            globalRole: 'COMPANY_USER',
            membershipRole: membershipRoleMock(),
            avatarUrl: null,
            companyId: 'company-1',
        },
        logout: vi.fn(),
    }),
}));

vi.mock('../hooks/useUnreadCount', () => ({
    useUnreadCount: () => 4,
}));

vi.mock('../features/client-dashboard', () => ({
    useClientDashboard: () => useClientDashboardMock(),
}));

vi.mock('../hooks/useActiveServices', () => ({
    useActiveServices: () => ({
        isLoading: false,
        hasService: (...args: unknown[]) => hasServiceMock(...args),
    }),
}));

vi.mock('../components/NotificationBell', () => ({
    default: () => <div>NotificationBell</div>,
}));

vi.mock('../components/GlobalSearch', () => ({
    default: () => <div>GlobalSearch</div>,
}));

vi.mock('../components/ThemeToggle', () => ({
    default: () => <button>ThemeToggle</button>,
}));

vi.mock('../components/LanguageSwitcher', () => ({
    default: () => <button>LanguageSwitcher</button>,
}));

vi.mock('../components/brand/FogLogo', () => ({
    default: () => <div>FogLogo</div>,
}));

vi.mock('../api/clientPanel', () => ({
    clientApi: { getMyConversations: vi.fn() },
}));

import ClientLayout from './ClientLayout';

function renderClientLayout(path = '/client/tasks') {
    render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/client/*" element={<ClientLayout />}>
                    <Route path="tasks" element={<div>Tasks page</div>} />
                    <Route path="google-analytics" element={<div>GA page</div>} />
                </Route>
            </Routes>
        </MemoryRouter>
    );

    act(() => {
        vi.advanceTimersByTime(750);
    });
}

describe('ClientLayout navigation groups', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        useClientDashboardMock.mockReturnValue({ isLoading: false, isAllSettled: true });
        hasServiceMock.mockReturnValue(true);
        membershipRoleMock.mockReturnValue('OWNER');
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        useClientDashboardMock.mockClear();
        hasServiceMock.mockReset();
        membershipRoleMock.mockReset();
    });

    it('groups client navigation and opens collapsed groups on demand', () => {
        renderClientLayout();

        expect(screen.getByRole('button', { name: /İşler & İçerikler/i })).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Görevler')).toBeInTheDocument();

        const digitalReports = screen.getByRole('button', { name: /Dijital Raporlar/i });
        expect(digitalReports).toHaveAttribute('aria-expanded', 'false');
        expect(screen.queryByText('Google Analytics')).not.toBeInTheDocument();

        fireEvent.click(digitalReports);

        expect(digitalReports).toHaveAttribute('aria-expanded', 'true');
        expect(screen.getByText('Google Analytics')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /İletişim & Ekip/i })).toHaveTextContent('4');
    });

    it('does not fetch dashboard data from the portal shell', () => {
        renderClientLayout('/client/messaging');

        expect(useClientDashboardMock).not.toHaveBeenCalled();
    });

    it('counts unavailable service packages instead of individual navigation links', () => {
        hasServiceMock.mockReturnValue(false);

        renderClientLayout();

        expect(screen.getByRole('button', { name: /Ek hizmetleri incele, 6 hizmet/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Google Analytics/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Search Console/i })).not.toBeInTheDocument();
    });

    it('does not route employees to the owner-only service request page', () => {
        hasServiceMock.mockReturnValue(false);
        membershipRoleMock.mockReturnValue('EMPLOYEE');

        renderClientLayout();

        expect(screen.queryByRole('button', { name: /Ek hizmetleri incele/i })).not.toBeInTheDocument();
    });
});
