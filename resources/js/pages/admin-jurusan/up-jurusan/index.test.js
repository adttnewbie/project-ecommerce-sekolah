import { readFile } from 'node:fs/promises';
import { expect, test } from 'bun:test';

const source = await readFile(new URL('./index.tsx', import.meta.url), 'utf8');

test('index lists UP cards with link to detail instead of inline detail', () => {
    expect(source).toContain('href={`/admin-jurusan/up-jurusan/${up.id}`');
    expect(source).toContain('Lihat Detail');
    expect(source).not.toContain('<Dialog');
    expect(source).not.toContain('UpJurusanRevenueChart');
    expect(source).not.toContain('UpJurusanSummary');
});

test('index keeps create UP form', () => {
    expect(source).toContain('action="/admin-jurusan/up-jurusan"');
});
