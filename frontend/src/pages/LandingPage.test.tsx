import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../store/AuthContext', () => ({
    useAuth: () => ({ user: null }),
}));

import LandingPage from './LandingPage';

function renderLandingPage() {
    render(
        <MemoryRouter>
            <LandingPage />
        </MemoryRouter>
    );
}

describe('LandingPage about design variations', () => {
    it('renders the redesigned about styles 2, 4, 6, and 7', () => {
        renderLandingPage();

        fireEvent.click(screen.getByRole('button', { name: /2\. Cinema Timeline/i }));
        expect(screen.getByText(/Brief'ten rapora tek akış/i)).toBeInTheDocument();
        expect(screen.getByText(/FOG İstanbul iş akışını sahne sahne görünür yapar/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /4\. Blueprint Map/i }));
        expect(screen.getByText(/İşin mutfağı planlı, müşteriye açık/i)).toBeInTheDocument();
        expect(screen.getByText(/Strateji panosu/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /6\. Editorial Layers/i }));
        expect(screen.getByText(/Ajans işi okunur olmalı/i)).toBeInTheDocument();
        expect(screen.getByText(/Plan görünür/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /7\. Portal Stage/i }));
        expect(screen.getByText(/Müşterinin ekranında ajansın tamamı/i)).toBeInTheDocument();
        expect(screen.getByText(/Canlı görev akışı/i)).toBeInTheDocument();
    });
});
