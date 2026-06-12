import { describe, expect, it } from 'vitest';
import {
    COUNTRY_COLORS,
    DATE_PRESETS,
    DEVICE_COLORS,
    PANEL_PRESETS,
    buildCountryBarData,
    buildDevicePieData,
    computeClickThroughRate,
    formatNum,
    getPositionLabel,
} from '../model/searchConsole.utils';

describe('formatNum', () => {
    it('küçük sayıları olduğu gibi biçimlendirir', () => {
        expect(formatNum(42)).toBe('42');
    });

    it('binleri K ile kısaltır', () => {
        expect(formatNum(1500)).toBe('1.5K');
    });

    it('milyonları M ile kısaltır', () => {
        expect(formatNum(2_500_000)).toBe('2.5M');
    });
});

describe('buildDevicePieData', () => {
    it('cihaz metriklerini grafik verisine dönüştürür', () => {
        const result = buildDevicePieData([
            { name: 'Mobil', clicks: 120, impressions: 1000 },
            { name: 'Masaüstü', clicks: 80, impressions: 600 },
        ]);

        expect(result).toEqual([
            { name: 'Mobil', value: 120, color: DEVICE_COLORS[0] },
            { name: 'Masaüstü', value: 80, color: DEVICE_COLORS[1] },
        ]);
    });

    it('renk paletini döngüsel kullanır', () => {
        const devices = Array.from({ length: DEVICE_COLORS.length + 1 }, (_, index) => ({
            name: `Device ${index}`,
            clicks: index,
            impressions: index,
        }));

        expect(buildDevicePieData(devices).at(-1)?.color).toBe(DEVICE_COLORS[0]);
    });
});

describe('buildCountryBarData', () => {
    it('ülke metriklerini bar grafik verisine dönüştürür', () => {
        const result = buildCountryBarData([
            { name: 'tur', clicks: 50, impressions: 500 },
        ]);

        expect(result).toEqual([
            { name: 'tur', value: 50, fill: COUNTRY_COLORS[0] },
        ]);
    });
});

describe('computeClickThroughRate', () => {
    it('gösterim yoksa sıfır döner', () => {
        expect(computeClickThroughRate(10, 0)).toBe('0%');
    });

    it('oranı iki ondalıkla hesaplar', () => {
        expect(computeClickThroughRate(25, 200)).toBe('12.50%');
    });
});

describe('getPositionLabel', () => {
    it('pozisyon aralıklarını kullanıcı mesajına çevirir', () => {
        expect(getPositionLabel(3)).toBe("Harika! İlk 3'te");
        expect(getPositionLabel(8)).toBe('İlk sayfada');
        expect(getPositionLabel(15)).toBe('İkinci sayfada');
        expect(getPositionLabel(21)).toBe('Geliştirilebilir');
    });
});

describe('date presets', () => {
    it('altı hazır aralık içerir', () => {
        expect(DATE_PRESETS).toHaveLength(6);
        expect(PANEL_PRESETS).toHaveLength(6);
    });

    it('panel presetlerinden açıklama alanını çıkarır', () => {
        PANEL_PRESETS.forEach(preset => {
            expect(preset).not.toHaveProperty('desc');
            expect(preset.end).toBe('today');
        });
    });
});
