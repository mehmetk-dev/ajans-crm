import { describe, it, expect } from 'vitest';
import {
    formatDuration,
    formatNum,
    computeEngagementRate,
    computeSessionsPerUser,
    buildSourcePieData,
    buildCountryBarData,
    DATE_PRESETS,
    PANEL_PRESETS,
    SOURCE_COLORS,
    COUNTRY_COLORS,
} from '../model/googleAnalytics.utils';

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
    it('sıfır saniye için "0dk 0sn" döner', () => {
        expect(formatDuration(0)).toBe('0dk 0sn');
    });

    it('tam dakikaları doğru biçimlendirir', () => {
        expect(formatDuration(120)).toBe('2dk 0sn');
    });

    it('dakika ve saniyeyi birlikte biçimlendirir', () => {
        expect(formatDuration(125)).toBe('2dk 5sn');
    });

    it('60 saniye tam 1 dakikadır', () => {
        expect(formatDuration(60)).toBe('1dk 0sn');
    });

    it('büyük değerlerde doğru çalışır', () => {
        expect(formatDuration(3661)).toBe('61dk 1sn');
    });
});

// ─── formatNum ────────────────────────────────────────────────────────────────

describe('formatNum', () => {
    it('küçük sayılar için lokalize eder', () => {
        expect(formatNum(42)).toBe('42');
    });

    it('bin üzeri için K ekler', () => {
        expect(formatNum(1500)).toBe('1.5K');
    });

    it('tam bin için K ekler', () => {
        expect(formatNum(1000)).toBe('1.0K');
    });

    it('milyon üzeri için M ekler', () => {
        expect(formatNum(1_500_000)).toBe('1.5M');
    });

    it('tam milyon için M ekler', () => {
        expect(formatNum(2_000_000)).toBe('2.0M');
    });

    it('999 sayısı K olmaz', () => {
        const result = formatNum(999);
        expect(result).not.toContain('K');
    });
});

// ─── computeEngagementRate ────────────────────────────────────────────────────

describe('computeEngagementRate', () => {
    it('bounce rate 100 ise etkileşim 0.0 olur', () => {
        expect(computeEngagementRate(100)).toBe('0.0');
    });

    it('bounce rate 0 ise etkileşim 100.0 olur', () => {
        expect(computeEngagementRate(0)).toBe('100.0');
    });

    it('bounce rate 35.5 ise etkileşim 64.5 olur', () => {
        expect(computeEngagementRate(35.5)).toBe('64.5');
    });
});

// ─── computeSessionsPerUser ───────────────────────────────────────────────────

describe('computeSessionsPerUser', () => {
    it('sıfır kullanıcı için "0" döner', () => {
        expect(computeSessionsPerUser(500, 0)).toBe('0');
    });

    it('oranı iki ondalıkla hesaplar', () => {
        expect(computeSessionsPerUser(300, 100)).toBe('3.00');
    });

    it('tam bölünmede doğru sonuç', () => {
        expect(computeSessionsPerUser(200, 100)).toBe('2.00');
    });

    it('tam olmayan bölünmede ondalık kesiyor', () => {
        expect(computeSessionsPerUser(10, 3)).toBe('3.33');
    });
});

// ─── buildSourcePieData ───────────────────────────────────────────────────────

describe('buildSourcePieData', () => {
    it('boş liste için boş dizi döner', () => {
        expect(buildSourcePieData([])).toHaveLength(0);
    });

    it('kaynak başına renk atar', () => {
        const sources = [
            { name: 'Organic', value: 100 },
            { name: 'Direct', value: 50 },
        ];
        const result = buildSourcePieData(sources);
        expect(result).toHaveLength(2);
        expect(result[0].color).toBe(SOURCE_COLORS[0]);
        expect(result[1].color).toBe(SOURCE_COLORS[1]);
    });

    it('renk sayısını aşan kaynaklarda renkleri döndürür', () => {
        const sources = Array.from({ length: SOURCE_COLORS.length + 1 }, (_, i) => ({
            name: `Source ${i}`,
            value: i + 1,
        }));
        const result = buildSourcePieData(sources);
        // Son eleman ilk rengi tekrar kullanmalı
        expect(result[result.length - 1].color).toBe(SOURCE_COLORS[0]);
    });

    it('name ve value değerlerini korur', () => {
        const sources = [{ name: 'Email', value: 200 }];
        const result = buildSourcePieData(sources);
        expect(result[0].name).toBe('Email');
        expect(result[0].value).toBe(200);
    });
});

// ─── buildCountryBarData ──────────────────────────────────────────────────────

describe('buildCountryBarData', () => {
    it('boş liste için boş dizi döner', () => {
        expect(buildCountryBarData([])).toHaveLength(0);
    });

    it('ülke başına fill rengi atar', () => {
        const countries = [
            { name: 'Turkey', value: 500 },
            { name: 'Germany', value: 200 },
        ];
        const result = buildCountryBarData(countries);
        expect(result[0].fill).toBe(COUNTRY_COLORS[0]);
        expect(result[1].fill).toBe(COUNTRY_COLORS[1]);
    });

    it('name ve value değerlerini korur', () => {
        const countries = [{ name: 'Turkey', value: 500 }];
        const result = buildCountryBarData(countries);
        expect(result[0].name).toBe('Turkey');
        expect(result[0].value).toBe(500);
    });
});

// ─── DATE_PRESETS / PANEL_PRESETS ─────────────────────────────────────────────

describe('DATE_PRESETS', () => {
    it('6 adet preset vardır', () => {
        expect(DATE_PRESETS).toHaveLength(6);
    });

    it('her preset label, start, end, desc içerir', () => {
        DATE_PRESETS.forEach(p => {
            expect(p).toHaveProperty('label');
            expect(p).toHaveProperty('start');
            expect(p).toHaveProperty('end');
            expect(p).toHaveProperty('desc');
        });
    });

    it('tüm end değerleri "today" dir', () => {
        DATE_PRESETS.forEach(p => {
            expect(p.end).toBe('today');
        });
    });
});

describe('PANEL_PRESETS', () => {
    it('DATE_PRESETS ile aynı sayıda preset vardır', () => {
        expect(PANEL_PRESETS).toHaveLength(DATE_PRESETS.length);
    });

    it('desc alanı yoktur', () => {
        PANEL_PRESETS.forEach(p => {
            expect(p).not.toHaveProperty('desc');
        });
    });
});
