import { describe, it, expect } from 'vitest';
import { fmt, pct, dur } from '../dashboard.utils';

describe('dashboard.utils', () => {
    describe('fmt', () => {
        it('formats millions with M suffix', () => {
            expect(fmt(1_500_000)).toBe('1.5M');
        });

        it('formats thousands with K suffix', () => {
            expect(fmt(2_500)).toBe('2.5K');
        });

        it('formats small numbers with Turkish locale', () => {
            const result = fmt(42);
            expect(result).toBe('42');
        });

        it('formats exact million', () => {
            expect(fmt(1_000_000)).toBe('1.0M');
        });

        it('formats exact thousand', () => {
            expect(fmt(1_000)).toBe('1.0K');
        });
    });

    describe('pct', () => {
        it('formats decimal as percentage', () => {
            expect(pct(0.456)).toBe('45.6%');
        });

        it('formats zero', () => {
            expect(pct(0)).toBe('0.0%');
        });

        it('formats value over 1', () => {
            expect(pct(1.5)).toBe('150.0%');
        });
    });

    describe('dur', () => {
        it('formats seconds only', () => {
            expect(dur(45)).toBe('45sn');
        });

        it('formats minutes and seconds', () => {
            expect(dur(125)).toBe('2dk 5sn');
        });

        it('formats exact minute', () => {
            expect(dur(60)).toBe('1dk 0sn');
        });
    });
});