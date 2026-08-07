<?php

namespace App\Http\Controllers;

use App\Http\Requests\Admin\SaveCategoryRequest;
use App\Models\Category;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AdminCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
        ]);

        $query = Category::query()->withCount('products');

        if ($search = $validated['q'] ?? null) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $categories = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories->through(fn (Category $category) => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'products_count' => $category->products_count,
            ]),
            'filters' => [
                'q' => $validated['q'] ?? '',
            ],
        ]);
    }

    public function store(SaveCategoryRequest $request): RedirectResponse
    {
        $this->createWithUniqueSlug($request->string('name')->toString());

        return to_route('admin.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function update(SaveCategoryRequest $request, Category $category): RedirectResponse
    {
        $name = $request->string('name')->toString();

        $this->updateWithUniqueSlug($category, $name);

        return to_route('admin.categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        if ($category->products()->exists()) {
            throw ValidationException::withMessages([
                'category' => 'Kategori tidak dapat dihapus karena masih memiliki produk.',
            ])->redirectTo(route('admin.categories.index'));
        }

        $category->delete();

        return to_route('admin.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }

    private function uniqueSlug(string $name, ?Category $ignoredCategory = null): string
    {
        $baseSlug = Str::slug($name) ?: 'category';
        $slug = $baseSlug;
        $suffix = 2;

        while ($this->slugExists($slug, $ignoredCategory)) {
            $slug = $baseSlug.'-'.$suffix;
            $suffix++;
        }

        return $slug;
    }

    private function slugExists(string $slug, ?Category $ignoredCategory = null): bool
    {
        return Category::query()
            ->where('slug', $slug)
            ->when(
                $ignoredCategory,
                fn ($query) => $query->whereKeyNot($ignoredCategory->getKey()),
            )
            ->exists();
    }

    /**
     * Create a category with a unique slug.
     *
     * The slug is computed from the name, then the row is inserted. When a
     * concurrent request wins the race for the same slug, the unique index
     * rejects the insert; the violation is caught and the slug is recomputed
     * so the create succeeds with the next available suffix.
     */
    private function createWithUniqueSlug(string $name): Category
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                return Category::query()->create([
                    'name' => $name,
                    'slug' => $this->uniqueSlug($name),
                ]);
            } catch (QueryException $exception) {
                if (! $this->isUniqueConstraintViolation($exception)) {
                    throw $exception;
                }

                if ($attempt < 5) {
                    usleep(random_int(0, 60_000));
                }
            }
        }

        throw new RuntimeException('Unable to create a category with a unique slug.');
    }

    /**
     * Update a category, keeping its slug unique.
     *
     * Same retry semantics as {@see self::createWithUniqueSlug()}: a slug
     * stolen by a concurrent request is detected through the unique index
     * and the update is retried with the next available suffix.
     */
    private function updateWithUniqueSlug(Category $category, string $name): Category
    {
        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $category->update([
                    'name' => $name,
                    'slug' => $this->uniqueSlug($name, $category),
                ]);

                return $category;
            } catch (QueryException $exception) {
                if (! $this->isUniqueConstraintViolation($exception)) {
                    throw $exception;
                }

                if ($attempt < 5) {
                    usleep(random_int(0, 60_000));
                }
            }
        }

        throw new RuntimeException('Unable to update the category with a unique slug.');
    }

    private function isUniqueConstraintViolation(QueryException $exception): bool
    {
        return (string) $exception->getCode() === '23000';
    }
}
