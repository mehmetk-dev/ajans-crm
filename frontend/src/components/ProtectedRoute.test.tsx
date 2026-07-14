import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({
        user: { globalRole: 'COMPANY_USER', membershipRole: null },
        isLoading: false,
    }),
}));

import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute membership roles', () => {
    it('rejects an owner-only route when membership context is missing', () => {
        render(
            <MemoryRouter initialEntries={['/client/services']}>
                <Routes>
                    <Route path="/client" element={<div>Client home</div>} />
                    <Route path="/client/services" element={(
                        <ProtectedRoute membershipRoles={['OWNER']}>
                            <div>Owner services</div>
                        </ProtectedRoute>
                    )} />
                </Routes>
            </MemoryRouter>,
        );

        expect(screen.getByText('Client home')).toBeInTheDocument();
        expect(screen.queryByText('Owner services')).not.toBeInTheDocument();
    });
});
