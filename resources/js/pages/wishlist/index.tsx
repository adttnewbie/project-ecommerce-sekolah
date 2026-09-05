import type { PageProps as SharedPageProps } from '@inertiajs/core';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ProductCard } from '@/components/product/product-card';
import type { ProductCardProduct } from '@/components/product/product-card';
import { ProductGrid } from '@/components/product/product-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { home } from '@/routes';
import {
    index as wishlistIndex,
    toggle as wishlistToggle,
} from '@/routes/wishlist';
import type { Auth } from '@/types';

type WishlistPaginator = {
    data: ProductCardProduct[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
};

type PageProps = {
    auth: Auth;
    products: WishlistPaginator;
} & SharedPageProps;

export default function WishlistIndex() {
    const { products } = usePage<PageProps>().props;
    const [items, setItems] = useState(products.data);
    const [syncedItems, setSyncedItems] = useState(products.data);

    // Adjust state during render when fresh props arrive (same pattern as
    // ProductCard wishlist sync — recommended alternative to effects).

    if (syncedItems !== products.data) {
        setSyncedItems(products.data);
        setItems(products.data);
    }

    const pageHref = (page: number) =>
        wishlistIndex({
            query: {
                page: page > 1 ? page : undefined,
            },
        });

    const handleWishlistToggle = (
        product: ProductCardProduct,
        next: boolean,
    ) => {
        // Card delegates persistence to this callback when provided, so
        // fire the backend toggle here AND drop the card locally.
        if (next) {
            return;
        }

        setItems((current) => current.filter((item) => item.id !== product.id));
        router.post(
            wishlistToggle(product.slug).url,
            {},
            {
                preserveScroll: true,
                preserveUrl: true,
                onError: () => {
                    toast.error('Gagal menghapus dari wishlist');
                    router.reload({ only: ['products'] });
                },
            },
        );
    };

    return (
        <>
            <Head title="Wishlist" />
            <main className="min-h-[calc(100svh-4rem)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-7xl space-y-6">
                    <section>
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge className="rounded-[6px] bg-[#EFF8FF] text-[#0080FF] ring-1 ring-[#BCE0FF]">
                                <Heart className="size-3.5" />
                                Wishlist
                            </Badge>
                            <Badge className="rounded-[6px] bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                                {products.total} produk
                            </Badge>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                            Wishlistmu
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Produk yang kamu simpan untuk dibeli nanti.
                        </p>
                    </section>

                    {items.length === 0 ? (
                        <section className="rounded-[14px] border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-[14px] bg-[#EFF8FF] text-[#0080FF]">
                                <Heart className="size-5" />
                            </div>
                            <h2 className="mt-4 text-lg font-bold text-slate-900">
                                Wishlist masih kosong
                            </h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Ketuk ikon hati pada produk yang kamu suka untuk
                                menyimpannya di sini.
                            </p>
                            <Button
                                asChild
                                className="mt-6 h-11 rounded-[12px] px-6"
                            >
                                <Link href={home()}>Mulai Belanja</Link>
                            </Button>
                        </section>
                    ) : (
                        <section>
                            <ProductGrid>
                                {items.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onWishlistToggle={handleWishlistToggle}
                                    />
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

WishlistIndex.layout = {
    breadcrumbs: [
        {
            title: 'Wishlist',
            href: wishlistIndex(),
        },
    ],
};
