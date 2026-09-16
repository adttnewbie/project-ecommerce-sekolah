/**
 * URL publik untuk gambar produk.
 *
 * Gambar diserve lewat route backend `/product-images/{path}` yang me-redirect
 * ke presigned URL R2 (bucket privat) dengan fallback ke disk lokal `public`
 * untuk file lama. Jangan pernah membangun `/storage/...` langsung di sini —
 * path mentah dari backend (mis. `products/abc.jpg`) bukan URL yang bisa
 * diakses browser.
 */
export function productImageUrl(image: string | null | undefined): string | null {
    if (!image) {
        return null;
    }

    if (image.startsWith('http') || image.startsWith('/')) {
        return image;
    }

    return `/product-images/${image}`;
}
