# Graph Report - project-ecommerce-sekolah  (2026-08-02)

## Corpus Check
- 372 files · ~141,267 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2031 nodes · 5225 edges · 195 communities (125 shown, 70 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 222 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cfd0e30d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- badge.tsx
- cn
- card.tsx
- two-factor-setup-modal.tsx
- utils.ts
- AuthRedirect
- Illuminate\Foundation\Http\FormRequest
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- PicketUpJurusanConsignmentController
- EduCart Design System
- UpJurusan
- app-header.tsx
- User.php
- devDependencies
- inventory/index.tsx
- UpJurusanConsignment
- dropdown-menu.tsx
- User
- index.ts
- app-sidebar.tsx
- Order
- ReportAggregationService
- UpJurusanDailyReport
- dependencies
- OrderLivenessService
- FortifyServiceProvider.php
- components.json
- Illuminate\Http\Request
- server.sh
- Illuminate\Database\Eloquent\Model
- compilerOptions
- sidebar.tsx
- OrderStatus
- Closure
- SellerProductController
- app.tsx
- CheckoutController
- UpJurusanStockMovement
- composer.json
- scripts
- scripts
- auth-simple-layout.tsx
- optionalDependencies
- Major
- AdminDashboardController
- require-dev
- ProductCatalogSeeder
- breadcrumbs.tsx
- AdminCategoryController
- seller/dashboard.tsx
- HandleInertiaRequests
- Position.php
- picket/dashboard.tsx
- CartController
- require
- ci:check
- FortifyServiceProvider
- toggle-group.tsx
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SchoolClass
- Illuminate\Console\Command
- EduCart
- TestCase
- admin-jurusan/dashboard.tsx
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- ProductFactory
- StoreProductRequest
- post-create-project-cmd
- setup
- eslint.config.js
- icon.tsx
- placeholder-pattern.tsx
- UserFactory
- 10.1 Button
- concurrently
- @fontsource-variable/inter
- globals
- CreateNewUser.php
- TransactionCode
- input-otp
- lucide-react
- radix-ui
- @radix-ui/react-avatar
- 2026_08_02_000001_add_unique_picket_assignment_to_users.php
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-select
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- 10.4 Product Card
- recharts
- shadcn
- 4. Color System
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- @types/react
- typescript
- vite
- @vitejs/plugin-react
- seller/consignments/index.tsx
- 9. Layout
- BuyerProductDetailController
- 16. Responsive Design
- 3. Brand Identity
- 5. Typography
- 10.2 Input
- 13. Navigation and User Flow
- 18. Motion and Animation
- 1. Product Overview
- 20. Image Guidelines
- 11.1 Home Page
- 11.3 Product Detail Page
- 21. Content and Copywriting
- 2. Design Direction
- 6. Spacing System
- 8. Shadow System
- babel-plugin-react-compiler
- @inertiajs/react
- AGENTS.md
- @inertiajs/vite
- package.json
- @types/react-dom
- prettier
- @base-ui/react
- class-variance-authority
- eslint-import-resolver-typescript
- eslint-plugin-import
- laravel-vite-plugin
- @radix-ui/react-collapsible
- @radix-ui/react-label
- @radix-ui/react-navigation-menu
- @radix-ui/react-separator
- @radix-ui/react-slot
- react-dom
- tw-animate-css
- prettier-plugin-tailwindcss
- @stylistic/eslint-plugin
- @types/node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 201 edges
2. `User` - 121 edges
3. `Product` - 86 edges
4. `Button()` - 62 edges
5. `Order` - 59 edges
6. `OrderItem` - 58 edges
7. `UpJurusanConsignment` - 52 edges
8. `EduCart Design System` - 50 edges
9. `UpJurusan` - 44 edges
10. `Category` - 42 edges

## Surprising Connections (you probably didn't know these)
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `settlementOrder()` --calls--> `OrderItem`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/OrderItem.php
- `makePaymentItem()` --calls--> `OrderItem`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/OrderItem.php
- `payoutFixture()` --calls--> `Product`  [INFERRED]
  tests/Feature/ConsignmentPayoutTest.php → app/Models/Product.php
- `makeConsignment()` --calls--> `Product`  [INFERRED]
  tests/Unit/ConsignmentTransitionServiceTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (195 total, 70 thin omitted)

### Community 0 - "badge.tsx"
Cohesion: 0.04
Nodes (72): Badge(), badgeVariants, Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow() (+64 more)

### Community 1 - "cn"
Cohesion: 0.07
Nodes (43): AlertDialogOverlay(), CardFooter(), Checkbox(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent() (+35 more)

### Community 2 - "card.tsx"
Cohesion: 0.13
Nodes (20): Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Props, UpJurusan (+12 more)

### Community 3 - "two-factor-setup-modal.tsx"
Cohesion: 0.06
Nodes (37): AlertError(), Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration() (+29 more)

### Community 4 - "utils.ts"
Cohesion: 0.06
Nodes (51): CardAction(), Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger(), SelectValue() (+43 more)

### Community 5 - "AuthRedirect"
Cohesion: 0.11
Nodes (9): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, TwoFactorLoginResponse, AuthRedirect, Laravel\Fortify\Contracts\LoginResponse, Laravel\Fortify\Contracts\PasswordConfirmedResponse, Laravel\Fortify\Contracts\TwoFactorLoginResponse (+1 more)

### Community 6 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.06
Nodes (16): ResetUserPassword, emailRules(), nameRules(), profileRules(), SecurityController, RejectProductRequest, SaveCategoryRequest, UpdateInventoryRequest (+8 more)

### Community 7 - "categories/index.tsx"
Cohesion: 0.13
Nodes (26): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+18 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.06
Nodes (4): DomainEvent, UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.15
Nodes (5): AdminProductModerationController, Product, PreOrderRules, settlementOrder(), makePaymentItem()

### Community 11 - "OrderItem"
Cohesion: 0.07
Nodes (13): SellerOrderController, OrderItem, OrderItemCancellation, OrderItemFulfillment, OrderPaymentSync, OrderStatusSync, PaymentTransitionService, up() (+5 more)

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.10
Nodes (8): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), CartItem

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.10
Nodes (7): AdminJurusanDashboardController, AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, ActorLifecycle, picketUpJurusanFixture(), makeConsignment()

### Community 16 - "app-header.tsx"
Cohesion: 0.10
Nodes (22): AppHeader(), BuyerNavLink(), getBuyerNavItems(), AppSidebarHeader(), getSearchConfig(), Avatar(), AvatarBadge(), AvatarFallback() (+14 more)

### Community 17 - "User.php"
Cohesion: 0.11
Nodes (4): label(), options(), Category, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, eslint (+9 more)

### Community 19 - "inventory/index.tsx"
Cohesion: 0.14
Nodes (22): HeaderNotification, notificationMenuStyle, roleLabels, Props, Dialog(), DialogClose(), DialogContent(), DialogDescription() (+14 more)

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.14
Nodes (7): AdminJurusanConsignmentController, UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService, up(), UpJurusanConsignmentStatus

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.13
Nodes (16): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+8 more)

### Community 23 - "User"
Cohesion: 0.12
Nodes (9): SellerDashboardController, User, OrderPolicy, UserPolicy, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable (+1 more)

### Community 24 - "index.ts"
Cohesion: 0.18
Nodes (12): AppContent(), Props, AppShell(), Props, AppHeaderLayout(), AppSidebarLayout(), AppLayout(), BreadcrumbItem (+4 more)

### Community 25 - "app-sidebar.tsx"
Cohesion: 0.13
Nodes (21): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), SidebarContent(), SidebarFooter(), SidebarGroup() (+13 more)

### Community 26 - "Order"
Cohesion: 0.18
Nodes (4): AdminOrderController, BuyerOrderController, Order, OrderSettlementService

### Community 27 - "ReportAggregationService"
Cohesion: 0.14
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, @laravel/passkeys, dependencies, clsx, @laravel/passkeys, @radix-ui/react-checkbox, react, sonner (+3 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.15
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "FortifyServiceProvider.php"
Cohesion: 0.12
Nodes (6): PasswordResetResponse, RedirectAsIntended, RegisterResponse, Illuminate\Contracts\Support\Responsable, Laravel\Fortify\Contracts\PasswordResetResponse, Laravel\Fortify\Contracts\RegisterResponse

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Illuminate\Http\Request"
Cohesion: 0.08
Nodes (15): AdminProductController, AdminSellerApplicationController, AdminUserController, BuyerCatalogController, Controller, NotificationDismissalController, SellerApplicationController, SellerConsignmentController (+7 more)

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.09
Nodes (11): NotificationDismissal, UpJurusanPayout, CategoryFactory, OrderFactory, OrderItemFactory, SellerApplicationFactory, UpJurusanConsignmentFactory, UpJurusanFactory (+3 more)

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "sidebar.tsx"
Cohesion: 0.11
Nodes (24): NavUser(), Sidebar(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarInset(), SidebarMenuAction() (+16 more)

### Community 38 - "OrderStatus"
Cohesion: 0.14
Nodes (11): Collection, Attribute, up(), down(), expandEnumColumn(), up(), down(), expandEnumColumn() (+3 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "SellerProductController"
Cohesion: 0.29
Nodes (3): SellerProductController, up(), ProductStatus

### Community 41 - "app.tsx"
Cohesion: 0.21
Nodes (7): Toaster(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), AuthSimpleLayout(), AuthLayout()

### Community 43 - "UpJurusanStockMovement"
Cohesion: 0.10
Nodes (3): UpJurusanStockMovement, MoneyCalculationService, payoutFixture()

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, lint, lint:check, post-autoload-dump, post-update-cmd, pre-package-uninstall, types:check, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 46 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+2 more)

### Community 47 - "auth-simple-layout.tsx"
Cohesion: 0.25
Nodes (6): AppLogo(), AppLogoIcon(), Props, AuthTheme, lightAuthTheme, AuthLayoutProps

### Community 48 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 51 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 53 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.08
Nodes (27): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+19 more)

### Community 57 - "Position.php"
Cohesion: 0.33
Nodes (3): DatabaseSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 58 - "picket/dashboard.tsx"
Cohesion: 0.20
Nodes (7): Consignment, DailyReportTransaction, formatRupiah(), formatTime(), PicketDashboard(), PosProduct, Props

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 62 - "FortifyServiceProvider"
Cohesion: 0.25
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 63 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 67 - "Illuminate\Console\Command"
Cohesion: 0.40
Nodes (3): DetectStuckOrdersCommand, ExpireUnpaidOrdersCommand, Illuminate\Console\Command

### Community 68 - "EduCart"
Cohesion: 0.22
Nodes (8): Demo Data, Deployment Checklist, EduCart, Fitur Utama, Production Notes, Quality Checks, Role Pengguna, Setup Local

### Community 70 - "admin-jurusan/dashboard.tsx"
Cohesion: 0.38
Nodes (6): AdminJurusanDashboard(), Dashboard, formatRupiah(), formatTime(), Props, statusStyles

### Community 71 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 72 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 73 - "test"
Cohesion: 0.40
Nodes (5): test, @lint:check, @php artisan config:clear --ansi, @php artisan test, @types:check

### Community 74 - "2026_06_26_000002_add_up_jurusan_owner_to_products.php"
Cohesion: 0.60
Nodes (4): addOwnerConstraint(), down(), dropOwnerConstraint(), up()

### Community 75 - "2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php"
Cohesion: 0.60
Nodes (3): backfillExistingReports(), movementProductName(), up()

### Community 76 - "use-mobile.tsx"
Cohesion: 0.70
Nodes (4): getServerSnapshot(), isSmallerThanBreakpoint(), mediaQueryListener(), useIsMobile()

### Community 77 - "button.tsx"
Cohesion: 0.06
Nodes (45): DeleteUser(), InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Props, TextLink() (+37 more)

### Community 81 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 94 - "setup"
Cohesion: 0.22
Nodes (9): post-root-package-install, setup, bun install, bun run build, composer install, @php artisan key:generate, @php artisan migrate --force --seed, @php artisan storage:link (+1 more)

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 106 - "CreateNewUser.php"
Cohesion: 0.40
Nodes (3): CreateNewUser, Position, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

### Community 148 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 149 - "9. Layout"
Cohesion: 0.40
Nodes (5): 9. Layout, Breakpoints, Container, Grid produk, Header layout

### Community 151 - "16. Responsive Design"
Cohesion: 0.50
Nodes (4): 16. Responsive Design, Desktop rules, Mobile first, Mobile rules

### Community 152 - "3. Brand Identity"
Cohesion: 0.50
Nodes (4): 3. Brand Identity, Brand personality, Logo, Nama brand

### Community 153 - "5. Typography"
Cohesion: 0.50
Nodes (4): 5. Typography, Aturan tipografi, Font utama, Typography scale

### Community 154 - "10.2 Input"
Cohesion: 0.67
Nodes (3): 10.2 Input, State, Style

### Community 155 - "13. Navigation and User Flow"
Cohesion: 0.67
Nodes (3): 13. Navigation and User Flow, Flow admin produk, Flow pembelian utama

### Community 156 - "18. Motion and Animation"
Cohesion: 0.67
Nodes (3): 18. Motion and Animation, Durasi, Easing

### Community 157 - "1. Product Overview"
Cohesion: 0.67
Nodes (3): 1. Product Overview, Target pengguna, Tujuan desain

### Community 158 - "20. Image Guidelines"
Cohesion: 0.67
Nodes (3): 20. Image Guidelines, Banner, Product image

### Community 172 - "package.json"
Cohesion: 0.40
Nodes (4): packageManager, private, $schema, type

## Knowledge Gaps
- **451 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+446 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **70 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `badge.tsx`, `card.tsx`, `two-factor-setup-modal.tsx`, `utils.ts`, `sidebar.tsx`, `admin-jurusan/dashboard.tsx`, `categories/index.tsx`, `app.tsx`, `button.tsx`, `auth-simple-layout.tsx`, `app-header.tsx`, `inventory/index.tsx`, `breadcrumbs.tsx`, `dropdown-menu.tsx`, `seller/dashboard.tsx`, `app-sidebar.tsx`, `toggle-group.tsx`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `AuthRedirect`, `Illuminate\Foundation\Http\FormRequest`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `UpJurusan`, `User.php`, `UpJurusanConsignment`, `OrderLivenessService`, `Illuminate\Http\Request`, `Illuminate\Database\Eloquent\Model`, `CheckoutController`, `UpJurusanStockMovement`, `AdminDashboardController`, `ProductCatalogSeeder`, `HandleInertiaRequests`, `SchoolClass`, `Illuminate\Console\Command`, `ProductFactory`, `CreateNewUser.php`, `TransactionCode`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Illuminate\Http\Request`, `Illuminate\Database\Eloquent\Model`, `SellerProductController`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `CheckoutController`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `OrderItem`, `UpJurusan`, `UpJurusanStockMovement`, `User.php`, `AdminDashboardController`, `ProductCatalogSeeder`, `BuyerProductDetailController`, `User`, `HandleInertiaRequests`, `CartController`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `User` (e.g. with `.handle()` and `.activities()`) actually correct?**
  _`User` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _451 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `badge.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._