import { Link, router, usePage } from '@inertiajs/react';
import { Heart, Package, ShoppingCart, Star, Store } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resolvePreOrderStatus } from '@/lib/pre-order';
import type { PreOrderStatus } from '@/lib/pre-order';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store as storeCartItem } from '@/routes/cart/items';
import { show as catalogShow } from '@/routes/catalog';
import { confirm as checkoutConfirm } from '@/routes/checkout';
import { toggle as wishlistToggle } from '@/routes/wishlist';
import type { Auth } from '@/types';

type ReviewSummary = {
    average: number;
    count: number;
};

export type ProductCardProduct = {
    id: number;
    name: string;
    slug: string;
    description: string;
    price: number;
    original_price: number | null;
    stock: number;
    is_pre_order: boolean;
    fulfillment_type: {
        code: 'ready_stock' | 'pre_order';
        label: string;
    };
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_status?: PreOrderStatus | null;
    pre_order_min_quantity: number | null;
    pre_order_note: string | null;
    image: string | null;
    seller: {
        id: number;
        name: string;
    } | null;
    owner: {
        id: number | null;
        name: string | null;
        type: 'seller' | 'up_jurusan' | null;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    review_summary: ReviewSummary | null;
    sold_count: number | null;
    is_wishlisted: boolean;
};

type ProductCardProps = {
    product: ProductCardProduct;
    /**
     * Wishlist-ready: parent may control wishlist via callback.
     * If not provided, component handles optimistic backend toggle internally
     * (guest → login, auth → POST /wishlist/{slug}).
     */
    onWishlistToggle?: (product: ProductCardProduct, next: boolean) => void;
    onAddToCart?: (product: ProductCardProduct) => void;
    /**
     * Buy-now: extension point. If not provided, defaults to
     * router.visit(checkoutConfirm({ product: slug }).url) — keep <ProductCard product={p} /> simple.
     */
    onBuyNow?: (product: ProductCardProduct) => void;
    className?: string;
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

const imageSource = (image: string | null) => {
    if (!image) {
        return null;
    }

    return image.startsWith('http') || image.startsWith('/')
        ? image
        : `/storage/${image}`;
};

export function ProductCard({
    product,
    onWishlistToggle,
    onAddToCart,
    onBuyNow,
    className,
}: ProductCardProps) {
    const pageProps = usePage().props as unknown as { auth: Auth };
    const auth = pageProps.auth;
    const isGuest = !auth?.user;
    const isBuyer =
        auth?.user?.role === 'buyer' || auth?.user?.role === 'seller';
    const preOrderStatus = resolvePreOrderStatus(product);
    const isPreOrderClosed = preOrderStatus === 'closed';
    const isOutOfStock = !product.is_pre_order && product.stock <= 0;
    const notPurchasable = isOutOfStock || isPreOrderClosed;

    const src = imageSource(product.image);
    const [imgError, setImgError] = useState(false);
    const [wishlisted, setWishlisted] = useState<boolean>(
        product.is_wishlisted,
    );
    const [syncedWishlisted, setSyncedWishlisted] = useState(
        product.is_wishlisted,
    );
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);

    // Adjust state during render when the incoming wishlist flag changes
    // (React-recommended alternative to setState inside an effect).
    if (syncedWishlisted !== product.is_wishlisted) {
        setSyncedWishlisted(product.is_wishlisted);
        setWishlisted(product.is_wishlisted);
    }

    const showImage = src && !imgError;

    const discountPercent =
        product.original_price !== null &&
        product.original_price > product.price
            ? Math.round(
                  ((product.original_price - product.price) /
                      product.original_price) *
                      100,
              )
            : null;

    const hasRating =
        product.review_summary !== null && product.review_summary.count > 0;
    const hasSold = product.sold_count !== null && product.sold_count > 0;
    const showOriginal =
        product.original_price !== null &&
        product.original_price > product.price;

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onWishlistToggle) {
            const next = !wishlisted;
            setWishlisted(next);
            onWishlistToggle(product, next);

            return;
        }

        if (isGuest) {
            router.visit(login().url);

            return;
        }

        // Authenticated optimistic toggle → backend persistence
        const next = !wishlisted;
        setWishlisted(next);
        setWishlistLoading(true);

        router.post(
            wishlistToggle(product.slug).url,
            {},
            {
                preserveScroll: true,
                preserveUrl: true,
                onSuccess: () => {
                    toast.success(
                        next
                            ? 'Ditambahkan ke wishlist'
                            : 'Dihapus dari wishlist',
                    );
                },
                onError: () => {
                    setWishlisted(!next);
                    toast.error('Gagal memperbarui wishlist');
                },
                onFinish: () => setWishlistLoading(false),
            },
        );
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onAddToCart) {
            onAddToCart(product);

            return;
        }

        if (notPurchasable) {
            return;
        }

        if (isGuest) {
            router.visit(login().url);

            return;
        }

        if (!isBuyer) {
            toast.error('Khusus buyer');

            return;
        }

        setCartLoading(true);
        router.post(
            storeCartItem(product.slug).url,
            { quantity: 1 },
            {
                preserveScroll: true,
                preserveUrl: true,
                onSuccess: () => {
                    toast.success('Produk ditambahkan ke keranjang');
                },
                onError: (errors) => {
                    const msg =
                        (errors as Record<string, string>)?.quantity ??
                        'Gagal menambahkan ke keranjang';
                    toast.error(msg);
                },
                onFinish: () => setCartLoading(false),
            },
        );
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onBuyNow) {
            onBuyNow(product);

            return;
        }

        if (notPurchasable) {
            return;
        }

        if (isGuest) {
            router.visit(login().url);

            return;
        }

        if (!isBuyer) {
            toast.error('Khusus buyer');

            return;
        }

        router.visit(checkoutConfirm({ query: { product: product.slug } }).url);
    };

    return (
        <div className={cn('group/card h-full', className)}>
            <Card
                className={cn(
                    'flex h-full flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-white py-0 shadow-sm',
                    'transition duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                    'hover:-translate-y-0.5 hover:border-[#BCE0FF] hover:shadow-md',
                    'motion-reduce:transform-none motion-reduce:transition-none',
                    'has-[>img:first-child]:pt-0',
                )}
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                    <Link
                        href={catalogShow(product.slug)}
                        className="absolute inset-0 block focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:outline-none focus-visible:ring-inset"
                        aria-label={`Lihat detail ${product.name}`}
                    >
                        {showImage ? (
                            <img
                                src={src}
                                alt={product.name}
                                loading="lazy"
                                decoding="async"
                                onError={() => setImgError(true)}
                                className="size-full object-cover transition duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.03] motion-reduce:transform-none"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-[#EFF8FF] text-[#0080FF]">
                                <Package className="size-9" aria-hidden />
                            </div>
                        )}
                    </Link>

                    {/* Top badges on image */}
                    <div className="pointer-events-none absolute top-2 left-2 flex flex-wrap gap-1.5">
                        {discountPercent !== null && (
                            <Badge className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 ring-1 ring-rose-200">
                                -{discountPercent}%
                            </Badge>
                        )}
                        {product.is_pre_order && (
                            <Badge
                                className={cn(
                                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1',
                                    preOrderStatus === 'closing_soon' &&
                                        'bg-orange-50 text-orange-700 ring-orange-200',
                                    preOrderStatus === 'closed'
                                        ? 'bg-rose-50 text-rose-700 ring-rose-200'
                                        : preOrderStatus !== 'closing_soon' &&
                                              'bg-[#EFF8FF] text-[#0080FF] ring-[#BCE0FF]',
                                )}
                            >
                                {isPreOrderClosed
                                    ? 'Pre-Order ditutup'
                                    : `PO ${product.pre_order_estimate_days} hari`}
                            </Badge>
                        )}
                    </div>

                    {/* Wishlist — visual 36, hit 44 via padding */}
                    <button
                        type="button"
                        onClick={handleWishlist}
                        disabled={wishlistLoading}
                        aria-label={
                            wishlisted
                                ? 'Hapus dari wishlist'
                                : 'Tambah ke wishlist'
                        }
                        aria-pressed={wishlisted}
                        title={
                            wishlisted
                                ? 'Hapus dari wishlist'
                                : 'Tambah ke wishlist'
                        }
                        className={cn(
                            'absolute top-2 right-2 grid size-9 place-items-center rounded-full border bg-white/90 shadow-[0_1px_2px_rgba(15,23,42,0.05)] backdrop-blur transition duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                            'hover:bg-white focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:outline-none',
                            'disabled:opacity-60',
                            'after:absolute after:-inset-1 after:content-[""]',
                            wishlisted
                                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-50'
                                : 'border-slate-200 text-slate-500 hover:text-rose-600',
                        )}
                    >
                        <Heart
                            className={cn(
                                'size-4',
                                wishlisted && 'fill-rose-500 text-rose-500',
                            )}
                            aria-hidden
                        />
                    </button>

                    {/* Out of stock / pre-order closed overlays */}
                    {isOutOfStock && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/85 px-2 py-1.5 text-center text-[11px] font-semibold tracking-wide text-slate-700 backdrop-blur">
                            Stok habis
                        </div>
                    )}
                    {isPreOrderClosed && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-white/85 px-2 py-1.5 text-center text-[11px] font-semibold tracking-wide text-rose-700 backdrop-blur">
                            Pre-order ditutup
                        </div>
                    )}
                </div>

                <CardHeader className="space-y-1.5 p-2.5 pb-1.5 sm:p-4 sm:pb-2">
                    <div className="flex flex-wrap gap-1.5">
                        <Badge
                            variant="secondary"
                            className="rounded-full bg-slate-100 px-2 py-0 text-[11px] font-medium text-slate-700"
                        >
                            {product.category.name}
                        </Badge>
                        {!product.is_pre_order && !isOutOfStock && (
                            <Badge className="rounded-full bg-emerald-50 px-2 py-0 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                                Stok {product.stock}
                            </Badge>
                        )}
                        {isOutOfStock && (
                            <Badge className="rounded-full bg-orange-50 px-2 py-0 text-[11px] font-medium text-orange-700 ring-1 ring-orange-200">
                                Stok habis
                            </Badge>
                        )}
                    </div>

                    <Link
                        href={catalogShow(product.slug)}
                        className="block rounded-[6px] focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                        <CardTitle className="line-clamp-2 text-[13px] leading-5 font-bold text-slate-900 sm:text-sm">
                            {product.name}
                        </CardTitle>
                    </Link>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col gap-1.5 p-2.5 pt-0 sm:gap-2 sm:p-4 sm:pt-0">
                    {/* Rating + Sold */}
                    {(hasRating || hasSold) && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                            {hasRating && (
                                <span className="inline-flex items-center gap-1">
                                    <Star
                                        className="size-3.5 fill-amber-400 text-amber-400"
                                        aria-hidden
                                    />
                                    <span className="font-semibold text-slate-700 tabular-nums">
                                        {product.review_summary!.average.toFixed(
                                            1,
                                        )}
                                    </span>
                                    <span className="tabular-nums">
                                        ({product.review_summary!.count})
                                    </span>
                                </span>
                            )}
                            {hasRating && hasSold && (
                                <span className="text-slate-300">•</span>
                            )}
                            {hasSold && (
                                <span className="tabular-nums">
                                    Terjual {product.sold_count}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Price — primary hierarchy */}
                    <div className="space-y-1">
                        <p className="text-[15px] font-bold tracking-tight text-slate-900 tabular-nums sm:text-base">
                            {formatRupiah(product.price)}
                        </p>
                        {showOriginal && (
                            <p className="flex items-center gap-2 text-xs">
                                <span className="text-slate-400 tabular-nums line-through">
                                    {formatRupiah(product.original_price!)}
                                </span>
                                {discountPercent !== null && (
                                    <span className="rounded-full bg-[#FEF2F2] px-1.5 py-0.5 text-[11px] font-bold text-[#DC2626] ring-1 ring-red-200">
                                        -{discountPercent}%
                                    </span>
                                )}
                            </p>
                        )}
                    </div>

                    {/* Footer — compact to avoid horizontal overflow */}
                    <div className="mt-auto flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2.5">
                        <p className="flex min-w-0 flex-1 items-center gap-1 truncate text-[11px] font-medium text-slate-500">
                            <Store className="size-3 shrink-0" aria-hidden />
                            <span className="truncate">
                                {product.owner.name ?? 'Toko Sekolah'}
                            </span>
                        </p>

                        <div className="flex shrink-0 items-center gap-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={notPurchasable || cartLoading}
                                onClick={handleAddToCart}
                                className={cn(
                                    'h-9 shrink-0 rounded-[10px] border-slate-200 bg-white px-2 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50',
                                    'relative after:absolute after:-inset-1 after:content-[""]',
                                    notPurchasable && 'opacity-50',
                                )}
                                aria-label={
                                    isOutOfStock
                                        ? 'Stok habis'
                                        : isPreOrderClosed
                                          ? 'Pre-order ditutup'
                                          : `Tambah ${product.name} ke keranjang`
                                }
                                title={
                                    isOutOfStock
                                        ? 'Stok habis'
                                        : isPreOrderClosed
                                          ? 'Pre-order ditutup'
                                          : `Tambah ${product.name} ke keranjang`
                                }
                            >
                                {cartLoading ? (
                                    <span
                                        className="size-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700"
                                        aria-hidden
                                    />
                                ) : (
                                    <ShoppingCart
                                        className="size-3.5 sm:size-4"
                                        aria-hidden
                                    />
                                )}
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                disabled={notPurchasable}
                                onClick={handleBuyNow}
                                className="relative h-9 shrink-0 rounded-[10px] bg-[#0080FF] px-2.5 text-xs font-semibold text-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] after:absolute after:-inset-1 after:content-[''] hover:bg-[#006FE0] active:bg-[#0059B8]"
                                aria-label={
                                    isOutOfStock
                                        ? 'Stok habis'
                                        : isPreOrderClosed
                                          ? 'Pre-order ditutup'
                                          : `Beli ${product.name} sekarang`
                                }
                                title="Beli Sekarang — primary"
                            >
                                <span>Beli</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
