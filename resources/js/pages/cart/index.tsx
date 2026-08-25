import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Minus,
    Package,
    Plus,
    ShoppingCart,
    Store,
    Tags,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { PreOrderStatus } from '@/lib/pre-order';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import { index as cartIndex } from '@/routes/cart';
import {
    destroy as destroyCartItem,
    update as updateCartItem,
} from '@/routes/cart/items';
import { show as catalogShow } from '@/routes/catalog';

type CartItemProduct = {
    id: number;
    name: string;
    slug: string;
    price: number;
    stock: number;
    is_pre_order: boolean;
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_status?: PreOrderStatus | null;
    pre_order_min_quantity: number | null;
    pre_order_note: string | null;
    image: string | null;
    seller: {
        id: number;
        name: string;
    };
    category: {
        id: number;
        name: string;
        slug: string;
    };
};

type CartItem = {
    id: number;
    quantity: number;
    subtotal: number;
    is_valid?: boolean;
    invalid_reasons?: string[];
    product: CartItemProduct;
};

type CartIndexProps = {
    items: CartItem[];
    summary: {
        total_items: number;
        total_price: number;
        has_invalid_items?: boolean;
    };
};

/**
 * Pre-order specific problem for a cart item, or null when fine.
 * Mirrors PreOrderRules (deadline passed / below minimum quantity).
 */
function preOrderIssue(item: CartItem): string | null {
    const { product } = item;

    if (!product.is_pre_order) {
        return null;
    }

    if (product.pre_order_status === 'closed') {
        return 'Batas waktu pre-order produk ini sudah lewat. Hapus item ini untuk lanjut checkout.';
    }

    if (
        product.pre_order_min_quantity !== null &&
        item.quantity < product.pre_order_min_quantity
    ) {
        return `Jumlah pre-order minimal ${product.pre_order_min_quantity} item.`;
    }

    return null;
}

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

export default function CartIndex({ items, summary }: CartIndexProps) {
    const { flash } = usePage().props;
    const [selectedIds, setSelectedIds] = useState<number[]>(
        items.map((item) => item.id),
    );
    const selectedItems = items.filter((item) => selectedIds.includes(item.id));
    const selectedSummary = {
        total_items: selectedItems.reduce(
            (total, item) => total + item.quantity,
            0,
        ),
        total_price: selectedItems.reduce(
            (total, item) => total + item.subtotal,
            0,
        ),
    };
    const hasInvalidStock = selectedItems.some(
        (item) =>
            !item.product.is_pre_order &&
            (item.product.stock <= 0 || item.quantity > item.product.stock),
    );
    const hasInvalidPreOrder = selectedItems.some(
        (item) => preOrderIssue(item) !== null,
    );
    const hasBlockingIssue = hasInvalidStock || hasInvalidPreOrder;
    const checkoutHref = `/checkout/confirm?items=${selectedIds.join(',')}`;

    const toggleItem = (id: number, checked: boolean) => {
        setSelectedIds((current) =>
            checked
                ? [...current, id]
                : current.filter((itemId) => itemId !== id),
        );
    };

    return (
        <>
            <Head title="Cart" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] bg-[#EFF8FF] text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                    <ShoppingCart className="size-3.5" />
                                    Buyer Cart
                                </Badge>
                                <Badge className="rounded-[6px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                    {summary.total_items} item
                                </Badge>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                Keranjangmu
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Kelola quantity produk sebelum melanjutkan ke
                                checkout.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 w-fit rounded-[12px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)]"
                        >
                            <Link href={home()}>
                                <ArrowLeft className="size-4" />
                                Home
                            </Link>
                        </Button>
                    </section>

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

                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <Card className="gap-0 overflow-hidden rounded-[14px] border border-slate-200 bg-white py-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                            <CardHeader className="flex-row items-center border-b border-slate-100 p-6">
                                <div className="space-y-1">
                                    <CardTitle className="text-xl font-bold text-slate-900">
                                        Item Cart
                                    </CardTitle>
                                    <CardDescription>
                                        Quantity tidak boleh melebihi stok
                                        produk.
                                    </CardDescription>
                                </div>
                                <CardAction>
                                    <div className="flex size-10 items-center justify-center rounded-[14px] bg-slate-100 text-slate-600">
                                        <Package className="size-5" />
                                    </div>
                                </CardAction>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="space-y-3 p-4 xl:hidden">
                                    {items.length === 0 && (
                                        <div className="rounded-[14px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                                            <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                                <ShoppingCart className="size-5" />
                                            </div>
                                            <p className="mt-4 text-base font-bold text-slate-900">
                                                Keranjangmu masih kosong
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-500">
                                                Yuk, temukan produk yang kamu suka dan tambahkan ke keranjang.
                                            </p>
                                            <Button
                                                asChild
                                                className="mt-4 h-11 rounded-[12px] px-6"
                                            >
                                                <Link href={home()}>
                                                    Mulai Belanja
                                                </Link>
                                            </Button>
                                        </div>
                                    )}

                                    {items.map((item) => {
                                        const src = imageSource(
                                            item.product.image,
                                        );
                                        const hasStockIssue =
                                            !item.product.is_pre_order &&
                                            (item.product.stock <= 0 ||
                                                item.quantity >
                                                    item.product.stock);
                                        const poIssue = preOrderIssue(item);

                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-[14px] border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition hover:border-[#BCE0FF] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                                            >
                                                <div className="flex gap-3">
                                                    <Checkbox
                                                        checked={selectedIds.includes(
                                                            item.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            toggleItem(
                                                                item.id,
                                                                checked ===
                                                                    true,
                                                            )
                                                        }
                                                        aria-label={`Pilih ${item.product.name} untuk checkout`}
                                                        className="mt-7"
                                                    />
                                                    <Link
                                                        href={catalogShow(
                                                            item.product.slug,
                                                        )}
                                                        className="flex min-w-0 flex-1 gap-3"
                                                    >
                                                        <div className="size-20 shrink-0 overflow-hidden rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                                            {src ? (
                                                                <img
                                                                    src={src}
                                                                    alt={
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                    loading="lazy"
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex size-full items-center justify-center">
                                                                    <Package className="size-6" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="line-clamp-2 font-bold text-slate-900">
                                                                {
                                                                    item.product
                                                                        .name
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-sm font-bold text-slate-900 tabular-nums">
                                                                {formatRupiah(
                                                                    item.product
                                                                        .price,
                                                                )}
                                                            </p>
                                                            <p
                                                                className={cn(
                                                                    'mt-1 text-xs',
                                                                    hasStockIssue ||
                                                                        poIssue
                                                                        ? 'text-rose-600'
                                                                        : 'text-slate-500',
                                                                )}
                                                            >
                                                                {item.product
                                                                    .is_pre_order
                                                                    ? poIssue?.startsWith(
                                                                            'Batas waktu',
                                                                        )
                                                                        ? 'Pre-order ditutup'
                                                                        : `Pre-Order ${item.product.pre_order_estimate_days} hari`
                                                                    : `Stok ${item.product.stock}`}
                                                            </p>
                                                            {poIssue && (
                                                                <p className="mt-1 rounded-[6px] border border-red-200 bg-[#FEF2F2] px-2 py-1 text-xs leading-4 text-[#DC2626]">
                                                                    {poIssue}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </Link>
                                                </div>

                                                <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3">
                                                    <QuantityStepper
                                                        item={item}
                                                        buttonClassName="size-11"
                                                    />
                                                    <div className="text-right">
                                                        <p className="text-xs text-slate-500">
                                                            Subtotal
                                                        </p>
                                                        <p className="font-bold text-slate-900 tabular-nums">
                                                            {formatRupiah(
                                                                item.subtotal,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <Form
                                                        {...destroyCartItem.form(
                                                            item.id,
                                                        )}
                                                        disableWhileProcessing
                                                    >
                                                        {({ processing }) => (
                                                            <Button
                                                                type="submit"
                                                                variant="outline"
                                                                size="icon"
                                                                className="size-11 rounded-[12px] border-red-200 bg-white text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                                                                disabled={
                                                                    processing
                                                                }
                                                                aria-label="Hapus item cart"
                                                                title="Hapus item"
                                                            >
                                                                {processing ? (
                                                                    <Spinner />
                                                                ) : (
                                                                    <Trash2 className="size-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </Form>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="hidden overflow-x-auto xl:block">
                                    <Table className="min-w-[680px] w-full">
                                        <TableHeader>
                                            <TableRow className="border-slate-100 bg-slate-50 hover:bg-slate-50">
                                                {[
                                                    'Pilih',
                                                    'Produk',
                                                    'Harga',
                                                    'Quantity',
                                                    'Subtotal',
                                                    'Aksi',
                                                ].map((heading) => (
                                                    <TableHead
                                                        key={heading}
                                                        className="h-11 px-4 text-xs font-semibold tracking-wide text-slate-500 uppercase"
                                                    >
                                                        {heading}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.length === 0 && (
                                                <TableRow className="border-slate-100">
                                                    <TableCell
                                                        colSpan={6}
                                                        className="px-6 py-12 text-center"
                                                    >
                                                        <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                                            <ShoppingCart className="size-5" />
                                                        </div>
                                                        <p className="mt-4 text-base font-bold text-slate-900">
                                                            Keranjangmu masih kosong
                                                        </p>
                                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                                            Yuk, temukan produk yang kamu suka dan tambahkan ke keranjang.
                                                        </p>
                                                        <Button
                                                            asChild
                                                            className="mt-4 h-11 rounded-[12px] px-6"
                                                        >
                                                            <Link href={home()}>
                                                                Mulai Belanja
                                                            </Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )}

                                            {items.map((item) => {
                                                const src = imageSource(
                                                    item.product.image,
                                                );
                                                const hasStockIssue =
                                                    item.product.stock <= 0 ||
                                                    item.quantity >
                                                        item.product.stock;
                                                const poIssue =
                                                    preOrderIssue(item);

                                                return (
                                                    <TableRow
                                                        key={item.id}
                                                        className="border-slate-100 hover:bg-slate-50/70"
                                                    >
                                                        <TableCell className="px-4 py-4">
                                                            <Checkbox
                                                                checked={selectedIds.includes(
                                                                    item.id,
                                                                )}
                                                                onCheckedChange={(
                                                                    checked,
                                                                ) =>
                                                                    toggleItem(
                                                                        item.id,
                                                                        checked ===
                                                                            true,
                                                                    )
                                                                }
                                                                aria-label={`Pilih ${item.product.name} untuk checkout`}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="min-w-[16rem] px-4 py-4">
                                                            <Link
                                                                href={catalogShow(
                                                                    item.product
                                                                        .slug,
                                                                )}
                                                                className="flex min-w-0 items-center gap-3"
                                                            >
                                                                <div className="size-12 shrink-0 overflow-hidden rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                                                    {src ? (
                                                                        <img
                                                                            src={
                                                                                src
                                                                            }
                                                                            alt={
                                                                                item
                                                                                    .product
                                                                                    .name
                                                                            }
                                                                            loading="lazy"
                                                                            className="size-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex size-full items-center justify-center">
                                                                            <Package className="size-5" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="truncate font-bold text-slate-900">
                                                                        {
                                                                            item
                                                                                .product
                                                                                .name
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                                                                        <Tags className="size-3.5" />
                                                                        {
                                                                            item
                                                                                .product
                                                                                .category
                                                                                .name
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                                                                        <Store className="size-3.5" />
                                                                        {
                                                                            item
                                                                                .product
                                                                                .seller
                                                                                .name
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-4 font-bold text-slate-900 tabular-nums">
                                                            {formatRupiah(
                                                                item.product
                                                                    .price,
                                                            )}
                                                            <p className="mt-1 text-xs font-normal text-slate-500">
                                                                <span
                                                                    className={
                                                                        poIssue?.startsWith(
                                                                            'Batas waktu',
                                                                        ) ||
                                                                        hasStockIssue
                                                                            ? 'text-[#DC2626]'
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {item
                                                                        .product
                                                                        .is_pre_order
                                                                        ? poIssue?.startsWith(
                                                                                'Batas waktu',
                                                                            )
                                                                            ? 'Pre-order ditutup'
                                                                            : `Pre-Order ${item.product.pre_order_estimate_days} hari`
                                                                        : 'Stok '}
                                                                </span>
                                                                {!item.product
                                                                    .is_pre_order &&
                                                                    item.product
                                                                        .stock}
                                                            </p>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-4">
                                                            <div className="space-y-1.5">
                                                                <QuantityStepper
                                                                    item={item}
                                                                    buttonClassName="size-9"
                                                                />
                                                                {poIssue && (
                                                                    <p className="max-w-[12rem] rounded-[6px] border border-red-200 bg-[#FEF2F2] px-2 py-1 text-xs leading-4 text-[#DC2626]">
                                                                        {
                                                                            poIssue
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="px-4 py-4 font-bold text-slate-900 tabular-nums">
                                                            {formatRupiah(
                                                                item.subtotal,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="px-4 py-4 text-right">
                                                            <Form
                                                                {...destroyCartItem.form(
                                                                    item.id,
                                                                )}
                                                                disableWhileProcessing
                                                            >
                                                                {({
                                                                    processing,
                                                                }) => (
                                                                    <Button
                                                                        type="submit"
                                                                        variant="outline"
                                                                        size="icon"
                                                                        className="size-9 rounded-[10px] border-red-200 bg-white text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        aria-label="Hapus item cart"
                                                                        title="Hapus item"
                                                                    >
                                                                        {processing ? (
                                                                            <Spinner />
                                                                        ) : (
                                                                            <Trash2 className="size-4" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                            </Form>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-fit rounded-[14px] border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] lg:sticky lg:top-24">
                            <CardHeader>
                                <CardTitle className="text-xl font-bold text-slate-900">
                                    Ringkasan
                                </CardTitle>
                                <CardDescription>
                                    Total item yang dipilih.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between gap-4 text-sm text-slate-600">
                                    <span>Total item</span>
                                    <span className="font-semibold text-slate-900 tabular-nums">
                                        {selectedSummary.total_items}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                                    <span className="text-sm font-medium text-slate-600">
                                        Total harga
                                    </span>
                                    <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums">
                                        {formatRupiah(
                                            selectedSummary.total_price,
                                        )}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {selectedIds.length === 0 ||
                                    hasBlockingIssue ? (
                                        <Button
                                            type="button"
                                            disabled
                                            className="h-11 w-full rounded-[12px] bg-[#0080FF] hover:bg-[#006FE0]"
                                        >
                                            Checkout
                                        </Button>
                                    ) : (
                                        <Button
                                            asChild
                                            className="h-11 w-full rounded-[12px] bg-[#0080FF] shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-[#006FE0] active:bg-[#0059B8]"
                                        >
                                            <Link href={checkoutHref}>
                                                Checkout
                                            </Link>
                                        </Button>
                                    )}
                                    {selectedIds.length === 0 && (
                                        <p className="rounded-[10px] border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
                                            Pilih minimal satu item untuk
                                            checkout.
                                        </p>
                                    )}
                                    {hasInvalidStock && (
                                        <p className="rounded-[10px] border border-red-200 bg-[#FEF2F2] px-3 py-2 text-xs leading-5 text-[#DC2626]">
                                            Ada item dengan stok tidak cukup.
                                            Update quantity atau hapus item
                                            tersebut.
                                        </p>
                                    )}
                                    {hasInvalidPreOrder && (
                                        <p className="rounded-[10px] border border-red-200 bg-[#FEF2F2] px-3 py-2 text-xs leading-5 text-[#DC2626]">
                                            Ada item pre-order yang tidak
                                            memenuhi syarat (batas waktu lewat
                                            atau di bawah jumlah minimal).
                                            Perbaiki atau hapus item tersebut.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </>
    );
}

function QuantityStepper({
    item,
    buttonClassName,
}: {
    item: CartItem;
    buttonClassName: string;
}) {
    return (
        <Form
            {...updateCartItem.form(item.id)}
            disableWhileProcessing
            className="space-y-2"
        >
            {({ processing, errors }) => (
                <>
                    <div className="flex items-center gap-2">
                        <Button
                            type="submit"
                            name="quantity"
                            value={item.quantity - 1}
                            variant="outline"
                            size="icon"
                            className={`${buttonClassName} rounded-[10px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50`}
                            disabled={processing || item.quantity <= 1}
                            aria-label="Kurangi quantity"
                            title="Kurangi"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Minus className="size-3.5" />
                            )}
                        </Button>
                        <span className="min-w-7 text-center text-sm font-bold text-slate-900 tabular-nums">
                            {item.quantity}
                        </span>
                        <Button
                            type="submit"
                            name="quantity"
                            value={item.quantity + 1}
                            variant="outline"
                            size="icon"
                            className={`${buttonClassName} rounded-[10px] border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50`}
                            disabled={
                                processing ||
                                (!item.product.is_pre_order &&
                                    item.quantity >= item.product.stock)
                            }
                            aria-label="Tambah quantity"
                            title="Tambah"
                        >
                            {processing ? (
                                <Spinner />
                            ) : (
                                <Plus className="size-4" />
                            )}
                        </Button>
                    </div>
                    <InputError message={errors.quantity} />
                </>
            )}
        </Form>
    );
}

CartIndex.layout = {
    breadcrumbs: [
        {
            title: 'Cart',
            href: cartIndex(),
        },
    ],
};
