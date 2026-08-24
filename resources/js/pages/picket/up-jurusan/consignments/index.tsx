import { Form, Head, usePage } from '@inertiajs/react';
import {
    CreditCard,
    Loader2,
    Minus,
    Package,
    Plus,
    ReceiptText,
    Search,
    ShoppingCart,
    Store,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import InputError from '@/components/input-error';
import { FlashAlert } from '@/components/picket/flash-alert';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type PosProduct = {
    id: number;
    source: 'consignment' | 'product';
    seller_name: string;
    product_name: string;
    price: number;
    available_quantity: number;
};

type DailyReportItem = {
    product_name: string;
    quantity: number;
    subtotal: number;
};

type CartItem = PosProduct & {
    quantity: number;
};

type Props = {
    up_jurusan: { id: number; name: string } | null;
    pos_products: PosProduct[];
    daily_report: {
        date: string;
        total_sold: number;
        total_revenue: number;
        items: DailyReportItem[];
    };
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function PicketUpJurusanConsignments({
    up_jurusan,
    pos_products,
    daily_report,
}: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string; receipt_url?: string };
    };
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'low' | 'cart'>('all');
    const [mobileCartOpen, setMobileCartOpen] = useState(false);

    const lowStockCount = pos_products.filter((p) => p.available_quantity <= 3).length;

    const filteredProducts = useMemo(() => {
        let base = pos_products;

        if (filter === 'low') {
base = base.filter((p) => p.available_quantity <= 3);
}

        if (filter === 'cart') {
base = base.filter((p) =>
                cart.some((c) => c.id === p.id && c.source === p.source),
            );
}

        const keyword = query.trim().toLowerCase();

        if (!keyword) {
return base;
}

        return base.filter((product) =>
            `${product.product_name} ${product.seller_name}`.toLowerCase().includes(keyword),
        );
    }, [pos_products, query, filter, cart]);

    const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

    const setQuantity = (product: PosProduct, quantity: number) => {
        const nextQuantity = Math.max(0, Math.min(quantity, product.available_quantity));
        setCart((items) => {
            const exists = items.some((item) => item.id === product.id && item.source === product.source);

            if (nextQuantity === 0) {
                return items.filter((item) => item.id !== product.id || item.source !== product.source);
            }

            if (exists) {
                return items.map((item) =>
                    item.id === product.id && item.source === product.source
                        ? { ...item, quantity: nextQuantity }
                        : item,
                );
            }

            return [...items, { ...product, quantity: nextQuantity }];
        });
    };

    const quantityFor = (product: PosProduct) =>
        cart.find((item) => item.id === product.id && item.source === product.source)?.quantity ?? 0;

    return (
        <>
            <Head title="POS UP Jurusan" />
            <div className="space-y-6 p-4 pb-40 sm:p-6 sm:pb-6 xl:pb-6">
                <PageHeader
                    badge={up_jurusan?.name ?? 'UP Jurusan'}
                    badgeIcon={Store}
                    title="POS Picket Officer"
                    description="Pilih produk titipan yang keluar, cek cart, lalu catat penjualan tunai. Stok otomatis berkurang dan masuk laporan harian."
                    actions={
                        <div className="flex flex-wrap gap-2">
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Produk aktif</p>
                                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{pos_products.length}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Terjual hari ini</p>
                                <p className="mt-1 text-xl font-bold text-slate-900 tabular-nums">{daily_report.total_sold}</p>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                                <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Omzet</p>
                                <p className="mt-1 text-sm font-bold text-slate-900 tabular-nums">{formatRupiah(daily_report.total_revenue)}</p>
                            </div>
                        </div>
                    }
                />

                {(flash.success || flash.error) && (
                    <div className="space-y-3">
                        <FlashAlert success={flash.success} error={flash.error} />
                        {flash.success && flash.receipt_url && (
                            <Alert className="rounded-xl border-emerald-200 bg-emerald-50">
                                <ReceiptText className="size-4 text-emerald-700" />
                                <AlertTitle className="text-emerald-900">Penjualan tercatat</AlertTitle>
                                <AlertDescription className="flex flex-wrap items-center justify-between gap-3 text-emerald-700">
                                    <span>Nota berhasil dibuat. Simpan sebagai bukti transaksi.</span>
                                    <Button asChild size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700">
                                        <a href={flash.receipt_url}>
                                            <ReceiptText className="size-4" />
                                            Lihat Nota
                                        </a>
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        <Card className="rounded-xl border-slate-200 shadow-sm">
                            <CardContent className="space-y-4 p-5">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">Menu Produk</h2>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            {pos_products.length} stok aktif tersedia di {up_jurusan?.name ?? 'UP Jurusan'}. Stok rendah ditandai oranye.
                                        </p>
                                    </div>
                                    <label className="relative block w-full lg:w-80">
                                        <span className="sr-only">Cari produk</span>
                                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={query}
                                            onChange={(event) => setQuery(event.target.value)}
                                            placeholder="Cari produk atau seller..."
                                            className="h-11 rounded-xl border-slate-200 bg-white pl-9"
                                            aria-label="Cari produk POS"
                                        />
                                        {query && (
                                            <button
                                                type="button"
                                                onClick={() => setQuery('')}
                                                className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                aria-label="Hapus pencarian"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        )}
                                    </label>
                                </div>

                                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                                    {(
                                        [
                                            { key: 'all', label: `Semua ${pos_products.length}` },
                                            { key: 'low', label: `Stok rendah ${lowStockCount}` },
                                            { key: 'cart', label: `Di cart ${cart.length}` },
                                        ] as const
                                    ).map((pill) => (
                                        <button
                                            key={pill.key}
                                            onClick={() => setFilter(pill.key as typeof filter)}
                                            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/30 ${
                                                filter === pill.key
                                                    ? 'border-[#0080FF] bg-[#0080FF] text-white shadow-sm'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                            }`}
                                            aria-pressed={filter === pill.key}
                                        >
                                            {pill.label}
                                        </button>
                                    ))}
                                </div>
                                {(filter !== 'all' || query) && (
                                    <p className="text-xs text-slate-500">
                                        Menampilkan {filteredProducts.length} dari {pos_products.length} produk
                                        {query && <> untuk “{query}”</>} • Filter: {filter === 'all' ? 'Semua' : filter === 'low' ? 'Stok rendah' : 'Di cart'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {filteredProducts.length === 0 ? (
                            <Card className="rounded-xl border-slate-200 shadow-sm">
                                <CardContent className="grid place-items-center px-6 py-14 text-center">
                                    <span className="grid size-12 place-items-center rounded-xl bg-[#EFF8FF] text-[#0080FF]">
                                        <Package className="size-6" />
                                    </span>
                                    <h3 className="mt-4 text-base font-semibold text-slate-900">
                                        {query || filter !== 'all' ? 'Tidak ada hasil' : 'Belum ada stok aktif'}
                                    </h3>
                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        {query || filter !== 'all'
                                            ? 'Coba kata kunci lain, ubah filter, atau pastikan barang sudah diterima admin jurusan.'
                                            : 'Stok aktif kosong. Terima barang titipan dulu di halaman Penerimaan.'}
                                    </p>
                                    {(query || filter !== 'all') && (
                                        <Button variant="outline" className="mt-4 rounded-xl" onClick={() => {
 setQuery(''); setFilter('all'); 
}}>
                                            Reset filter
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                                {filteredProducts.map((product) => {
                                    const quantity = quantityFor(product);
                                    const isLow = product.available_quantity <= 3;
                                    const isInCart = quantity > 0;

                                    return (
                                        <article
                                            key={`${product.source}:${product.id}`}
                                            className={`group flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-md ${
                                                isInCart ? 'border-[#BCE0FF] ring-1 ring-[#BCE0FF]' : 'border-slate-200'
                                            }`}
                                        >
                                            <div className="flex aspect-square items-center justify-center bg-slate-50 text-slate-400 transition group-hover:bg-[#EFF8FF] group-hover:text-[#0080FF]">
                                                <Package className="size-12" />
                                            </div>
                                            <div className="flex flex-1 flex-col gap-3 p-4">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{product.product_name}</p>
                                                        <p className="mt-1 truncate text-xs text-slate-500">{product.seller_name}</p>
                                                        <Badge
                                                            variant="secondary"
                                                            className={`mt-2 rounded-full px-2 py-0 text-[11px] font-medium ${product.source === 'product' ? 'bg-[#EFF8FF] text-[#0080FF] ring-1 ring-blue-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}
                                                        >
                                                            {product.source === 'product' ? 'Produk UP' : 'Titipan Seller'}
                                                        </Badge>
                                                    </div>
                                                    <Badge
                                                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                                                            isLow
                                                                ? 'bg-[#FFF7ED] text-[#EA580C] ring-orange-200'
                                                                : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                                        }`}
                                                    >
                                                        Stok {product.available_quantity}
                                                    </Badge>
                                                </div>
                                                <div className="mt-auto flex items-center justify-between gap-3">
                                                    <p className="text-sm font-bold tabular-nums text-slate-900">{formatRupiah(product.price)}</p>
                                                    <Stepper value={quantity} onMinus={() => setQuantity(product, quantity - 1)} onPlus={() => setQuantity(product, quantity + 1)} />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => setQuantity(product, quantity || 1)}
                                                variant={isInCart ? 'secondary' : 'default'}
                                                className={`h-11 w-full rounded-none border-t font-semibold ${isInCart ? 'bg-slate-900 text-white hover:bg-slate-800' : ''}`}
                                            >
                                                <ShoppingCart className="size-4" />
                                                {isInCart ? 'Update Cart' : 'Tambah Cart'}
                                            </Button>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Desktop cart */}
                    <aside className="hidden xl:block xl:sticky xl:top-6 xl:h-fit">
                        <CartPanel
                            cart={cart}
                            cartQuantity={cartQuantity}
                            cartSubtotal={cartSubtotal}
                            setQuantity={setQuantity}
                            setCart={setCart}
                        />
                    </aside>
                </div>

                {/* Mobile bottom sheet */}
                <div className="xl:hidden">
                    {/* Collapsed bar */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
                        <div className="mx-auto max-w-7xl p-4">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <span className="grid size-8 place-items-center rounded-full bg-slate-900 text-white">
                                            <ShoppingCart className="size-4" />
                                        </span>
                                        {cart.length === 0 ? 'Cart kosong' : `${cartQuantity} item • ${formatRupiah(cartSubtotal)}`}
                                    </p>
                                    <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                                        {cart.length === 0 ? 'Pilih produk di atas untuk mulai transaksi.' : `${cart.length} produk dipilih. Cek detail sebelum catat penjualan.`}
                                    </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {cart.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setCart([])}
                                            className="hidden sm:inline-flex rounded-full text-rose-600 hover:bg-rose-50"
                                        >
                                            Clear
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setMobileCartOpen((o) => !o)}
                                        className="rounded-full"
                                        aria-expanded={mobileCartOpen}
                                        aria-controls="mobile-cart-sheet"
                                    >
                                        {mobileCartOpen ? 'Tutup' : `Cart (${cart.length})`}
                                    </Button>
                                </div>
                            </div>

                            {mobileCartOpen && (
                                <div id="mobile-cart-sheet" className="mt-4 max-h-[55vh] overflow-auto rounded-xl border border-slate-200 bg-white">
                                    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                                        <h2 className="font-semibold">Cart Details</h2>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => setMobileCartOpen(false)}
                                            aria-label="Tutup cart"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </div>
                                    <div className="p-4">
                                        <CartPanel
                                            cart={cart}
                                            cartQuantity={cartQuantity}
                                            cartSubtotal={cartSubtotal}
                                            setQuantity={setQuantity}
                                            setCart={setCart}
                                            compact
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function CartPanel({
    cart,
    cartQuantity,
    cartSubtotal,
    setQuantity,
    setCart,
    compact = false,
}: {
    cart: CartItem[];
    cartQuantity: number;
    cartSubtotal: number;
    setQuantity: (p: PosProduct, q: number) => void;
    setCart: (v: CartItem[]) => void;
    compact?: boolean;
}) {
    return (
        <Card className={`rounded-xl border-slate-200 shadow-sm ${compact ? 'border-0 shadow-none' : ''}`}>
            <CardContent className={compact ? 'p-0' : 'p-5'}>
                {!compact && (
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold tracking-tight text-slate-900">Cart Details</h2>
                            <p className="text-sm text-slate-500">{cartQuantity} item dipilih</p>
                        </div>
                        {cart.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setCart([])}
                                className="h-9 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                            >
                                <Trash2 className="size-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                )}

                <div className={`space-y-3 ${compact ? '' : 'mt-5'}`}>
                    {cart.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-6 text-center">
                            <div className="mx-auto grid size-10 place-items-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200">
                                <ShoppingCart className="size-5" />
                            </div>
                            <p className="mt-3 text-sm font-semibold text-slate-700">Cart masih kosong</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">Pilih produk dari menu di sebelah kiri.</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={`${item.source}:${item.id}`} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                <div className="flex justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">{item.product_name}</p>
                                        <p className="mt-1 truncate text-xs text-slate-500">{item.seller_name}</p>
                                        <Badge className="mt-2 rounded-full bg-slate-100 px-2 py-0 text-[11px] text-slate-600">{item.source === 'product' ? 'Produk UP' : 'Titipan'}</Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setQuantity(item, 0)}
                                        className="size-9 shrink-0 rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                                        aria-label={`Hapus ${item.product_name} dari cart`}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="mt-3 flex items-center justify-between gap-3">
                                    <p className="text-sm font-bold tabular-nums text-slate-900">{formatRupiah(item.price * item.quantity)}</p>
                                    <Stepper value={item.quantity} onMinus={() => setQuantity(item, item.quantity - 1)} onPlus={() => setQuantity(item, item.quantity + 1)} />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Subtotal</span>
                        <span className="font-semibold tabular-nums text-slate-900">{formatRupiah(cartSubtotal)}</span>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-slate-200 pt-3 text-base">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="text-lg font-bold tabular-nums text-slate-900">{formatRupiah(cartSubtotal)}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">Tunai • Stok otomatis tercatat ke laporan harian</p>
                </div>

                <Form action="/picket/up-jurusan/sales" method="post" className="mt-4" onSuccess={() => setCart([])}>
                    {({ processing, errors }) => (
                        <>
                            {cart.map((item, index) => (
                                <div key={`${item.source}:${item.id}`}>
                                    <input type="hidden" name={`items[${index}][id]`} value={item.id} />
                                    <input type="hidden" name={`items[${index}][source]`} value={item.source} />
                                    <input type="hidden" name={`items[${index}][quantity]`} value={item.quantity} />
                                </div>
                            ))}
                            <Button type="submit" disabled={processing || cart.length === 0} className="h-11 w-full rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60">
                                {processing ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                                {processing ? 'Memproses...' : 'Catat Penjualan'}
                            </Button>
                            <InputError message={errors.report ?? errors.items ?? errors.quantity ?? errors['items.0.quantity']} />
                            {cart.length === 0 && <p className="mt-2 text-center text-xs text-slate-500">Tambah minimal 1 produk untuk melanjutkan.</p>}
                        </>
                    )}
                </Form>
            </CardContent>
        </Card>
    );
}

function Stepper({ value, onMinus, onPlus }: { value: number; onMinus: () => void; onPlus: () => void }) {
    return (
        <div className="flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <Button
                type="button"
                variant="ghost"
                onClick={onMinus}
                disabled={value === 0}
                className="size-9 rounded-full text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                aria-label="Kurangi jumlah"
            >
                <Minus className="size-4" />
            </Button>
            <span className="w-9 text-center text-sm font-bold tabular-nums text-slate-900">{value}</span>
            <Button
                type="button"
                variant="ghost"
                onClick={onPlus}
                className="size-9 rounded-full bg-[#0080FF] text-white hover:bg-[#006FE0] active:bg-[#0059B8]"
                aria-label="Tambah jumlah"
            >
                <Plus className="size-4" />
            </Button>
        </div>
    );
}

PicketUpJurusanConsignments.layout = {
    breadcrumbs: [
        { title: 'Terima Barang', href: '/picket/receiving' },
        { title: 'POS Terminal', href: '/picket/pos' },
    ],
};
