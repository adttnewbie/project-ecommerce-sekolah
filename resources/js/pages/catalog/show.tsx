import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Clock3,
    Package,
    ShoppingCart,
    Star,
    Store,
    Tags,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
    preOrderDeadlineSummary,
    preOrderStatusMeta,
    resolvePreOrderStatus
    
} from '@/lib/pre-order';
import type {PreOrderStatus} from '@/lib/pre-order';
import { cn } from '@/lib/utils';
import { home, login } from '@/routes';
import { store as storeCartItem } from '@/routes/cart/items';
import { confirm as checkoutConfirm } from '@/routes/checkout';
import type { Auth } from '@/types';

type ReviewSummary = {
    average: number;
    count: number;
};

type ProductReview = {
    user_name: string;
    rating: number;
    comment: string | null;
    created_at: string | null;
};

type CatalogProduct = {
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
        id: number;
        name: string;
        type: 'seller' | 'up_jurusan';
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
    pickup_place: {
        id: number;
        name: string;
    } | null;
    review_summary: ReviewSummary | null;
    sold_count: number | null;
    reviews: ProductReview[];
    my_review: {
        rating: number;
        comment: string | null;
        status: {
            code: 'pending' | 'approved' | 'rejected';
            label: string;
        };
        rejection_reason: string | null;
    } | null;
    can_review: boolean;
    has_purchased: boolean;
};

type CatalogShowProps = {
    product: CatalogProduct;
};

type PageProps = {
    auth: Auth;
    flash: {
        success?: string;
        error?: string;
    };
} & SharedPageProps;

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

const formatDate = (value: string | null) =>
    value
        ? new Intl.DateTimeFormat('id-ID', {
              dateStyle: 'medium',
          }).format(new Date(value))
        : '-';

export default function CatalogShow({ product }: CatalogShowProps) {
    const { auth, flash } = usePage<PageProps>().props;
    const src = imageSource(product.image);
    const isOutOfStock = !product.is_pre_order && product.stock <= 0;
    const preOrderStatus = resolvePreOrderStatus(product);
    const preOrderMeta =
        preOrderStatus !== null ? preOrderStatusMeta(preOrderStatus) : null;
    const isPreOrderClosed = preOrderStatus === 'closed';
    const notPurchasable = isOutOfStock || isPreOrderClosed;
    const deadlineSummary = product.pre_order_deadline
        ? preOrderDeadlineSummary(product.pre_order_deadline)
        : null;
    const isBuyer = auth.user?.role === 'buyer';
    const [formRating, setFormRating] = useState(
        product.my_review?.rating ?? 0,
    );
    const [hoveredRating, setHoveredRating] = useState(0);
    const activeRating = hoveredRating > 0 ? hoveredRating : formRating;

    return (
        <>
            <Head title={product.name} />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
                        <Link href={home()} className="hover:text-[#0080FF] focus-visible:text-[#0080FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 rounded">
                            Beranda
                        </Link>
                        <span aria-hidden className="text-slate-400">/</span>
                        <span className="text-slate-700">{product.category.name}</span>
                        <span aria-hidden className="text-slate-400">/</span>
                        <span className="truncate font-medium text-slate-900" aria-current="page">{product.name}</span>
                    </nav>

                    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
                        <div className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                            <div className="aspect-square bg-slate-50">
                                {src ? (
                                    <img
                                        src={src}
                                        alt={product.name}
                                        loading="lazy"
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-[#EFF8FF] text-[#0080FF]">
                                        <Package className="size-16" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <Card className="rounded-[14px] border border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:sticky lg:top-24">
                            <CardContent className="space-y-6 p-5 sm:p-6">
                                {(flash.success || flash.error) && (
                                    <div
                                        className={`rounded-[10px] border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.05)] ${
                                            flash.error
                                                ? 'border-red-200 bg-[#FEF2F2] text-[#DC2626]'
                                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        }`}
                                        role="status"
                                    >
                                        {flash.error || flash.success}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <Badge className="rounded-full bg-[#EFF8FF] px-2.5 py-0.5 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                        <Tags className="size-3.5" />
                                        {product.category.name}
                                    </Badge>
                                    {product.is_pre_order && preOrderMeta && (
                                        <Badge
                                            className={cn(
                                                'rounded-full px-2.5 py-0.5 ring-1',
                                                preOrderMeta.badgeClass,
                                            )}
                                        >
                                            {isPreOrderClosed
                                                ? 'Pre-Order Ditutup'
                                                : `Pre-Order ${product.pre_order_estimate_days} hari`}
                                        </Badge>
                                    )}
                                    {!product.is_pre_order && (
                                        <Badge
                                            className={
                                                isOutOfStock
                                                    ? 'rounded-full bg-[#FEF2F2] text-[#DC2626] ring-1 ring-red-200'
                                                    : 'rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                            }
                                        >
                                            {isOutOfStock
                                                ? 'Stok habis'
                                                : `Stok ${product.stock}`}
                                        </Badge>
                                    )}
                                </div>

                                {product.is_pre_order &&
                                    preOrderStatus !== null &&
                                    preOrderMeta && (
                                        <div
                                            className={cn(
                                                'rounded-[14px] border px-4 py-3 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.05)]',
                                                preOrderMeta.boxClass,
                                                preOrderMeta.textClass,
                                            )}
                                        >
                                            {isPreOrderClosed ? (
                                                <>
                                                    Pre-order untuk produk ini{' '}
                                                    sudah ditutup.
                                                </>
                                            ) : (
                                                <>
                                                    Produk ini memakai sistem
                                                    pre-order. Estimasi siap
                                                    dalam{' '}
                                                    {
                                                        product.pre_order_estimate_days
                                                    }{' '}
                                                    hari setelah pesanan
                                                    dibuat.
                                                </>
                                            )}
                                            {product.pre_order_note && (
                                                <span className="mt-1 block opacity-80">
                                                    {product.pre_order_note}
                                                </span>
                                            )}
                                            {(deadlineSummary ||
                                                product.pre_order_min_quantity) && (
                                                <span className="mt-2 block text-xs opacity-80">
                                                    {deadlineSummary &&
                                                        `Deadline: ${deadlineSummary}`}
                                                    {deadlineSummary &&
                                                        product.pre_order_min_quantity &&
                                                        ' • '}
                                                    {product.pre_order_min_quantity &&
                                                        `Minimum ${product.pre_order_min_quantity} item per pesanan`}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        {product.name}
                                    </h1>
                                    <p className="mt-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <Store className="size-4" />
                                        {product.owner.name}
                                    </p>
                                </div>

                                <div>
                                    {product.original_price !== null &&
                                        product.original_price >
                                            product.price && (
                                            <div className="mb-1 flex flex-wrap items-center gap-2">
                                                <p className="text-sm text-slate-400 tabular-nums line-through">
                                                    {formatRupiah(
                                                        product.original_price,
                                                    )}
                                                </p>
                                                <Badge className="rounded-full bg-emerald-50 text-emerald-700">
                                                    -
                                                    {Math.round(
                                                        ((product.original_price -
                                                            product.price) /
                                                            product.original_price) *
                                                            100,
                                                    )}
                                                    %
                                                </Badge>
                                            </div>
                                        )}
                                    <p className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                                        {formatRupiah(product.price)}
                                    </p>
                                    {(product.review_summary ||
                                        product.sold_count) && (
                                        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
                                            {product.review_summary && (
                                                <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                                    {
                                                        product.review_summary
                                                            .average
                                                    }
                                                    <span className="font-normal text-slate-400">
                                                        ({' '}
                                                        {
                                                            product
                                                                .review_summary
                                                                .count
                                                        }{' '}
                                                        ulasan)
                                                    </span>
                                                </span>
                                            )}
                                            {product.sold_count !== null && (
                                                <span>
                                                    {product.sold_count} terjual
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    <p className="mt-1 text-sm text-slate-500">
                                        Harga produk dari {product.owner.name}.
                                    </p>
                                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                        <Store className="size-4" />
                                        Ambil di{' '}
                                        {product.pickup_place?.name ??
                                            'titik pickup sekolah'}
                                    </p>
                                </div>

                                {isBuyer ? (
                                    <div className="space-y-3">
                                        {product.is_pre_order && product.pre_order_min_quantity && product.pre_order_min_quantity > 1 && !isPreOrderClosed && (
                                            <p className="text-xs text-slate-500">
                                                Minimum {product.pre_order_min_quantity} item per pesanan pre-order.
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            {notPurchasable ? (
                                                <Button
                                                    type="button"
                                                    disabled
                                                    className="h-11 w-full rounded-[12px] sm:w-fit px-6"
                                                >
                                                    {isOutOfStock
                                                        ? 'Stok habis'
                                                        : 'Pre-order ditutup'}
                                                </Button>
                                            ) : (
                                                <Button
                                                    asChild
                                                    className="h-11 w-full sm:w-fit rounded-[12px] bg-[#0080FF] px-6 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-[#006FE0] active:bg-[#0059B8]"
                                                >
                                                    <Link
                                                        href={checkoutConfirm({
                                                            query: {
                                                                product:
                                                                    product.slug,
                                                            },
                                                        })}
                                                        aria-label="Beli Sekarang — primary"
                                                    >
                                                        Beli Sekarang
                                                    </Link>
                                                </Button>
                                            )}

                                            <Form
                                                {...storeCartItem.form(
                                                    product.slug,
                                                )}
                                                disableWhileProcessing
                                                className="flex items-center gap-2"
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <input
                                                            type="hidden"
                                                            name="quantity"
                                                            value={product.pre_order_min_quantity ?? 1}
                                                            readOnly
                                                        />
                                                        <Button
                                                            type="submit"
                                                            disabled={
                                                                notPurchasable ||
                                                                processing
                                                            }
                                                            variant="outline"
                                                            className="h-11 rounded-[12px] border-slate-200 bg-white px-5 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50"
                                                            aria-label="Tambah ke Keranjang"
                                                            title="Tambah ke Keranjang"
                                                        >
                                                            {processing ? (
                                                                <Spinner />
                                                            ) : (
                                                                <ShoppingCart className="size-4" />
                                                            )}
                                                            Tambah ke Keranjang
                                                        </Button>
                                                        <InputError
                                                            message={
                                                                errors.quantity
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </Form>
                                        </div>
                                    </div>
                                ) : auth.user ? (
                                    <Button
                                        type="button"
                                        disabled
                                        className="h-11 w-full"
                                    >
                                        <ShoppingCart className="size-4" />
                                        Khusus buyer
                                    </Button>
                                ) : notPurchasable ? (
                                    <Button
                                        type="button"
                                        disabled
                                        className="h-11 w-full"
                                    >
                                        <ShoppingCart className="size-4" />
                                        {isOutOfStock
                                            ? 'Stok habis'
                                            : 'Pre-order ditutup'}
                                    </Button>
                                ) : (
                                    <Button asChild className="h-11 w-full">
                                        <Link href={login()}>
                                            <ShoppingCart className="size-4" />
                                            Login untuk tambah
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </section>

                    <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:p-6">
                        <h2 className="text-xl font-semibold text-slate-900">
                            Deskripsi produk
                        </h2>
                        <p className="mt-3 text-base leading-6 whitespace-pre-line text-slate-600">
                            {product.description}
                        </p>
                    </section>

                    <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05)] sm:p-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h2 className="text-xl font-semibold text-slate-900">
                                Ulasan pembeli
                            </h2>
                            {product.review_summary && (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                                    <Star className="size-4 fill-amber-400 text-amber-400" />
                                    {product.review_summary.average} / 5
                                    <span className="font-normal text-amber-600">
                                        • {product.review_summary.count} ulasan
                                    </span>
                                </span>
                            )}
                        </div>

                        {isBuyer &&
                        (product.can_review || product.my_review) ? (
                            <div className="mt-5 rounded-[14px] border border-slate-200 bg-slate-50 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-semibold text-slate-800">
                                        {product.my_review
                                            ? 'Ulasan kamu'
                                            : 'Tulis ulasan'}
                                    </p>
                                    {product.my_review?.status.code ===
                                        'pending' && (
                                        <Badge className="rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                                            <Clock3 className="size-3.5" />
                                            Menunggu moderasi
                                        </Badge>
                                    )}
                                    {product.my_review?.status.code ===
                                        'rejected' && (
                                        <Badge className="rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200">
                                            Ditolak
                                        </Badge>
                                    )}
                                </div>
                                {product.my_review?.status.code ===
                                    'rejected' &&
                                    product.my_review.rejection_reason && (
                                        <p className="mt-2 rounded-[10px] border border-red-200 bg-[#FEF2F2] px-3 py-2 text-xs leading-5 text-[#DC2626]">
                                            Alasan:{' '}
                                            {product.my_review.rejection_reason}
                                        </p>
                                    )}
                                {product.my_review && (
                                    <p className="mt-1 text-xs text-slate-500">
                                        Perubahan ulasan akan dimoderasi ulang
                                        sebelum tampil kembali.
                                    </p>
                                )}
                                <Form
                                    action={`/catalog/${product.slug}/reviews`}
                                    method={product.my_review ? 'put' : 'post'}
                                    disableWhileProcessing
                                    className="mt-3 space-y-3"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <input
                                                type="hidden"
                                                name="rating"
                                                value={formRating}
                                                readOnly
                                            />
                                            <div
                                                className="flex items-center gap-1"
                                                role="radiogroup"
                                                aria-label="Pilih rating"
                                            >
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        role="radio"
                                                        aria-checked={
                                                            formRating === star
                                                        }
                                                        aria-label={`${star} bintang`}
                                                        onClick={() =>
                                                            setFormRating(star)
                                                        }
                                                        onMouseEnter={() =>
                                                            setHoveredRating(
                                                                star,
                                                            )
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredRating(0)
                                                        }
                                                        className="size-11 rounded-[12px] transition focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:outline-none grid place-items-center hover:bg-amber-50"
                                                    >
                                                        <Star
                                                            className={cn(
                                                                'size-6 transition duration-[180ms]',
                                                                activeRating >=
                                                                    star
                                                                    ? 'fill-amber-400 text-amber-400'
                                                                    : 'text-slate-300',
                                                            )}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <InputError
                                                message={errors.rating}
                                            />
                                            <Textarea
                                                name="comment"
                                                className="min-h-24 rounded-[10px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                                                placeholder={
                                                    product.my_review
                                                        ?.comment ??
                                                    'Bagikan pengalamanmu memakai produk ini (opsional)...'
                                                }
                                                defaultValue={
                                                    product.my_review
                                                        ?.comment ?? ''
                                                }
                                                maxLength={1000}
                                            />
                                            <InputError
                                                message={errors.comment}
                                            />
                                            <InputError
                                                message={errors.review}
                                            />
                                            <Button
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    (!product.my_review &&
                                                        formRating === 0)
                                                }
                                                className="h-11 w-fit px-5"
                                            >
                                                {processing && <Spinner />}
                                                {product.my_review
                                                    ? 'Perbarui Ulasan'
                                                    : 'Kirim Ulasan'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </div>
                        ) : isBuyer && !product.has_purchased ? (
                            <div className="mt-5 rounded-[10px] border border-[#BCE0FF] bg-[#EFF8FF] px-4 py-3 text-sm text-[#0059B8]">
                                Selesaikan pesanan produk ini terlebih dahulu
                                untuk memberi ulasan.
                            </div>
                        ) : !auth.user ? (
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-slate-50 px-4 py-3">
                                <p className="text-sm text-slate-600">
                                    Login untuk memberi ulasan.
                                </p>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="h-11 rounded-[12px]"
                                >
                                    <Link href={login()}>Login</Link>
                                </Button>
                            </div>
                        ) : null}

                        <div className="mt-6 space-y-4">
                            {product.reviews.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    Belum ada ulasan untuk produk ini.
                                </p>
                            ) : (
                                product.reviews.map((review) => (
                                    <article
                                        key={`${review.user_name}-${review.created_at}`}
                                        className="flex gap-3 border-b border-slate-100 pb-4 last:border-b-0 last:pb-0"
                                    >
                                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#EFF8FF] text-sm font-bold text-[#0080FF]">
                                            {review.user_name.charAt(0)}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <p className="text-sm font-semibold text-slate-950">
                                                    {review.user_name}
                                                </p>
                                                <span className="flex items-center gap-0.5">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <Star
                                                                key={star}
                                                                className={cn(
                                                                    'size-3.5',
                                                                    review.rating >=
                                                                        star
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'text-slate-300',
                                                                )}
                                                            />
                                                        ),
                                                    )}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(
                                                        review.created_at,
                                                    )}
                                                </span>
                                            </div>
                                            {review.comment && (
                                                <p className="mt-1 text-sm leading-6 text-slate-600">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Sticky bottom CTA mobile — §11.3 §16 */}
                    {isBuyer && (
                        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] lg:hidden">
                            <div className="flex gap-2">
                                {notPurchasable ? (
                                    <Button type="button" disabled className="h-11 flex-1 rounded-[12px]">
                                        {isOutOfStock ? 'Stok habis' : 'Pre-order ditutup'}
                                    </Button>
                                ) : (
                                    <>
                                        <Form {...storeCartItem.form(product.slug)} disableWhileProcessing className="flex-1">
                                            {({ processing }) => (
                                                <Button type="submit" disabled={processing} variant="outline" className="h-11 w-full rounded-[12px] border-slate-200 bg-white">
                                                    {processing ? <Spinner /> : <ShoppingCart className="size-4" />}
                                                    Keranjang
                                                </Button>
                                            )}
                                        </Form>
                                        <Button asChild className="h-11 flex-1 rounded-[12px] bg-[#0080FF] hover:bg-[#006FE0] active:bg-[#0059B8]">
                                            <Link href={checkoutConfirm({ query: { product: product.slug } })}>Beli Sekarang</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {isBuyer && <div className="h-20 lg:hidden" aria-hidden />}
        </>
    );
}
