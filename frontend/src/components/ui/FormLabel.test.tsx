import { render, screen, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormLabel, useFieldId } from './FormLabel';

describe('FormLabel', () => {
    it('renders a label element with the provided text', () => {
        render(<FormLabel>Email</FormLabel>);

        const label = screen.getByText('Email');
        expect(label.tagName).toBe('LABEL');
    });

    it('sets htmlFor attribute when provided', () => {
        render(<FormLabel htmlFor="email-input">Email</FormLabel>);

        const label = screen.getByText('Email');
        expect(label).toHaveAttribute('for', 'email-input');
    });

    it('appends a custom className while keeping base styles', () => {
        render(<FormLabel className="text-pink-500">Email</FormLabel>);

        const label = screen.getByText('Email');
        expect(label.className).toContain('text-[10px]');
        expect(label.className).toContain('font-bold');
        expect(label.className).toContain('text-pink-500');
    });

    it('renders complex children nodes', () => {
        render(
            <FormLabel>
                <span data-testid="inner">Inner Content</span>
            </FormLabel>,
        );

        expect(screen.getByTestId('inner')).toBeInTheDocument();
    });
});

describe('useFieldId', () => {
    it('returns a prefixed id based on useId', () => {
        const { result } = renderHook(() => useFieldId('email'));

        expect(result.current.startsWith('email-')).toBe(true);
        expect(result.current.length).toBeGreaterThan('email-'.length);
    });

    it('returns unique ids for different hooks calls', () => {
        const first = renderHook(() => useFieldId('a'));
        const second = renderHook(() => useFieldId('b'));

        expect(first.result.current).not.toBe(second.result.current);
    });

    it('strips colons from the underlying useId value', () => {
        const { result } = renderHook(() => useFieldId('x'));

        expect(result.current).not.toContain(':');
    });
});
