<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * Redirect ke URL akses gambar produk yang sedang berlaku.
     *
     * Gambar baru tinggal di disk "r2" (bucket privat) sehingga setiap hit
     * menandatangani temporary URL segar; gambar lama (sebelum migrasi R2)
     * fallback ke disk "public" lokal. Browser selalu mengunduh byte langsung
     * dari storage, bukan lewat aplikasi.
     */
    public function show(string $path): RedirectResponse
    {
        $path = ltrim($path, '/');

        abort_unless($this->isAllowedPath($path), 403);

        $r2 = Storage::disk('r2');

        if ($r2->exists($path)) {
            if ($r2->providesTemporaryUrls()) {
                return redirect()->away($r2->temporaryUrl($path, now()->addMinutes(15)));
            }

            return redirect()->away($r2->url($path));
        }

        $public = Storage::disk('public');

        if ($public->exists($path)) {
            return redirect()->away($public->url($path));
        }

        abort(404);
    }

    /**
     * Batasi route agar tidak menjadi oracle presigned-URL untuk key arbitrer.
     */
    private function isAllowedPath(string $path): bool
    {
        if ($path === '' || str_contains($path, '..')) {
            return false;
        }

        return str_starts_with($path, 'products/');
    }
}
