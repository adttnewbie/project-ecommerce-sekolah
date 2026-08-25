import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CircleDollarSign,
    Clock3,
    FileText,
    ImagePlus,
    PackagePlus,
    Save,
    Tags,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import InputError from '@/components/input-error';
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
import {
    index as sellerProductsIndex,
    store as sellerProductsStore,
} from '@/routes/seller/products';

type CategoryOption = {
    id: number;
    name: string;
    slug: string;
};

type SellerProductCreateProps = {
    categories: CategoryOption[];
    upJurusans: { id: number; name: string }[];
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

export default function SellerProductCreate({
    categories,
    upJurusans,
}: SellerProductCreateProps) {
    const [categoryId, setCategoryId] = useState('');
    const [salesMethod, setSalesMethod] = useState('self_managed');
    const [fulfillmentType, setFulfillmentType] = useState('ready_stock');
    const [status, setStatus] = useState('pending');
    const [upJurusanId, setUpJurusanId] = useState('');

    return (
        <>
            <Head title="Tambah Produk" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 p-4 sm:p-6">
                <div className="mx-auto max-w-4xl space-y-8">
                    <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <div className="mb-2 inline-flex items-center gap-2 rounded-[6px] bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-100">
                                <PackagePlus className="size-3.5" aria-hidden="true" />
                                Seller Center
                            </div>
                            <h1 className="text-2xl font-semibold text-slate-950">
                                Tambah Produk
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                Jual mandiri direview super admin, titip barang
                                direview admin jurusan.
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
                        {...sellerProductsStore.form()}
                        disableWhileProcessing
                        className="space-y-8"
                    >
                        {({ processing, errors }) => (
                            <>
                                {/* Skeleton fallback for form loading (hidden when not loading) */}
                                {processing && (
                                    <div className="space-y-8" aria-hidden="true">
                                        {Array.from({ length: 3 }).map((_, idx) => (
                                            <Card
                                                key={`skeleton-${idx}`}
                                                className={cardClassName}
                                            >
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
                                                    placeholder="Contoh: Pulpen Gel Hitam"
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
                                                placeholder="Jelaskan kondisi, ukuran, varian, atau catatan penting produk."
                                                aria-invalid={Boolean(errors.description)}
                                                aria-describedby={errors.description ? 'description-error' : undefined}
                                                className="min-h-24 rounded-[10px] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:border-[#0080FF] focus-visible:ring-2 focus-visible:ring-[#0080FF]/20"
                                            />
                                            <InputError
                                                id="description-error"
                                                message={errors.description}
                                            />
                                        </div>
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
                                                Metode penjualan, harga, dan ketersediaan.
                                            </CardDescription>
                                        </div>
                                        <CardAction>
                                            <div className="hidden size-10 items-center justify-center rounded-[10px] bg-slate-100 text-slate-600 sm:flex" aria-hidden="true">
                                                <CircleDollarSign className="size-5" aria-hidden="true" />
                                            </div>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent className="space-y-5 p-6">
                                        <div className={fieldClassName}>
                                            <Label
                                                htmlFor="sales_method"
                                                className={labelClassName}
                                            >
                                                Metode Penjualan
                                            </Label>
                                            <Select
                                                name="sales_method"
                                                value={salesMethod}
                                                onValueChange={setSalesMethod}
                                                required
                                            >
                                                <SelectTrigger
                                                    id="sales_method"
                                                    className={selectTriggerClassName}
                                                    aria-invalid={Boolean(errors.sales_method)}
                                                    aria-describedby={errors.sales_method ? 'sales_method-error' : undefined}
                                                >
                                                    <SelectValue placeholder="Pilih metode penjualan" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    style={selectPortalTheme}
                                                    className="rounded-[10px] shadow-lg"
                                                >
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Metode Penjualan
                                                        </SelectLabel>
                                                        <SelectItem value="self_managed">
                                                            Jual Mandiri
                                                        </SelectItem>
                                                        <SelectItem value="up_jurusan">
                                                            Titip ke UP Jurusan
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                id="sales_method-error"
                                                message={errors.sales_method}
                                            />
                                        </div>

                                        {salesMethod === 'up_jurusan' ? (
                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="status-note"
                                                    className={labelClassName}
                                                >
                                                    Status Produk
                                                </Label>
                                                <div
                                                    id="status-note"
                                                    className="rounded-[10px] border border-[#BCE0FF] bg-[#EFF8FF] px-3 py-2.5 text-sm text-[#0080FF]"
                                                >
                                                    Status otomatis diajukan ke
                                                    admin jurusan. Seller tidak
                                                    perlu mengatur draft atau
                                                    review untuk produk titipan.
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="status"
                                                    className={labelClassName}
                                                >
                                                    Status Produk
                                                </Label>
                                                <Select
                                                    name="status"
                                                    value={status}
                                                    onValueChange={setStatus}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id="status"
                                                        className={selectTriggerClassName}
                                                        aria-invalid={Boolean(errors.status)}
                                                        aria-describedby={errors.status ? 'status-error' : undefined}
                                                    >
                                                        <SelectValue placeholder="Pilih status produk" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        style={selectPortalTheme}
                                                        className="rounded-[10px] shadow-lg"
                                                    >
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                Status Produk
                                                            </SelectLabel>
                                                            <SelectItem value="pending">
                                                                Ajukan Review
                                                            </SelectItem>
                                                            <SelectItem value="draft">
                                                                Simpan Draft
                                                            </SelectItem>
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    id="status-error"
                                                    message={errors.status}
                                                />
                                            </div>
                                        )}

                                        <div className="grid gap-5 md:grid-cols-2">
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
                                                    onValueChange={setFulfillmentType}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id="fulfillment_type"
                                                        className={selectTriggerClassName}
                                                        aria-invalid={Boolean(
                                                            errors.fulfillment_type,
                                                        )}
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
                                                        placeholder="5000"
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
                                                        placeholder="10000"
                                                        className={`${inputClassName} pl-9`}
                                                        aria-invalid={Boolean(errors.original_price)}
                                                        aria-describedby={errors.original_price ? 'original_price-error' : undefined}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Kosongkan jika produk tidak
                                                    diskon.
                                                </p>
                                                <InputError
                                                    id="original_price-error"
                                                    message={errors.original_price}
                                                />
                                            </div>

                                            {salesMethod === 'self_managed' &&
                                                fulfillmentType ===
                                                    'ready_stock' && (
                                                    <div
                                                        className={
                                                            fieldClassName
                                                        }
                                                    >
                                                        <Label
                                                            htmlFor="stock"
                                                            className={
                                                                labelClassName
                                                            }
                                                        >
                                                            Stok
                                                        </Label>
                                                        <Input
                                                            id="stock"
                                                            name="stock"
                                                            type="number"
                                                            required
                                                            min={0}
                                                            max={100000}
                                                            step={1}
                                                            inputMode="numeric"
                                                            placeholder="10"
                                                            className={
                                                                inputClassName
                                                            }
                                                            aria-invalid={Boolean(errors.stock)}
                                                            aria-describedby={errors.stock ? 'stock-error' : undefined}
                                                        />
                                                        <InputError
                                                            id="stock-error"
                                                            message={errors.stock}
                                                        />
                                                    </div>
                                                )}

                                            {salesMethod === 'up_jurusan' &&
                                                fulfillmentType ===
                                                    'ready_stock' && (
                                                    <div
                                                        className={
                                                            fieldClassName
                                                        }
                                                    >
                                                        <Label
                                                            htmlFor="requested_quantity"
                                                            className={
                                                                labelClassName
                                                            }
                                                        >
                                                            Jumlah Titip
                                                        </Label>
                                                        <Input
                                                            id="requested_quantity"
                                                            name="requested_quantity"
                                                            type="number"
                                                            required
                                                            min={1}
                                                            max={100000}
                                                            step={1}
                                                            inputMode="numeric"
                                                            placeholder="20"
                                                            className={
                                                                inputClassName
                                                            }
                                                            aria-invalid={Boolean(errors.requested_quantity)}
                                                            aria-describedby={errors.requested_quantity ? 'requested_quantity-error' : undefined}
                                                        />
                                                        <InputError
                                                            id="requested_quantity-error"
                                                            message={
                                                                errors.requested_quantity
                                                            }
                                                        />
                                                    </div>
                                                )}
                                        </div>
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
                                                Gambar, UP Jurusan, dan opsi pre-order.
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
                                            <InputError
                                                id="image-error"
                                                message={errors.image}
                                            />
                                        </div>

                                        {salesMethod === 'up_jurusan' && (
                                            <div className={fieldClassName}>
                                                <Label
                                                    htmlFor="up_jurusan_id"
                                                    className={labelClassName}
                                                >
                                                    UP Jurusan
                                                </Label>
                                                <Select
                                                    name="up_jurusan_id"
                                                    value={upJurusanId}
                                                    onValueChange={setUpJurusanId}
                                                    required
                                                >
                                                    <SelectTrigger
                                                        id="up_jurusan_id"
                                                        className={selectTriggerClassName}
                                                        aria-invalid={Boolean(errors.up_jurusan_id)}
                                                        aria-describedby={errors.up_jurusan_id ? 'up_jurusan_id-error' : undefined}
                                                    >
                                                        <SelectValue placeholder="Pilih UP Jurusan" />
                                                    </SelectTrigger>
                                                    <SelectContent
                                                        style={selectPortalTheme}
                                                        className="rounded-[10px] shadow-lg"
                                                    >
                                                        <SelectGroup>
                                                            <SelectLabel>
                                                                UP Jurusan
                                                            </SelectLabel>
                                                            {upJurusans.map(
                                                                (up) => (
                                                                    <SelectItem
                                                                        key={
                                                                            up.id
                                                                        }
                                                                        value={String(
                                                                            up.id,
                                                                        )}
                                                                    >
                                                                        {
                                                                            up.name
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    id="up_jurusan_id-error"
                                                    message={errors.up_jurusan_id}
                                                />
                                            </div>
                                        )}

                                        {fulfillmentType === 'pre_order' && (
                                            <div className="grid gap-5 md:grid-cols-2">
                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_estimate_days"
                                                        className={
                                                            labelClassName
                                                        }
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
                                                            placeholder="7"
                                                            className={`${inputClassName} pl-9`}
                                                            aria-invalid={Boolean(errors.pre_order_estimate_days)}
                                                            aria-describedby={errors.pre_order_estimate_days ? 'pre_order_estimate_days-error' : undefined}
                                                        />
                                                    </div>
                                                    <InputError
                                                        id="pre_order_estimate_days-error"
                                                        message={
                                                            errors.pre_order_estimate_days
                                                        }
                                                    />
                                                </div>

                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_note"
                                                        className={
                                                            labelClassName
                                                        }
                                                    >
                                                        Catatan PO
                                                    </Label>
                                                    <Input
                                                        id="pre_order_note"
                                                        name="pre_order_note"
                                                        maxLength={255}
                                                        placeholder="Contoh: Diproduksi setelah kuota pesanan terkumpul"
                                                        className={
                                                            inputClassName
                                                        }
                                                        aria-invalid={Boolean(errors.pre_order_note)}
                                                        aria-describedby={errors.pre_order_note ? 'pre_order_note-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_note-error"
                                                        message={
                                                            errors.pre_order_note
                                                        }
                                                    />
                                                </div>
                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_deadline"
                                                        className={
                                                            labelClassName
                                                        }
                                                    >
                                                        Deadline PO
                                                    </Label>
                                                    <Input
                                                        id="pre_order_deadline"
                                                        name="pre_order_deadline"
                                                        type="date"
                                                        className={
                                                            inputClassName
                                                        }
                                                        aria-invalid={Boolean(errors.pre_order_deadline)}
                                                        aria-describedby={errors.pre_order_deadline ? 'pre_order_deadline-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_deadline-error"
                                                        message={
                                                            errors.pre_order_deadline
                                                        }
                                                    />
                                                </div>
                                                <div className={fieldClassName}>
                                                    <Label
                                                        htmlFor="pre_order_min_quantity"
                                                        className={
                                                            labelClassName
                                                        }
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
                                                        placeholder="Opsional"
                                                        className={
                                                            inputClassName
                                                        }
                                                        aria-invalid={Boolean(errors.pre_order_min_quantity)}
                                                        aria-describedby={errors.pre_order_min_quantity ? 'pre_order_min_quantity-error' : undefined}
                                                    />
                                                    <InputError
                                                        id="pre_order_min_quantity-error"
                                                        message={
                                                            errors.pre_order_min_quantity
                                                        }
                                                    />
                                                </div>
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
                                    <Button
                                        type="submit"
                                        className="h-11 rounded-[12px] bg-[#0080FF] px-6 font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] transition-all duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-[#0080FF] focus-visible:ring-offset-2"
                                        disabled={processing}
                                        aria-busy={processing}
                                    >
                                        {processing && <Spinner className="size-4" aria-hidden="true" />}
                                        <Save className="size-4" aria-hidden="true" />
                                        Simpan Produk
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </main>
        </>
    );
}

SellerProductCreate.layout = {
    breadcrumbs: [
        {
            title: 'Produk Seller',
            href: sellerProductsIndex(),
        },
        {
            title: 'Tambah Produk',
            href: '/seller/products/create',
        },
    ],
};
