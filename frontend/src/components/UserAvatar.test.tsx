import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { UserAvatar } from './UserAvatar';

describe('UserAvatar', () => {
    it('renders the uploaded profile photo when an avatar URL exists', () => {
        render(<UserAvatar name="Ali Kamera" avatarUrl="/api/settings/avatar/ali.png" />);

        const image = screen.getByRole('img', { name: 'Ali Kamera' });
        expect(image).toHaveAttribute('src', '/api/settings/avatar/ali.png');
    });

    it('falls back to initials when there is no avatar URL', () => {
        render(<UserAvatar name="Ali Kamera" avatarUrl={null} />);

        expect(screen.getByText('AK')).toBeInTheDocument();
    });
});
