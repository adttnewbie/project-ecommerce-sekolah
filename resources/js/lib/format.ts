const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

/**
 * Format angka menjadi Rupiah Indonesia tanpa desimal ("Rp12.000").
 *
 * Idempoten: string yang sudah berformat ("Rp…") dikembalikan apa adanya
 * sehingga pemanggilan ganda tidak merusak tampilan.
 */
export function formatRupiah(value: number | string): string {
    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed.startsWith('Rp')) {
            return trimmed;
        }

        if (trimmed === '') {
            return 'Rp0';
        }

        const numeric = Number(trimmed.replace(/[^0-9-]/g, ''));

        if (Number.isNaN(numeric)) {
            return 'Rp0';
        }

        value = numeric;
    }

    if (!Number.isFinite(value)) {
        return 'Rp0';
    }

    return rupiahFormatter.format(value);
}
