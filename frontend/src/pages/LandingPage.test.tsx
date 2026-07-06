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
        expect(screen.getByText(/Liquid timeline/i)).toBeInTheDocument();
        expect(screen.getByText(/Brief'ten rapora/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /4\. Blueprint Map/i }));
        expect(screen.getByText(/Isometric lab/i)).toBeInTheDocument();
        expect(screen.getByText(/Ajanstan müşteriye/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /6\. Editorial Layers/i }));
        expect(screen.getByText(/Gallery walk/i)).toBeInTheDocument();
        expect(screen.getByText(/Dört eser/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /7\. Portal Stage/i }));
        expect(screen.getByText(/Holographic command/i)).toBeInTheDocument();
        expect(screen.getByText(/Müşteri ekranında/i)).toBeInTheDocument();
    });
});
