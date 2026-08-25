import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Boxes,
    FileText,
    PackagePlus,
    Search,
    Tag,
    UserPlus,
    Wallet,
    Warehouse,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { PageHeader } from '@/components/admin-jurusan/page-header';
import { UpJurusanRevenueChart } from '@/components/admin-jurusan/up-jurusan/revenue-chart';
import { UpJurusanSummary } from '@/components/admin-jurusan/up-jurusan/summary';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';

type UpJurusan = {
    id: number;
    name: string;
    description: string | null;
    picket_officers: {
        id: number;
        name: string;
        email: string;
        up_jurusan_id: number | null;
    }[];
    products: {
        id: number;
        name: string;
        category_name: string;
        price: number;
        stock: number;
        status: { code: string; label: string };
    }[];
    revenue_chart: { day: string; revenue: number }[];
    summary: {
        revenue_7_days: number;
        up_product_count: number;
        active_consignment_count: number;
        available_stock: number;
        picket_names: string[];
    };
};

type Props = {
    upJurusan: UpJurusan;
    categories: { id: number; name: string }[];
};

const formatRupiah = (value: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(value);

export default function UpJurusanShow({ upJurusan: up, categories }: Props) {
    const { flash } = usePage().props as unknown as {
        flash: { success?: string; error?: string };
    };
    const hasPicket = up.picket_officers.length > 0;
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [previewName, setPreviewName] = useState('');
    const [previewDescription, setPreviewDescription] = useState('');
    const [previewPrice, setPreviewPrice] = useState('');
    const [previewStock, setPreviewStock] = useState('');
    const [previewCategoryId, setPreviewCategoryId] = useState('');
    const [, setIsCategoryOpen] = useState(false);
    const selectOpenRef = useRef(false);
    const handleCategoryOpen = (open: boolean) => {
        selectOpenRef.current = open;
        setIsCategoryOpen(open);
    };

    const filteredProducts = useMemo(() => {
        if (!productSearch) {
            return up.products;
        }

        const q = productSearch.toLowerCase();

        return up.products.filter(
            (p) =>
                p.name.toLowerCase().includes(q) ||
                p.category_name.toLowerCase().includes(q),
        );
    }, [up.products, productSearch]);

    return (
        <>
            <Head title={up.name} />
            <div className="space-y-6 p-4 sm:p-6">
                <PageHeader
                    badge="Master UP"
                    badgeIcon={Warehouse}
                    title={up.name}
                    description={
                        up.description ||
                        'Detail unit produksi jurusan — kelola picket, produk, omzet, dan stok.'
                    }
                    actions={
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-lg"
                        >
                            <Link href="/admin-jurusan/up-jurusan">
                                <ArrowLeft className="size-4" />
                                Kembali
                            </Link>
                        </Button>
                    }
                />

                {flash.success && (
                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 text-emerald-800">
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}
                {flash.error && (
                    <Alert variant="destructive" className="rounded-xl">
                        <AlertTitle>Gagal</AlertTitle>
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
                    <UpJurusanRevenueChart up={up} />
                    <UpJurusanSummary up={up} />
                </section>

                <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
                    <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="truncate text-base font-semibold text-slate-900">
                                        {up.name}
                                    </h3>
                                    <Badge className="rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                        Aktif
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="rounded-md"
                                    >
                                        {up.products.length} produk
                                    </Badge>
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                    {up.description || 'Tidak ada deskripsi'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <UserPlus className="size-4 text-slate-500" />
                                Picket Officer
                            </p>
                            {hasPicket ? (
                                <div className="mt-3 grid gap-2">
                                    {up.picket_officers.map((picket) => (
                                        <div
                                            key={picket.id}
                                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                                        >
                                            <span className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                                                {picket.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900">
                                                    {picket.name}
                                                </p>
                                                <p className="truncate text-xs text-slate-500">
                                                    {picket.email}
                                                </p>
                                            </div>
                                            <Badge
                                                variant="secondary"
                                                className="ml-auto rounded-md bg-emerald-50 text-emerald-700"
                                            >
                                                Terhubung
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Belum ada picket officer yang ditugaskan ke
                                    UP ini. Picket diperlukan untuk Receiving &
                                    POS.
                                </p>
                            )}

                            {!hasPicket && (
                                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-sm leading-6 text-blue-700">
                                            Buat akun picket officer — akun baru
                                            otomatis terhubung ke{' '}
                                            <span className="font-semibold">
                                                {up.name}
                                            </span>
                                            .
                                        </p>
                                        <Button
                                            asChild
                                            className="shrink-0 rounded-lg"
                                        >
                                            <Link href="/admin-jurusan/picket-officer/create">
                                                <UserPlus className="size-4" />
                                                Buat Picket
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Warehouse className="size-4 text-slate-500" />
                                    Produk Milik {up.name}
                                    <Badge
                                        variant="secondary"
                                        className="rounded-md bg-slate-100 text-slate-700"
                                    >
                                        {filteredProducts.length}/
                                        {up.products.length}
                                    </Badge>
                                </h4>
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                                    {up.products.length > 3 && (
                                        <div className="relative w-full sm:w-64">
                                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                value={productSearch}
                                                onChange={(e) =>
                                                    setProductSearch(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Cari produk / kategori"
                                                className="h-9 rounded-lg border-slate-200 bg-white pl-9"
                                            />
                                        </div>
                                    )}
                                    <Dialog
                                        open={isProductDialogOpen}
                                        onOpenChange={(open) => {
                                            setIsProductDialogOpen(open);

                                            if (!open) {
                                                setPreviewName('');
                                                setPreviewDescription('');
                                                setPreviewPrice('');
                                                setPreviewStock('');
                                                setPreviewCategoryId('');
                                                setIsCategoryOpen(false);
                                                selectOpenRef.current = false;
                                            }
                                        }}
                                    >
                                        <DialogTrigger asChild>
                                            <Button
                                                size="sm"
                                                className="w-full rounded-xl sm:w-auto"
                                            >
                                                <PackagePlus className="size-4" />
                                                Tambah Produk UP
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent
                                            className="flex max-h-[90vh] flex-col gap-0 overflow-hidden rounded-[18px] bg-white p-0 shadow-lg ring-1 ring-slate-200 sm:max-w-xl"
                                            onInteractOutside={(e) => {
                                                if (selectOpenRef.current) {
                                                    e.preventDefault();
                                                }
                                            }}
                                            onPointerDownOutside={(e) => {
                                                if (selectOpenRef.current) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <DialogHeader className="shrink-0 border-b border-slate-100 p-6 pb-4 text-left">
                                                <div className="flex items-start gap-3">
                                                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                                                        <PackagePlus className="size-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <DialogTitle className="text-base leading-none font-semibold text-slate-900">
                                                            Tambah Produk UP
                                                        </DialogTitle>
                                                        <DialogDescription className="mt-1.5 text-sm leading-6 text-slate-500">
                                                            Produk milik{' '}
                                                            <span className="font-medium text-slate-700">
                                                                {up.name}
                                                            </span>{' '}
                                                            untuk dijual via
                                                            POS. Langsung
                                                            berstatus{' '}
                                                            <span className="inline-flex items-center rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                                Approved
                                                            </span>
                                                            .
                                                        </DialogDescription>
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className="rounded-md bg-slate-50 text-slate-600"
                                                    >
                                                        <Warehouse className="size-3.5" />
                                                        {up.name}
                                                    </Badge>
                                                    <Badge className="rounded-md bg-blue-50 text-blue-700">
                                                        POS & Katalog
                                                    </Badge>
                                                </div>
                                            </DialogHeader>
                                            <Form
                                                action="/admin-jurusan/products"
                                                method="post"
                                                resetOnSuccess
                                                onSuccess={() => {
                                                    setIsProductDialogOpen(
                                                        false,
                                                    );
                                                    setPreviewName('');
                                                    setPreviewDescription('');
                                                    setPreviewPrice('');
                                                    setPreviewStock('');
                                                    setPreviewCategoryId('');
                                                    setIsCategoryOpen(false);
                                                    selectOpenRef.current = false;
                                                }}
                                                className="flex min-h-0 flex-1 flex-col"
                                            >
                                                {({ errors, processing }) => {
                                                    const selectedCategoryName =
                                                        categories.find(
                                                            (c) =>
                                                                String(c.id) ===
                                                                previewCategoryId,
                                                        )?.name ?? '';
                                                    const priceNum =
                                                        Number(previewPrice);
                                                    const hasPrice =
                                                        previewPrice !== '' &&
                                                        !Number.isNaN(
                                                            priceNum,
                                                        ) &&
                                                        priceNum > 0;
                                                    const stockNum =
                                                        Number(previewStock);
                                                    const hasStock =
                                                        previewStock !== '' &&
                                                        !Number.isNaN(stockNum);

                                                    return (
                                                        <>
                                                            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                                                                <input
                                                                    type="hidden"
                                                                    name="up_jurusan_id"
                                                                    value={
                                                                        up.id
                                                                    }
                                                                    readOnly
                                                                />

                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                                                        <Tag className="size-4 text-slate-400" />
                                                                        <h4 className="text-sm font-semibold text-slate-900">
                                                                            Informasi
                                                                            Produk
                                                                        </h4>
                                                                        <span className="ml-auto text-xs text-slate-400">
                                                                            *
                                                                            wajib
                                                                        </span>
                                                                    </div>
                                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                                        <div className="grid gap-2">
                                                                            <Label
                                                                                htmlFor={`product-name-${up.id}`}
                                                                                className="text-sm font-medium text-slate-700"
                                                                            >
                                                                                Nama
                                                                                produk
                                                                                *
                                                                            </Label>
                                                                            <Input
                                                                                id={`product-name-${up.id}`}
                                                                                name="name"
                                                                                placeholder="Contoh: Risol Mayo"
                                                                                required
                                                                                maxLength={
                                                                                    120
                                                                                }
                                                                                value={
                                                                                    previewName
                                                                                }
                                                                                onChange={(
                                                                                    e,
                                                                                ) =>
                                                                                    setPreviewName(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    )
                                                                                }
                                                                                aria-invalid={Boolean(
                                                                                    errors.name,
                                                                                )}
                                                                                className="h-11 rounded-[10px] border-slate-200 bg-white px-3.5 text-sm placeholder:text-slate-400"
                                                                            />
                                                                            <div className="flex items-center justify-between gap-2">
                                                                                <InputError
                                                                                    message={
                                                                                        errors.name
                                                                                    }
                                                                                />
                                                                                <span
                                                                                    className={`ml-auto text-xs tabular-nums ${previewName.length > 100 ? 'text-amber-600' : 'text-slate-400'}`}
                                                                                >
                                                                                    {
                                                                                        previewName.length
                                                                                    }
                                                                                    /120
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-xs leading-5 text-slate-500">
                                                                                Min
                                                                                3
                                                                                karakter,
                                                                                hindari
                                                                                singkatan
                                                                                tidak
                                                                                jelas.
                                                                            </p>
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <Label
                                                                                htmlFor={`product-category-${up.id}`}
                                                                                className="text-sm font-medium text-slate-700"
                                                                            >
                                                                                Kategori
                                                                                *
                                                                            </Label>
                                                                            <Select
                                                                                name="category_id"
                                                                                required
                                                                                value={
                                                                                    previewCategoryId
                                                                                }
                                                                                onValueChange={
                                                                                    setPreviewCategoryId
                                                                                }
                                                                                onOpenChange={
                                                                                    handleCategoryOpen
                                                                                }
                                                                            >
                                                                                <SelectTrigger
                                                                                    id={`product-category-${up.id}`}
                                                                                    aria-invalid={Boolean(
                                                                                        errors.category_id,
                                                                                    )}
                                                                                    className="h-11 w-full rounded-[10px] border-slate-200 bg-white px-3.5 text-sm"
                                                                                >
                                                                                    <SelectValue placeholder="Pilih kategori" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="rounded-[12px] bg-white text-slate-900 shadow-md ring-1 ring-slate-200">
                                                                                    <SelectGroup>
                                                                                        <SelectLabel>
                                                                                            Kategori
                                                                                        </SelectLabel>
                                                                                        {categories.map(
                                                                                            (
                                                                                                category,
                                                                                            ) => (
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
                                                                                message={
                                                                                    errors.category_id
                                                                                }
                                                                            />
                                                                            <p className="text-xs text-slate-500">
                                                                                Pilih
                                                                                yang
                                                                                paling
                                                                                sesuai
                                                                                agar
                                                                                mudah
                                                                                di-filter.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                                                        <FileText className="size-4 text-slate-400" />
                                                                        <h4 className="text-sm font-semibold text-slate-900">
                                                                            Detail
                                                                            Produk
                                                                        </h4>
                                                                    </div>
                                                                    <div className="grid gap-2">
                                                                        <Label
                                                                            htmlFor={`product-description-${up.id}`}
                                                                            className="text-sm font-medium text-slate-700"
                                                                        >
                                                                            Deskripsi
                                                                            *
                                                                        </Label>
                                                                        <Textarea
                                                                            id={`product-description-${up.id}`}
                                                                            name="description"
                                                                            placeholder="Contoh: Risol mayo lumer, dibuat harian, cocok untuk snack POS. Bahan: ayam, mayo, tepung premium..."
                                                                            required
                                                                            maxLength={
                                                                                5000
                                                                            }
                                                                            rows={
                                                                                4
                                                                            }
                                                                            value={
                                                                                previewDescription
                                                                            }
                                                                            onChange={(
                                                                                e,
                                                                            ) =>
                                                                                setPreviewDescription(
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            aria-invalid={Boolean(
                                                                                errors.description,
                                                                            )}
                                                                            className="min-h-28 rounded-[10px] border-slate-200 bg-white px-3.5 py-3 text-sm placeholder:text-slate-400"
                                                                        />
                                                                        <div className="flex items-center justify-between gap-2">
                                                                            <InputError
                                                                                message={
                                                                                    errors.description
                                                                                }
                                                                            />
                                                                            <span
                                                                                className={`ml-auto text-xs tabular-nums ${previewDescription.length > 4500 ? 'text-amber-600' : 'text-slate-400'}`}
                                                                            >
                                                                                {
                                                                                    previewDescription.length
                                                                                }
                                                                                /5000
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs leading-5 text-slate-500">
                                                                            Min
                                                                            10
                                                                            karakter.
                                                                            Tulis
                                                                            bahan,
                                                                            varian,
                                                                            dan
                                                                            catatan
                                                                            penting
                                                                            untuk
                                                                            kasir
                                                                            &
                                                                            pembeli.
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                                                        <Wallet className="size-4 text-slate-400" />
                                                                        <h4 className="text-sm font-semibold text-slate-900">
                                                                            Harga
                                                                            &
                                                                            Stok
                                                                        </h4>
                                                                    </div>
                                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                                        <div className="grid gap-2">
                                                                            <Label
                                                                                htmlFor={`product-price-${up.id}`}
                                                                                className="text-sm font-medium text-slate-700"
                                                                            >
                                                                                Harga
                                                                                (Rp)
                                                                                *
                                                                            </Label>
                                                                            <div className="relative">
                                                                                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-slate-400">
                                                                                    Rp
                                                                                </span>
                                                                                <Input
                                                                                    id={`product-price-${up.id}`}
                                                                                    name="price"
                                                                                    type="number"
                                                                                    min={
                                                                                        1
                                                                                    }
                                                                                    max={
                                                                                        100000000
                                                                                    }
                                                                                    placeholder="10000"
                                                                                    required
                                                                                    value={
                                                                                        previewPrice
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        setPreviewPrice(
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    aria-invalid={Boolean(
                                                                                        errors.price,
                                                                                    )}
                                                                                    className="h-11 rounded-[10px] border-slate-200 bg-white pr-3.5 pl-10 text-sm tabular-nums placeholder:text-slate-400"
                                                                                />
                                                                            </div>
                                                                            <InputError
                                                                                message={
                                                                                    errors.price
                                                                                }
                                                                            />
                                                                            <p className="text-xs text-slate-500 tabular-nums">
                                                                                {hasPrice
                                                                                    ? `Preview: ${formatRupiah(priceNum)}`
                                                                                    : '1 – 100.000.000. Contoh: 15000'}
                                                                            </p>
                                                                        </div>
                                                                        <div className="grid gap-2">
                                                                            <Label
                                                                                htmlFor={`product-stock-${up.id}`}
                                                                                className="text-sm font-medium text-slate-700"
                                                                            >
                                                                                Stok
                                                                                awal
                                                                                *
                                                                            </Label>
                                                                            <div className="relative">
                                                                                <Input
                                                                                    id={`product-stock-${up.id}`}
                                                                                    name="stock"
                                                                                    type="number"
                                                                                    min={
                                                                                        0
                                                                                    }
                                                                                    max={
                                                                                        100000
                                                                                    }
                                                                                    placeholder="0"
                                                                                    required
                                                                                    value={
                                                                                        previewStock
                                                                                    }
                                                                                    onChange={(
                                                                                        e,
                                                                                    ) =>
                                                                                        setPreviewStock(
                                                                                            e
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    aria-invalid={Boolean(
                                                                                        errors.stock,
                                                                                    )}
                                                                                    className="h-11 rounded-[10px] border-slate-200 bg-white px-3.5 pr-16 text-sm tabular-nums placeholder:text-slate-400"
                                                                                />
                                                                                <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-medium text-slate-400">
                                                                                    item
                                                                                </span>
                                                                            </div>
                                                                            <InputError
                                                                                message={
                                                                                    errors.stock
                                                                                }
                                                                            />
                                                                            <p className="text-xs text-slate-500">
                                                                                0
                                                                                =
                                                                                pre-order
                                                                                /
                                                                                stok
                                                                                menyusul.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                                                    <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                                        <Boxes className="size-3.5" />
                                                                        Preview
                                                                        Katalog
                                                                        & POS
                                                                    </p>
                                                                    <div className="mt-3 flex gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                                                                        <div className="grid size-16 shrink-0 place-items-center rounded-[10px] bg-slate-50 text-slate-400 ring-1 ring-slate-100">
                                                                            <PackagePlus className="size-6" />
                                                                        </div>
                                                                        <div className="min-w-0 flex-1">
                                                                            <p className="truncate text-sm font-semibold text-slate-900">
                                                                                {previewName ||
                                                                                    'Nama produk akan tampil di sini'}
                                                                            </p>
                                                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                                                                    {selectedCategoryName ||
                                                                                        'Kategori'}
                                                                                </span>
                                                                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                                                                                    Approved
                                                                                </span>
                                                                            </div>
                                                                            <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
                                                                                {previewDescription ||
                                                                                    'Deskripsi akan tampil maksimal 2 baris di katalog.'}
                                                                            </p>
                                                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                                                <span className="text-sm font-bold text-slate-900 tabular-nums">
                                                                                    {hasPrice
                                                                                        ? formatRupiah(
                                                                                              priceNum,
                                                                                          )
                                                                                        : 'Rp —'}
                                                                                </span>
                                                                                <span
                                                                                    className={`rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${!hasStock ? 'bg-slate-100 text-slate-600' : stockNum === 0 ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : stockNum < 5 ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}
                                                                                >
                                                                                    Stok{' '}
                                                                                    {hasStock
                                                                                        ? stockNum
                                                                                        : '—'}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mt-2 text-xs leading-5 text-slate-500">
                                                                        Produk
                                                                        UP tidak
                                                                        perlu
                                                                        approval.
                                                                        Pastikan
                                                                        harga &
                                                                        stok
                                                                        benar
                                                                        sebelum
                                                                        simpan —
                                                                        bisa
                                                                        diedit
                                                                        nanti
                                                                        via
                                                                        inventori.
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="sticky bottom-0 z-10 flex flex-col-reverse gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:justify-end sm:p-6">
                                                                <DialogClose
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        disabled={
                                                                            processing
                                                                        }
                                                                        className="h-11 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                                                    >
                                                                        Batal
                                                                    </Button>
                                                                </DialogClose>
                                                                <Button
                                                                    type="submit"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    className="h-11 rounded-xl bg-[#0080FF] px-6 text-sm font-semibold text-white hover:bg-[#006FE0] active:bg-[#0059B8] disabled:opacity-50"
                                                                >
                                                                    {processing ? (
                                                                        <>
                                                                            <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                                            Menyimpan...
                                                                        </>
                                                                    ) : (
                                                                        'Tambah Produk'
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </>
                                                    );
                                                }}
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {up.products.length === 0 ? (
                                <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                    <div className="mx-auto grid size-10 place-items-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-200">
                                        <PackagePlus className="size-5" />
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-slate-900">
                                        Belum ada produk milik UP
                                    </p>
                                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                        Tambah produk pertama agar UP bisa
                                        berjualan di POS & katalog. Produk
                                        titipan seller akan muncul di Titipan,
                                        bukan di sini.
                                    </p>
                                </div>
                            ) : filteredProducts.length === 0 ? (
                                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                                    Tidak ada produk yang cocok dengan “
                                    {productSearch}”.
                                </div>
                            ) : (
                                <>
                                    <div className="mt-4 hidden overflow-hidden rounded-xl border border-slate-200 md:block">
                                        <table className="min-w-full text-sm">
                                            <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">
                                                        Produk
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Kategori
                                                    </th>
                                                    <th className="px-4 py-3 text-right">
                                                        Stok
                                                    </th>
                                                    <th className="px-4 py-3 text-right">
                                                        Harga
                                                    </th>
                                                    <th className="px-4 py-3 text-right">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {filteredProducts.map(
                                                    (product) => (
                                                        <tr
                                                            key={product.id}
                                                            className="bg-white hover:bg-slate-50"
                                                        >
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-slate-900">
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    Dikelola{' '}
                                                                    {up.name}
                                                                </p>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-600">
                                                                {
                                                                    product.category_name
                                                                }
                                                            </td>
                                                            <td className="px-4 py-3 text-right tabular-nums">
                                                                <span
                                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${product.stock === 0 ? 'bg-rose-50 text-rose-700' : product.stock < 5 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}
                                                                >
                                                                    {
                                                                        product.stock
                                                                    }
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-semibold text-slate-900 tabular-nums">
                                                                {formatRupiah(
                                                                    product.price,
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3 text-right">
                                                                <Badge className="rounded-md bg-emerald-50 text-emerald-700">
                                                                    {
                                                                        product
                                                                            .status
                                                                            .label
                                                                    }
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 grid gap-3 md:hidden">
                                        {filteredProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="rounded-xl border border-slate-200 bg-white p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-slate-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {
                                                                product.category_name
                                                            }{' '}
                                                            • Dikelola {up.name}
                                                        </p>
                                                    </div>
                                                    <Badge className="shrink-0 rounded-md bg-emerald-50 text-emerald-700">
                                                        {product.status.label}
                                                    </Badge>
                                                </div>
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                                        {formatRupiah(
                                                            product.price,
                                                        )}
                                                    </span>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.stock === 0 ? 'bg-rose-50 text-rose-700' : product.stock < 5 ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}
                                                    >
                                                        Stok {product.stock}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

UpJurusanShow.layout = {
    breadcrumbs: [
        { title: 'UP Jurusan', href: '/admin-jurusan/up-jurusan' },
        { title: 'Detail', href: '#' },
    ],
};
