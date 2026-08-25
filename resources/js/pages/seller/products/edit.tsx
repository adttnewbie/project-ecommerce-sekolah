import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleDollarSign,
    Clock3,
    FileText,
    ImagePlus,
    Info,
    PackageCheck,
    Save,
    Send,
    Tags,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    edit as sellerProductsEdit,
    index as sellerProductsIndex,
    update as sellerProductsUpdate,
} from '@/routes/seller/products';

type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected';
type FulfillmentType = 'ready_stock' | 'pre_order';

type CategoryOption = {
    id: number;
    name: string;
    slug: string;
};

type SellerProduct = {
    id: number;
    name: string;
    slug: string;
    category_id: number;
    description: string;
    price: number;
    original_price: number | null;
    stock: number;
    fulfillment_type: {
        code: FulfillmentType;
        label: string;
    };
    pre_order_estimate_days: number | null;
    pre_order_deadline: string | null;
    pre_order_min_quantity: number | null;
    pre_order_note: string | null;
    image: string | null;
    status: {
        code: ProductStatus;
        label: string;
    };
};

type SellerProductEditProps = {
    categories: CategoryOption[];
    product: SellerProduct;
};

type SelectTheme = CSSProperties & Record<`--${string}`, string>;

const selectPortalTheme: SelectTheme = {
    '--foreground': '#0F172A',
    '--popover': '#FFFFFF',
    '--popover-foreground': '#0F172A',
    '--muted-foreground': '#64748B',
    '--accent': '#EFF6FF',
    '--accent-foreground': '#1D4ED8',
    '--border': '#E2E8F0',
};

const fieldClassName = 'grid gap-2';
const labelClassName = 'text-sm font-medium text-slate-700';
const inputClassName =
    'h-11 rounded-[10px] border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:ring-offset-0';
const selectTriggerClassName =
    'h-11 w-full rounded-[10px] border-slate-200 bg-white text-slate-950 shadow-none data-[placeholder]:text-slate-400 transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20 focus-visible:ring-offset-0 data-[size=default]:h-11';
const cardClassName =
    'gap-0 rounded-[14px] border border-slate-100 bg-white py-0 shadow-sm transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-md motion-reduce:transition-none motion-reduce:hover:shadow-sm';

const statusStyles: Record<ProductStatus, string> = {
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    pending: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]',
    approved: 'bg-[#ECFDF3] text-[#16A34A] border border-[#BBF7D0]',
    rejected: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

export default function SellerProductEdit({
    categories,
    product,
}: SellerProductEditProps) {
    const [categoryId, setCategoryId] = useState(String(product.category_id));
    const [fulfillmentType, setFulfillmentType] = useState(
        product.fulfillment_type.code,
    );

    return (
        <>
            <Head title={`Edit ${product.name}`} />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                <Badge className="rounded-[6px] border border-[#BCE0FF] bg-[#EFF8FF] text-[#0080FF]">
                                    <PackageCheck className="size-3.5" aria-hidden="true" />
                                    Seller Center
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className={cn(
                                        'rounded-full gap-1.5 font-medium',
                                        statusStyles[product.status.code],
                                    )}
                                >
                                    {product.status.label}
                                </Badge>
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Edit Produk
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Perbarui informasi produk toko.
                            </p>
                        </div>
                        <Button
                            asChild
                            variant="outline"
                            className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                        >
                            <Link href={sellerProductsIndex()}>
                                <ArrowLeft className="size-4" aria-hidden="true" />
                                Kembali
                            </Link>
                        </Button>
                    </section>

                    <Form
                        {...sellerProductsUpdate.form(product.id)}
                        disableWhileProcessing
                        className="space-y-8"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Skeleton for form loading */}
                                {processing && (
                                    <div className="space-y-8" aria-hidden="true">
                                        {Array.from({ length: 3 }).map((_, idx) => (
                                            <Card key={`skeleton-${idx}`} className={cardClassName}>
                                                <CardHeader className="p-6">
                                                    <Skeleton className="h-5 w-40 rounded-[6px] motion-reduce:animate-none" />
                                                    <Skeleton className="mt-1 h-4 w-64 rounded-[6px] motion-reduce:animate-none" />
                                                </CardHeader>
                                                <CardContent className="space-y-4 p-6">
                                                    <Skeleton className="h-11 w-full rounded-[10px] motion-reduce:animate-none" />
                                                    <Skeleton className="h-24 w-full rounded-[10px] motion-reduce:animate-none" />
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}

                                {/* Informasi Dasar */}
                                <Card className={cardClassName}>
                                    <CardHeader className="flex-row items-center border-b border-slate-100 p-6">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                                <span className="grid size-8 place-items-center rounded-[10px] bg-[#EFF8FF] text-[#0080FF] ring-1 ring-[#BCE0FF]" aria-hidden="true">
                                                    <Tags className="size-4" aria-hidden="true" />
                                                </span>
                                                Informasi Dasar
                                            </CardTitle>
                                            <CardDescription>
                                                Nama, kategori, dan deskripsi produk.
                                            </CardDescription>
                                        </div>
                                        <CardAction>
                                            <div className="hidden size-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 sm:flex" aria-hidden="true">
                                                <FileText className="size-5" aria-hidden="true" />
                                            </div>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="name"
                                                    className={labelClassName}
                                                >
                                                    Nama Produk
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    required
                                                    autoFocus
                                                    maxLength={120}
                                                    defaultValue={product.name}
                                                    className={inputClassName}
                                                    aria-invalid={Boolean(errors.name)}
                                                    aria-describedby={errors.name ? 'name-error' : undefined}
                                                />
                                                <InputError
                                                    id="name-error"
                                                    message={errors.name}
                                                />
                                            </div>

                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="category_id"
                                                    className={labelClassName}
                                                >
                                                    Kategori
                                                </Label>
                                                <Select
                                                    name="category_id"
                                                    value={categoryId}
                                                    onValueChange={setCategoryId}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id="category_id"
                                                        className={selectTriggerClassName}
                                                        aria-invalid={Boolean(errors.category_id)}
                                                        aria-describedby={errors.category_id ? 'category_id-error' : undefined}
                                                    >
                                                        <SelectValue placeholder="Pilih kategori" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        style={selectPortalTheme}
                                                        className="rounded-[10px] shadow-lg"
                                                    >
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Kategori
                                                            </SelectLabel>
                                                            {categories.map(
                                                                (category) => (
                                                                    <SelectItem
                                                                        key={
                                                                            category.id
                                                                        }
                                                                        value={String(
                                                                            category.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    id="category_id-error"
                                                    message={errors.category_id}
                                                />
                                            </div>
                                        </div>

                                        <div className={fieldClassName}>
                                            <Label
                                                htmlFor="description"
                                                className={labelClassName}
                                            >
                                                Deskripsi
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                required
                                                minLength={10}
                                                maxLength={5000}
                                                defaultValue={product.description}
                                                aria-invalid={Boolean(errors.description)}
                                                aria-describedby={errors.description ? 'description-error' : undefined}
                                                className="min-h-24 rounded-[10px] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                            />
                                            <InputError
                                                id="description-error"
                                                message={errors.description}
                                            />
                                        </div>

                                        <p className="text-xs text-slate-500">
                                            Slug: <span className="font-medium text-slate-700">{product.slug}</span>
                                        </p>
                                    </CardContent>
                                </Card>

                                {/* Harga & Stok */}
                                <Card className={cardClassName}>
                                    <CardHeader className="flex-row items-center border-b border-slate-100 p-6">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                                <span className="grid size-8 place-items-center rounded-[10px] bg-[#ECFDF3] text-[#16A34A] ring-1 ring-[#BBF7D0]" aria-hidden="true">
                                                    <Wallet className="size-4" aria-hidden="true" />
                                                </span>
                                                Harga & Stok
                                            </CardTitle>
                                            <CardDescription>
                                                Harga, diskon, dan sistem pemesanan.
                                            </CardDescription>
                                        </div>
                                        <CardAction>
                                            <div className="hidden size-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 sm:flex" aria-hidden="true">
                                                <CircleDollarSign className="size-5" aria-hidden="true" />
                                            </div>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="price"
                                                    className={labelClassName}
                                                >
                                                    Harga
                                                </Label>
                                                <div className="relative">
                                                    <CircleDollarSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                                    <Input
                                                        id="price"
                                                        name="price"
                                                        type="number"
                                                        required
                                                        min={1}
                                                        max={100000000}
                                                        step={1}
                                                        inputMode="numeric"
                                                        defaultValue={product.price}
                                                        className={`${inputClassName} pl-9`}
                                                        aria-invalid={Boolean(errors.price)}
                                                        aria-describedby={errors.price ? 'price-error' : undefined}
                                                    />
                                                </div>
                                                <InputError
                                                    id="price-error"
                                                    message={errors.price}
                                                />
                                            </div>

                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="original_price"
                                                    className={labelClassName}
                                                >
                                                    Harga sebelum diskon (Rp)
                                                </Label>
                                                <div className="relative">
                                                    <CircleDollarSign className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                                    <Input
                                                        id="original_price"
                                                        name="original_price"
                                                        type="number"
                                                        min={1}
                                                        max={100000000}
                                                        step={1}
                                                        inputMode="numeric"
                                                        placeholder={String(
                                                            product.price + 5000,
                                                        )}
                                                        defaultValue={
                                                            product.original_price ??
                                                            ''
                                                        }
                                                        className={`${inputClassName} pl-9`}
                                                        aria-invalid={Boolean(errors.original_price)}
                                                        aria-describedby={errors.original_price ? 'original_price-error' : undefined}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Kosongkan untuk menghapus
                                                    diskon.
                                                </p>
                                                <InputError
                                                    id="original_price-error"
                                                    message={errors.original_price}
                                                />
                                            </div>
                                        </div>

                                        <div className={fieldClassName}>
                                            <Label
                                                htmlFor="fulfillment_type"
                                                className={labelClassName}
                                            >
                                                Sistem Pemesanan
                                            </Label>
                                            <Select
                                                name="fulfillment_type"
                                                value={fulfillmentType}
                                                onValueChange={(value) =>
                                                    setFulfillmentType(
                                                        value as FulfillmentType,
                                                    )
                                                }
                                                required
                                            >
                                                <SelectTrigger
                                                    id="fulfillment_type"
                                                    className={selectTriggerClassName}
                                                    aria-invalid={Boolean(errors.fulfillment_type)}
                                                    aria-describedby={errors.fulfillment_type ? 'fulfillment_type-error' : undefined}
                                                >
                                                    <SelectValue placeholder="Pilih sistem pemesanan" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    style={selectPortalTheme}
                                                    className="rounded-[10px] shadow-lg"
                                                >
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Sistem Pemesanan
                                                        </SelectLabel>
                                                        <SelectItem value="ready_stock">
                                                            Ready Stock
                                                        </SelectItem>
                                                        <SelectItem value="pre_order">
                                                            Pre-Order
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                id="fulfillment_type-error"
                                                message={errors.fulfillment_type}
                                            />
                                        </div>

                                        {/* Stock omission note with info box bg-[#EFF8FF] */}
                                        <div className="rounded-[10px] border border-[#BCE0FF] bg-[#EFF8FF] p-4">
                                            <p className="flex items-center gap-2 text-sm font-medium text-[#0080FF]">
                                                <Info className="size-4 shrink-0" aria-hidden="true" />
                                                Informasi stok
                                            </p>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Stok dikelola melalui menu Inventori untuk produk yang sudah disetujui. Perubahan stok tidak dilakukan di halaman edit, kecuali untuk produk pre-order melalui pengaturan PO.
                                            </p>
                                        </div>

                                        {product.status.code === 'draft' && (
                                            <div className="rounded-[10px] border border-[#BCE0FF] bg-[#EFF8FF] p-4 text-sm leading-6 text-[#0080FF]">
                                                <p className="font-medium">Produk masih draft</p>
                                                <p className="mt-1 text-slate-600">
                                                    Simpan draft untuk melanjutkan nanti, atau ajukan produk agar masuk antrian moderasi.
                                                </p>
                                            </div>
                                        )}

                                        {fulfillmentType === 'pre_order' && (
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_estimate_days"
                                                        className={labelClassName}
                                                    >
                                                        Estimasi PO
                                                    </Label>
                                                    <div className="relative">
                                                        <Clock3 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                                        <Input
                                                            id="pre_order_estimate_days"
                                                            name="pre_order_estimate_days"
                                                            type="number"
                                                            required
                                                            min={1}
                                                            max={365}
                                                            step={1}
                                                            inputMode="numeric"
                                                            defaultValue={
                                                                product.pre_order_estimate_days ??
                                                                7
                                                            }
                                                            className={`${inputClassName} pl-9`}
                                                            aria-invalid={Boolean(errors.pre_order_estimate_days)}
                                                            aria-describedby={errors.pre_order_estimate_days ? 'pre_order_estimate_days-error' : undefined}
                                                        />
                                                    </div>
                                                    <InputError
                                                        id="pre_order_estimate_days-error"
                                                        message={errors.pre_order_estimate_days}
                                                    />
                                                </div>

                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_note"
                                                        className={labelClassName}
                                                    >
                                                        Catatan PO
                                                    </Label>
                                                    <Input
                                                        id="pre_order_note"
                                                        name="pre_order_note"
                                                        maxLength={255}
                                                        defaultValue={
                                                            product.pre_order_note ??
                                                            ''
                                                        }
                                                        placeholder="Contoh: Diproduksi setelah kuota pesanan terkumpul"
                                                        className={inputClassName}
                                                        aria-invalid={Boolean(errors.pre_order_note)}
                                                        aria-describedby={errors.pre_order_note ? 'pre_order_note-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_note-error"
                                                        message={errors.pre_order_note}
                                                    />
                                                </div>
                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_deadline"
                                                        className={labelClassName}
                                                    >
                                                        Deadline PO
                                                    </Label>
                                                    <Input
                                                        id="pre_order_deadline"
                                                        name="pre_order_deadline"
                                                        type="date"
                                                        defaultValue={
                                                            product.pre_order_deadline ??
                                                            ''
                                                        }
                                                        className={inputClassName}
                                                        aria-invalid={Boolean(errors.pre_order_deadline)}
                                                        aria-describedby={errors.pre_order_deadline ? 'pre_order_deadline-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_deadline-error"
                                                        message={errors.pre_order_deadline}
                                                    />
                                                </div>

                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_min_quantity"
                                                        className={labelClassName}
                                                    >
                                                        Minimum Kuota
                                                    </Label>
                                                    <Input
                                                        id="pre_order_min_quantity"
                                                        name="pre_order_min_quantity"
                                                        type="number"
                                                        min={1}
                                                        max={100000}
                                                        step={1}
                                                        inputMode="numeric"
                                                        defaultValue={
                                                            product.pre_order_min_quantity ??
                                                            ''
                                                        }
                                                        placeholder="Opsional"
                                                        className={inputClassName}
                                                        aria-invalid={Boolean(errors.pre_order_min_quantity)}
                                                        aria-describedby={errors.pre_order_min_quantity ? 'pre_order_min_quantity-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_min_quantity-error"
                                                        message={errors.pre_order_min_quantity}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Media & Pengaturan */}
                                <Card className={cardClassName}>
                                    <CardHeader className="flex-row items-center border-b border-slate-100 p-6">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-950">
                                                <span className="grid size-8 place-items-center rounded-[10px] bg-[#FFF7ED] text-[#EA580C] ring-1 ring-[#FFEDD5]" aria-hidden="true">
                                                    <ImagePlus className="size-4" aria-hidden="true" />
                                                </span>
                                                Media & Pengaturan
                                            </CardTitle>
                                            <CardDescription>
                                                Gambar produk dan detail pre-order.
                                            </CardDescription>
                                        </div>
                                        <CardAction>
                                            <div className="hidden size-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 sm:flex" aria-hidden="true">
                                                <Clock3 className="size-5" aria-hidden="true" />
                                            </div>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className={fieldClassName}>
                                            <Label
                                                htmlFor="image"
                                                className={labelClassName}
                                            >
                                                Gambar Produk
                                            </Label>
                                            {product.image ? (
                                                <div className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50">
                                                    <img
                                                        src={`/storage/${product.image}`}
                                                        alt={`Gambar produk ${product.name}`}
                                                        className="h-48 w-full object-cover object-center"
                                                        loading="lazy"
                                                    />
                                                    <p className="truncate px-3 py-2 text-xs text-slate-500" title={product.image}>
                                                        Gambar saat ini: {product.image}
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid place-items-center rounded-[10px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                                                    <ImagePlus className="size-6 text-slate-400" aria-hidden="true" />
                                                    <p className="mt-2 text-sm text-slate-500">Belum ada gambar</p>
                                                </div>
                                            )}
                                            <div className="relative">
                                                <ImagePlus className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                                                <Input
                                                    id="image"
                                                    name="image"
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp"
                                                    className={`${inputClassName} h-11 pl-9 file:mr-3 file:rounded-[6px] file:border-0 file:bg-slate-100 file:px-2 file:text-sm file:font-medium file:text-slate-700`}
                                                    aria-invalid={Boolean(errors.image)}
                                                    aria-describedby={errors.image ? 'image-error' : undefined}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500">
                                                Biarkan kosong jika tidak ingin mengganti gambar. Format: JPEG, PNG, WebP.
                                            </p>
                                            <InputError
                                                id="image-error"
                                                message={errors.image}
                                            />
                                        </div>

                                        {fulfillmentType === 'pre_order' && product.status.code !== 'draft' && (
                                            <div className="rounded-[10px] border border-[#BCE0FF] bg-[#EFF8FF] p-3 text-sm text-[#0080FF]">
                                                Pengaturan pre-order aktif. Pastikan estimasi dan deadline sesuai kemampuan produksi.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Sticky bottom action bar */}
                                <div className="sticky bottom-0 bg-white/95 backdrop-blur border-t border-slate-200 p-4 flex justify-end gap-3 shadow-lg z-10 rounded-[14px]">
                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                        className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                    >
                                        <Link href={sellerProductsIndex()}>
                                            Batal
                                        </Link>
                                    </Button>
                                    {product.status.code === 'draft' ? (
                                        <>
                                            <Button
                                                type="submit"
                                                name="status"
                                                value="draft"
                                                variant="outline"
                                                className="h-11 rounded-[12px] border-slate-200 bg-white font-semibold transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                disabled={processing}
                                                aria-busy={processing}
                                            >
                                                {processing && (
                                                    <Spinner className="size-4" aria-hidden="true" />
                                                )}
                                                <Save className="size-4" aria-hidden="true" />
                                                Simpan Draft
                                            </Button>
                                            <Button
                                                type="submit"
                                                name="status"
                                                value="pending"
                                                className="h-11 rounded-[12px] bg-[#0080FF] px-6 font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                                disabled={processing}
                                                aria-busy={processing}
                                            >
                                                {processing && (
                                                    <Spinner className="size-4" aria-hidden="true" />
                                                )}
                                                <Send className="size-4" aria-hidden="true" />
                                                Ajukan Produk
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="submit"
                                            className="h-11 rounded-[12px] bg-[#0080FF] px-6 font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                            disabled={processing}
                                            aria-busy={processing}
                                        >
                                            {processing && <Spinner className="size-4" aria-hidden="true" />}
                                            <Save className="size-4" aria-hidden="true" />
                                            Simpan Perubahan
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </main>
        </>
    );
}

SellerProductEdit.layout = {
    breadcrumbs: [
        {
            title: 'Produk Seller',
            href: sellerProductsIndex(),
        },
        {
            title: 'Edit Produk',
            href: sellerProductsEdit({ product: 1 }),
        },
    ],
};
