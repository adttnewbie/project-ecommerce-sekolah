<?php

namespace App\Support;

use App\Models\Product;
use Illuminate\Support\Str;

/**
 * Single source of truth for collision-safe product slugs.
 *
 * Used by both the seller catalog and the UP Jurusan product intake so the
 * "{base}-{n}" fallback behaves identically everywhere.
 */
class ProductSlug
{
    public static function unique(string $name, ?Product $ignoredProduct = null): string
    {
        $base = Str::slug($name) ?: 'product';
        $slug = $base;
        $suffix = 2;

        while (self::exists($slug, $ignoredProduct)) {
            $slug = $base.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private static function exists(string $slug, ?Product $ignoredProduct = null): bool
    {
        return Product::query()
            ->where('slug', $slug)
            ->when(
                $ignoredProduct,
                fn ($query) => $query->whereKeyNot($ignoredProduct->getKey()),
            )
            ->exists();
    }
}
