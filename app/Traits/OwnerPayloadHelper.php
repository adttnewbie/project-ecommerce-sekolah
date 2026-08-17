<?php

namespace App\Traits;

use App\Models\Product;

trait OwnerPayloadHelper
{
    /**
     * @return array{id: int|null, name: string|null}
     */
    protected function sellerOwnerPayload(Product $product): array
    {
        return $product->sellerPayload();
    }

    /**
     * @return array{id: int|null, name: string|null, type: string|null}
     */
    protected function buyerOwnerPayload(Product $product): array
    {
        return $product->ownerPayload();
    }
}
