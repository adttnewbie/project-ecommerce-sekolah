import { readFile } from 'node:fs/promises';
import { expect, test } from 'bun:test';

const source = await readFile(
    new URL('./delivery-fee.tsx', import.meta.url),
    'utf8',
);

test('page uses PageHeader with single-line clamped description', () => {
    expect(source).toContain('<PageHeader');
    expect(source).toContain('descriptionClassName="line-clamp-1"');
});

test('flash feedback uses dismissible FlashAlert', () => {
    expect(source).toContain('<FlashAlert');
    expect(source).not.toContain('role="status"');
});

test('tier editor submits indexed rules and locks the base row', () => {
    expect(source).toContain('name={`tiers[${index}][min_spend]`}');
    expect(source).toContain('name={`tiers[${index}][fee]`}');
    expect(source).toContain(
        'disabled={\n                                                                    index === 0\n                                                                }',
    );
    expect(source).toContain('Tambah Aturan');
    expect(source).toContain('<Trash2');
});

test('save is blocked until rules change and offers reset', () => {
    expect(source).toContain('!canSubmit');
    expect(source).toContain('<RotateCcw');
    expect(source).toContain('Ada perubahan belum');
});

test('duplicate minimums warn before submit', () => {
    expect(source).toContain('duplicateWarning');
    expect(source).toContain('Minimal belanja tidak boleh sama');
});

test('simulation previews the matching highest tier live', () => {
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('.at(-1)');
    expect(source).toContain('Aturan yang berlaku');
    expect(source).toContain('Total bayar buyer');
});
