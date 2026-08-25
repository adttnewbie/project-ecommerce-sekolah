import { describe, expect, test } from 'bun:test';
import { getSearchConfig } from '@/components/app-sidebar-header';

const url = (href) => (typeof href === 'string' ? href : href.url);

describe('dashboard header search', () => {
    test('does not expose search for admin_jurusan', () => {
        expect(getSearchConfig('admin_jurusan', 'kaos')).toBe(null);
    });

    test('exposes multi-target search for picket_officer', () => {
        const config = getSearchConfig('picket_officer', 'kaos');

        expect(config?.ariaLabel).toBe('Pencarian picket');
        expect(config?.targets.map((target) => url(target.href))).toEqual([
            '/picket/pos',
            '/picket/orders',
            '/picket/receiving',
        ]);
    });

    test.each([
        ['buyer', 'Pencarian katalog', '/catalog?search=kaos'],
        ['seller', 'Pencarian seller', '/seller/products?q=kaos'],
        ['admin', 'Pencarian admin', '/admin/products?q=kaos'],
    ])('uses the %s search destination', (role, ariaLabel, expectedUrl) => {
        const config = getSearchConfig(role, 'kaos');

        expect(config?.ariaLabel).toBe(ariaLabel);
        expect(url(config.targets[0].href)).toBe(expectedUrl);
    });
});
