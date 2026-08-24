<?php

use App\Enums\ProductSalesMethod;
use App\Enums\UpJurusanConsignmentStatus;
use App\Enums\UserRole;
use App\Events\OrderItemsAwaitingVerification;
use App\Models\CartItem;
use App\Models\Notification;
use App\Models\NotificationPreference;
use App\Models\Product;
use App\Models\UpJurusan;
use App\Models\UpJurusanConsignment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function picketForUpJurusan(int $upJurusanId): User
{
    return User::factory()->create([
        'role' => UserRole::PicketOfficer,
        'up_jurusan_id' => $upJurusanId,
    ]);
}

function seedUpManagedCart(User $buyer, int $quantity = 2): Product
{
    $seller = User::factory()->create(['role' => UserRole::Seller]);
    $up = UpJurusan::factory()->create();
    $product = Product::factory()
        ->for($seller, 'seller')
        ->approved()
        ->create([
            'name' => 'Seragam Konsinyasa',
            'price' => 20000,
            'stock' => 0,
            'sales_method' => ProductSalesMethod::UpJurusan,
        ]);

    UpJurusanConsignment::factory()->create([
        'seller_id' => $seller->id,
        'product_id' => $product->id,
        'up_jurusan_id' => $up->id,
        'received_quantity' => 10,
        'sold_quantity' => 0,
        'status' => UpJurusanConsignmentStatus::Received,
    ]);

    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $product->id,
        'quantity' => $quantity,
    ]);

    // users.up_jurusan_id is unique - exactly one picket serves each up
    // jurusan, so resolve it after seeding and return the pair implicitly
    // through the product's consignments.
    return $product;
}

it('notifies the up jurusan picket when a new order awaits cash verification', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = seedUpManagedCart($buyer);
    $up = $product->upJurusanConsignments->first()->up_jurusan_id;

    $picket = picketForUpJurusan($up);
    $strangerPicket = picketForUpJurusan(UpJurusan::factory()->create()->id);

    $this->actingAs($buyer)->post(route('checkout'))->assertRedirect();

    $rows = Notification::query()->where('key', 'like', 'picket-new-order:%')->get();

    expect($rows)->toHaveCount(1)
        ->and($rows[0]->user_id)->toBe($picket->id)
        ->and($rows[0]->type)->toBe('payment')
        ->and($rows[0]->user_id)->not->toBe($strangerPicket->id);
});

it('counts only actionable items in the notice for that up jurusan', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = seedUpManagedCart($buyer);
    $up = $product->upJurusanConsignments->first()->up_jurusan_id;
    $picket = picketForUpJurusan($up);

    // Self-managed item rides along but is never picket work.
    $selfProduct = Product::factory()->for(
        User::factory()->create(['role' => UserRole::Seller]),
        'seller',
    )->approved()->create(['stock' => 5]);

    CartItem::query()->create([
        'user_id' => $buyer->id,
        'product_id' => $selfProduct->id,
        'quantity' => 1,
    ]);

    $this->actingAs($buyer)->post(route('checkout'))->assertRedirect();

    $notification = Notification::query()
        ->where('user_id', $picket->id)
        ->where('key', 'like', 'picket-new-order:%')
        ->sole();

    expect($notification->description)->toContain('1 item')
        ->and(Notification::query()->where('user_id', $picket->id)->count())->toBe(1);
});

it('stays idempotent per order and up jurusan while new orders still notify', function () {
    $up = UpJurusan::factory()->create();
    $picket = picketForUpJurusan($up->id);

    foreach ([901, 901, 902] as $orderId) {
        OrderItemsAwaitingVerification::dispatch(
            upJurusanId: $up->id,
            orderId: $orderId,
            orderCode: "TRX-{$orderId}",
            itemCount: 2,
        );
    }

    // Retry of order 901 stays a single row; order 902 is genuinely new work.
    expect(Notification::query()
        ->where('key', "picket-new-order:901:{$up->id}")
        ->where('user_id', $picket->id)
        ->count())->toBe(1)
        ->and(Notification::query()
            ->where('key', "picket-new-order:902:{$up->id}")
            ->where('user_id', $picket->id)
            ->exists())->toBeTrue();
});

it('respects the picket payment preference gate', function () {
    $buyer = User::factory()->create(['role' => UserRole::Buyer]);
    $product = seedUpManagedCart($buyer);
    $up = $product->upJurusanConsignments->first()->up_jurusan_id;

    $picket = picketForUpJurusan($up);

    NotificationPreference::create([
        'user_id' => $picket->id,
        'type' => 'payment',
        'in_app_enabled' => false,
        'email_enabled' => false,
    ]);

    $this->actingAs($buyer)->post(route('checkout'))->assertRedirect();

    expect(Notification::query()->where('user_id', $picket->id)->exists())->toBeFalse();
});
