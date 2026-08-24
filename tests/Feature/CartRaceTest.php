<?php

use App\Enums\UserRole;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Events\TransactionRolledBack;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

uses(RefreshDatabase::class);

function createCartBuyerWithApprovedProduct(int $stock = 10): array
{
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = Product::factory()->approved()->for(
        User::factory()->state(['role' => UserRole::Seller])->create(),
        'seller',
    )->create(['stock' => $stock]);

    return [$buyer, $product];
}

it('merges quantities after losing the insert race for the same product', function () {
    [$buyer, $product] = createCartBuyerWithApprovedProduct();

    // A parallel request wins the insert; ours loses with SQLSTATE 23000.
    // The winner commits in its own connection, so materialise it right
    // after our failed attempt rolls back - before the retry re-selects.
    $collided = false;
    $winnerInserted = false;

    Event::listen(TransactionRolledBack::class, function () use (&$winnerInserted, $buyer, $product): void {
        if ($winnerInserted) {
            return;
        }

        $winnerInserted = true;

        DB::table('cart_items')->insert([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    });

    CartItem::creating(function () use (&$collided): bool {
        if ($collided) {
            return true;
        }

        $collided = true;

        throw new UniqueConstraintViolationException(
            'sqlite',
            'insert into "cart_items" ("quantity") values (?)',
            [],
            new RuntimeException('SQLITE_CONSTRAINT: UNIQUE constraint failed: cart_items.user_id, cart_items.product_id'),
        );
    });

    $response = $this->actingAs($buyer)
        ->post(route('cart.items.store', $product), ['quantity' => 3])
        ->assertRedirect(route('cart.index'));

    $response->assertSessionHas('success');

    expect(CartItem::query()->where('user_id', $buyer->id)->count())->toBe(1)
        ->and(CartItem::query()->where('user_id', $buyer->id)->sole()->quantity)->toBe(5);
});

it('re-validates stock against the merged quantity, not the request alone', function () {
    [$buyer, $product] = createCartBuyerWithApprovedProduct(stock: 5);

    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => 4,
    ]);

    $this->actingAs($buyer)
        ->from(route('cart.index'))
        ->post(route('cart.items.store', $product), ['quantity' => 3])
        ->assertRedirect(route('cart.index'))
        ->assertSessionHasErrors('quantity');

    expect(CartItem::query()->where('user_id', $buyer->id)->sole()->quantity)->toBe(4);
});

it('adds a product to an empty cart without racing', function () {
    [$buyer, $product] = createCartBuyerWithApprovedProduct();

    $this->actingAs($buyer)
        ->post(route('cart.items.store', $product), ['quantity' => 2])
        ->assertRedirect(route('cart.index'));

    expect(CartItem::query()->where('user_id', $buyer->id)->sole()->quantity)->toBe(2);
});
