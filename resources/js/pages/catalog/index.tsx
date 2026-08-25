import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Head, Link, usePage } from '@inertiajs/react';
import { Package, Search, Tags } from 'lucide-react';
import { ProductCard  } from '@/components/product/product-card';
import type {ProductCardProduct} from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import { index as catalogIndex } from '@/routes/catalog';
import type { Auth } from '@/types';

type CatalogCategory = {
    id: number;
    name: string;
    slug: string;
};

type CatalogProduct = ProductCardProduct;

type CatalogPaginator = {
    data: CatalogProduct[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type CatalogIndexProps = {
    categories: CatalogCategory[];
    filters: {
        search: string;
        category: string;
    };
    products: CatalogPaginator;
};

type PageProps = {
    auth: Auth;
} & SharedPageProps;

export default function CatalogIndex({
    categories,
    filters,
    products,
}: CatalogIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const greetingName =
        auth.user?.role === 'buyer'
            ? auth.user.name.split(' ')[0]
            : 'selamat datang';

    const pageHref = (page: number) =>
        catalogIndex({
            query: {
                search: filters.search || undefined,
                category: filters.category || undefined,
                page: page > 1 ? page : undefined,
            },
        });

    return (
        <>
            <Head title="EduCart" />
            <main className="min-h-screen bg-slate-50">
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
                    <section className="pt-2 pb-1">
                        <Badge className="mb-4 rounded-full bg-[#EFF8FF] px-3 py-1 text-[#0080FF] ring-1 ring-[#BCE0FF]">
                            <Tags className="size-3.5" />
                            Produk approved
                        </Badge>
                        <h1 className="max-w-3xl text-3xl leading-[1.1] font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Halo, {greetingName}. Mau cari apa hari ini?
                        </h1>
                        <p className="mt-3 max-w-2xl text-base leading-6 text-slate-600">
                            Pilih kategori di bawah, atau gunakan search di
                            navbar untuk menemukan produk sekolah yang sudah
                            disetujui admin.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Kategori
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Filter produk tanpa keluar dari Home.
                                </p>
                            </div>
                            {filters.search && (
                                <Badge className="rounded-full bg-white text-slate-600 ring-1 ring-slate-200">
                                    <Search className="size-3.5" />
                                    {filters.search}
                                </Badge>
                            )}
                        </div>
                        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 scrollbar-hide">
                            <Button
                                asChild
                                variant={
                                    filters.category === ''
                                        ? 'default'
                                        : 'outline'
                                }
                                className={
                                    filters.category === ''
                                        ? 'h-11 shrink-0 rounded-[12px] px-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
                                        : 'h-11 shrink-0 rounded-[12px] border-slate-200 bg-white px-4 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50'
                                }
                            >
                                <Link
                                    href={home({
                                        query: filters.search
                                            ? { search: filters.search }
                                            : {},
                                    })}
                                >
                                    All
                                </Link>
                            </Button>
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    asChild
                                    variant={
                                        filters.category === category.slug
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={
                                        filters.category === category.slug
                                            ? 'h-11 shrink-0 rounded-[12px] px-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]'
                                            : 'h-11 shrink-0 rounded-[12px] border-slate-200 bg-white px-4 text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.05)] hover:bg-slate-50'
                                    }
                                >
                                    <Link
                                        href={home({
                                            query: {
                                                ...(filters.search
                                                    ? {
                                                          search: filters.search,
                                                      }
                                                    : {}),
                                                category: category.slug,
                                            },
                                        })}
                                    >
                                        {category.name}
                                    </Link>
                                </Button>
                            ))}
                        </div>
                    </section>

                    <section className="flex items-end justify-between gap-4">
                        <div className="max-w-3xl">
                            <h2 className="text-[20px] font-semibold leading-7 text-slate-900">
                                Produk pilihan
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Semua item yang tampil sudah siap dilihat buyer.
                            </p>
                        </div>
                        <Badge className="w-fit shrink-0 rounded-full bg-white text-slate-600 ring-1 ring-slate-200">
                            {products.total} produk tersedia
                        </Badge>
                    </section>

                    {products.data.length === 0 ? (
                        <section className="rounded-[14px] border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                <Package className="size-5" />
                            </div>
                            <h2 className="mt-4 text-lg font-bold text-slate-900">
                                Produk belum ditemukan
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Coba gunakan kata kunci lain atau pilih semua
                                kategori untuk melihat produk yang tersedia.
                            </p>
                            <Button asChild className="mt-6 h-11 rounded-[12px] px-6">
                                <Link href={home()}>Mulai Belanja</Link>
                            </Button>
                        </section>
                    ) : (
                        <section>
                            <ProductGrid>
                                {products.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </ProductGrid>
                        </section>
                    )}

                    {products.last_page > 1 && (
                        <section className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-slate-500">
                                Menampilkan {products.from}–{products.to} dari{' '}
                                {products.total} produk
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="default"
                                    disabled={products.current_page <= 1}
                                    asChild
                                    className="h-11 rounded-[12px]"
                                >
                                    <Link
                                        href={pageHref(
                                            products.current_page - 1,
                                        )}
                                        preserveScroll={false}
                                    >
                                        Sebelumnya
                                    </Link>
                                </Button>
                                <span className="text-sm font-medium text-slate-600">
                                    Halaman {products.current_page} dari{' '}
                                    {products.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="default"
                                    disabled={
                                        products.current_page >=
                                        products.last_page
                                    }
                                    asChild
                                    className="h-11 rounded-[12px]"
                                >
                                    <Link
                                        href={pageHref(
                                            products.current_page + 1,
                                        )}
                                        preserveScroll={false}
                                    >
                                        Berikutnya
                                    </Link>
                                </Button>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    );
}
