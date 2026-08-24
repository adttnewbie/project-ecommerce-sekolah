# Graph Report - project-ecommerce-sekolah  (2026-08-24)

## Corpus Check
- 455 files · ~170,795 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2446 nodes · 6265 edges · 218 communities (145 shown, 73 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 336 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59f3b0c7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- inventory/index.tsx
- cn
- card.tsx
- NotificationModelTest
- up-jurusan/index.tsx
- FortifyServiceProvider.php
- Notification
- categories/index.tsx
- app-sidebar.tsx
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- auth-simple-layout.tsx
- EduCart Design System
- cart/index.tsx
- Illuminate\Broadcasting\InteractsWithSockets
- UserRole.php
- devDependencies
- Illuminate\Console\Command
- UpJurusanConsignment
- app-sidebar-header.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- seller/products/index.tsx
- index.ts
- sidebar.tsx
- PaymentMethod.php
- ReportAggregationService
- User
- dependencies
- Order
- NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅
- components.json
- Illuminate\Foundation\Testing\RefreshDatabase
- server.sh
- PendingOrderCreated
- compilerOptions
- Inertia\Response
- AdminDashboardController
- Closure
- Notifications/index.tsx
- OrderItemCancelled
- reports/index.tsx
- Position.php
- composer.json
- scripts
- scripts
- ProductPendingModeration
- optionalDependencies
- Major
- SellerDashboardController
- require-dev
- setup
- Langkah implementasi
- up-jurusan/consignments/index.tsx
- seller/dashboard.tsx
- Illuminate\Http\Request
- LowStockDetected
- Production Hardening — Final Pass
- Illuminate\Http\RedirectResponse
- require
- ci:check
- FortifyServiceProvider
- Controller
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SellerApplicationPending
- SellerProductController
- EduCart
- NotificationHrefBackfill
- package.json
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- PasswordResetResponse
- .createNotification
- breadcrumbs.tsx
- eslint.config.js
- icon.tsx
- placeholder-pattern.tsx
- alert.tsx
- 10.1 Button
- toggle-group.tsx
- @fontsource-variable/inter
- globals
- kilo.json
- NotificationDispatch
- opencode.json
- .opencode/plugins/graphify.js
- radix-ui
- @radix-ui/react-avatar
- 2026_08_02_000001_add_unique_picket_assignment_to_users.php
- @radix-ui/react-dialog
- Product.php
- @radix-ui/react-select
- @radix-ui/react-toggle
- concurrently
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
- TransactionCode
- 9. Layout
- Illuminate\Foundation\Http\FormRequest
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
- HandleInertiaRequests
- @inertiajs/react
- CartController
- AGENTS.md
- EventServiceProvider.php
- ProductModerationDecided
- Illuminate\Database\Seeder
- UpJurusanConsignmentStatus.php
- @types/react-dom
- .handle
- PicketUpJurusanConsignmentController
- two-factor-setup-modal.tsx
- NotificationToast.tsx
- Illuminate\Database\Eloquent\Model
- laravel-vite-plugin
- @eslint/js
- eslint-plugin-react
- @radix-ui/react-navigation-menu
- @radix-ui/react-separator
- seller/consignments/index.tsx
- input-otp
- tw-animate-css
- @inertiajs/vite
- lucide-react
- @radix-ui/react-collapsible
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-slot
- @radix-ui/react-toggle-group
- react-dom
- @playwright/test
- prettier
- app-header.tsx
- prettier-plugin-tailwindcss
- babel-plugin-react-compiler
- typescript-eslint
- .handle
- post-create-project-cmd
- OrderPaymentApproved
- admin-jurusan/dashboard.tsx
- BuyerOrderController
- @radix-ui/react-checkbox
- UpJurusanDailyReportTransaction
- class-variance-authority

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 157 edges
3. `Product` - 103 edges
4. `Order` - 66 edges
5. `OrderItem` - 66 edges
6. `Button()` - 65 edges
7. `Notification` - 60 edges
8. `UpJurusanConsignment` - 60 edges
9. `UpJurusan` - 50 edges
10. `EduCart Design System` - 50 edges

## Surprising Connections (you probably didn't know these)
- `buyerWithSentItem()` --calls--> `Order`  [INFERRED]
  tests/Feature/BuyerNotificationTest.php → app/Models/Order.php
- `sellerWithCancellableItem()` --calls--> `Order`  [INFERRED]
  tests/Feature/OrderCancelledNotifyTest.php → app/Models/Order.php
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `sellerWithCancellableItem()` --calls--> `OrderItem`  [INFERRED]
  tests/Feature/OrderCancelledNotifyTest.php → app/Models/OrderItem.php
- `settlementOrder()` --calls--> `OrderItem`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/OrderItem.php

## Import Cycles
- None detected.

## Communities (218 total, 73 thin omitted)

### Community 0 - "inventory/index.tsx"
Cohesion: 0.06
Nodes (52): Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), AdminJurusanReportDetail(), formatDateTime() (+44 more)

### Community 1 - "cn"
Cohesion: 0.07
Nodes (43): Props, TextLink(), CardFooter(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent() (+35 more)

### Community 2 - "card.tsx"
Cohesion: 0.06
Nodes (45): Props, Badge(), badgeVariants, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+37 more)

### Community 4 - "up-jurusan/index.tsx"
Cohesion: 0.06
Nodes (59): Input(), InputProps, Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger() (+51 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.09
Nodes (11): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, RedirectAsIntended, TwoFactorLoginResponse, AuthRedirect, Illuminate\Contracts\Support\Responsable, Laravel\Fortify\Contracts\LoginResponse (+3 more)

### Community 6 - "Notification"
Cohesion: 0.13
Nodes (3): Notification, createPendingNotification(), NotificationTest

### Community 7 - "categories/index.tsx"
Cohesion: 0.12
Nodes (27): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+19 more)

### Community 8 - "app-sidebar.tsx"
Cohesion: 0.16
Nodes (16): AppSidebar(), getMainNavItems(), lightTooltip, Separator(), SidebarContent(), SidebarFooter(), SidebarHeader(), IsCurrentOrParentUrlFn (+8 more)

### Community 9 - "Product"
Cohesion: 0.08
Nodes (11): CheckoutController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload(), ProductCatalogSeeder, buyerWithSentItem(), createCartBuyerWithApprovedProduct() (+3 more)

### Community 11 - "OrderItem"
Cohesion: 0.07
Nodes (11): SellerOrderController, OrderItem, OrderItemCancellation, OrderItemFulfillment, OrderPaymentSync, OrderStatusSync, PaymentTransitionService, up() (+3 more)

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.11
Nodes (8): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), CartItem

### Community 13 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "cart/index.tsx"
Cohesion: 0.27
Nodes (7): CardAction(), Checkbox(), CartIndex(), CartIndexProps, CartItem, formatRupiah(), imageSource()

### Community 16 - "Illuminate\Broadcasting\InteractsWithSockets"
Cohesion: 0.21
Nodes (7): AdminNotificationTriggered, BuyerOrderStateChanged, DailyReportSubmitted, OrderItemsAwaitingVerification, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Foundation\Events\Dispatchable, Illuminate\Queue\SerializesModels

### Community 17 - "UserRole.php"
Cohesion: 0.10
Nodes (5): label(), options(), SellerApplication, SellerApplicationFactory, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint-config-prettier, eslint-import-resolver-typescript, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, eslint, eslint-config-prettier (+9 more)

### Community 19 - "Illuminate\Console\Command"
Cohesion: 0.24
Nodes (5): CreateTestNotifications, DetectStuckOrdersCommand, NotificationsCleanup, Command, Illuminate\Console\Command

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.11
Nodes (9): UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService, up(), createReceivedConsignment(), consignmentProduct(), makeConsignment() (+1 more)

### Community 21 - "app-sidebar-header.tsx"
Cohesion: 0.09
Nodes (29): AppSidebarHeader(), getSearchConfig(), notificationMenuStyle, roleLabels, Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup() (+21 more)

### Community 22 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.04
Nodes (6): UpJurusanDailyReportTransactionItem, UpJurusanStockMovement, MoneyCalculationService, Illuminate\Database\Eloquent\Relations\BelongsTo, payoutFixture(), createOutMovement()

### Community 23 - "seller/products/index.tsx"
Cohesion: 0.15
Nodes (23): DeleteUser(), Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader() (+15 more)

### Community 24 - "index.ts"
Cohesion: 0.16
Nodes (12): AppContent(), Props, AppShell(), Props, Toaster(), AppHeaderLayout(), AppSidebarLayout(), AppLayout() (+4 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.08
Nodes (35): NavFooter(), NavMain(), NavUser(), Sidebar(), SidebarContext, SidebarContextProps, SidebarGroup(), SidebarGroupAction() (+27 more)

### Community 27 - "ReportAggregationService"
Cohesion: 0.10
Nodes (6): AdminJurusanDashboardController, AdminJurusanReportController, UpJurusanDailyReport, Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 28 - "User"
Cohesion: 0.07
Nodes (18): ExpireUnpaidOrdersCommand, AdminJurusanUpJurusanController, UpJurusan, User, UpJurusanPolicy, UserPolicy, ActorLifecycle, SystemActor (+10 more)

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): @base-ui/react, clsx, @laravel/passkeys, dependencies, @base-ui/react, clsx, @laravel/passkeys, react (+3 more)

### Community 30 - "Order"
Cohesion: 0.09
Nodes (7): Order, OrderPolicy, OrderLivenessService, OrderSettlementService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Illuminate\Foundation\Testing\RefreshDatabase"
Cohesion: 0.15
Nodes (4): Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, seedUpManagedCart(), TestCase

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "PendingOrderCreated"
Cohesion: 0.22
Nodes (3): PendingOrderCreated, AdminOrderNotify, CreatePendingOrderNotification

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "Inertia\Response"
Cohesion: 0.14
Nodes (5): AdminProductController, BuyerCatalogController, BuyerProductDetailController, SellerConsignmentController, Inertia\Response

### Community 38 - "AdminDashboardController"
Cohesion: 0.10
Nodes (13): AdminDashboardController, UserRole, Collection, Attribute, up(), down(), expandEnumColumn(), up() (+5 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.07
Nodes (33): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+25 more)

### Community 41 - "OrderItemCancelled"
Cohesion: 0.38
Nodes (3): OrderItemCancelled, BuyerItemCancelledNotify, SellerCancelledOrderNotify

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "Position.php"
Cohesion: 0.16
Nodes (6): CreateNewUser, Position, SchoolClass, TestingUserSeeder, Laravel\Fortify\Contracts\CreatesNewUsers, registrationPayload()

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, lint, lint:check, post-autoload-dump, post-update-cmd, pre-package-uninstall, types:check, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 46 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+2 more)

### Community 47 - "ProductPendingModeration"
Cohesion: 0.20
Nodes (3): ProductPendingModeration, AdminProductModerationNotify, CreateProductModerationNotification

### Community 48 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 51 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 52 - "setup"
Cohesion: 0.22
Nodes (9): post-root-package-install, setup, bun install, bun run build, composer install, @php artisan key:generate, @php artisan migrate --force --seed, @php artisan storage:link (+1 more)

### Community 53 - "Langkah implementasi"
Cohesion: 0.22
Nodes (8): 1. Ekstrak komponen bersama, 2. Refactor app-sidebar-header.tsx, 3. Tambah Bell di app-header.tsx (buyer section, sebelah tombol cart), 4. Verifikasi, Catatan, Diagnosis (terverifikasi), Langkah implementasi, Plan: Perbaiki Bell Notifikasi Buyer (header yang benar)

### Community 54 - "up-jurusan/consignments/index.tsx"
Cohesion: 0.25
Nodes (6): CartItem, DailyReportItem, formatRupiah(), PicketUpJurusanConsignments(), PosProduct, Props

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.11
Nodes (21): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+13 more)

### Community 56 - "Illuminate\Http\Request"
Cohesion: 0.13
Nodes (6): OrderItemStatusChanged, AdminJurusanConsignmentController, NotificationPreferencesController, SellerApplicationController, Illuminate\Http\Request, dispatchItemStatus()

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.05
Nodes (39): 10. Fase 2 — Integritas data (2026-08-24), 11. Fase 3 — Performa (2026-08-24), 12. Fase 4 — Pra-migrasi PostgreSQL & hardening (2026-08-24), 13. Notification hardening — audit 4 peran (2026-08-24), 14. Buyer notifications (2026-08-24), 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1 (+31 more)

### Community 59 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.11
Nodes (6): AdminOrderController, AdminProductModerationController, NotificationController, NotificationDismissal, Illuminate\Http\JsonResponse, Illuminate\Http\RedirectResponse

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 62 - "FortifyServiceProvider"
Cohesion: 0.25
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 63 - "Controller"
Cohesion: 0.11
Nodes (7): AdminSellerApplicationController, AdminUserController, Controller, SellerInventoryController, ProfileController, SecurityController, Illuminate\Foundation\Auth\Access\AuthorizesRequests

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 67 - "SellerProductController"
Cohesion: 0.15
Nodes (4): ProductStatus, SellerProductController, StoreProductRequest, UpdateProductRequest

### Community 68 - "EduCart"
Cohesion: 0.22
Nodes (8): Demo Data, Deployment Checklist, EduCart, Fitur Utama, Production Notes, Quality Checks, Role Pengguna, Setup Local

### Community 70 - "package.json"
Cohesion: 0.40
Nodes (4): packageManager, private, $schema, type

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
Cohesion: 0.09
Nodes (30): Heading(), InputError(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration() (+22 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.12
Nodes (10): CategoryFactory, OrderFactory, OrderItemFactory, static, ProductFactory, UpJurusanConsignmentFactory, UpJurusanFactory, static (+2 more)

### Community 79 - "PasswordResetResponse"
Cohesion: 0.19
Nodes (4): PasswordResetResponse, RegisterResponse, Laravel\Fortify\Contracts\PasswordResetResponse, Laravel\Fortify\Contracts\RegisterResponse

### Community 94 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 101 - "alert.tsx"
Cohesion: 0.48
Nodes (5): Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 103 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 106 - "kilo.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js

### Community 107 - "NotificationDispatch"
Cohesion: 0.12
Nodes (7): AdminJurusanConsignmentNotify, AdminJurusanDailyReportNotify, BuyerOrderStatusNotify, PicketOfficerOrderNotify, PicketVerificationNotify, NotificationPreference, NotificationDispatch

### Community 108 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

### Community 149 - "9. Layout"
Cohesion: 0.40
Nodes (5): 9. Layout, Breakpoints, Container, Grid produk, Header layout

### Community 150 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.05
Nodes (17): ResetUserPassword, emailRules(), nameRules(), profileRules(), AdminCategoryController, RejectProductRequest, SaveCategoryRequest, UpdateInventoryRequest (+9 more)

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

### Community 171 - "EventServiceProvider.php"
Cohesion: 0.12
Nodes (3): EventServiceProvider, Illuminate\Foundation\Support\Providers\EventServiceProvider, roleUser()

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.36
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 174 - "UpJurusanConsignmentStatus.php"
Cohesion: 0.13
Nodes (4): UpJurusanPayout, consignmentForkWait(), consignmentRunner(), Closure

### Community 179 - "PicketUpJurusanConsignmentController"
Cohesion: 0.23
Nodes (4): PicketUpJurusanConsignmentController, UpJurusanPosSale, UniqueViolationRetry, failPosSaleInsertOnAttempts()

### Community 181 - "two-factor-setup-modal.tsx"
Cohesion: 0.14
Nodes (13): AlertError(), Props, TwoFactorSetupModal(), TwoFactorSetupStep(), InputOTP(), InputOTPGroup(), InputOTPSlot(), CopiedValue (+5 more)

### Community 184 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.21
Nodes (5): DomainEvent, Illuminate\Database\Eloquent\Model, moderationProduct(), moderationTransition(), ProductStatus

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 203 - "app-header.tsx"
Cohesion: 0.16
Nodes (13): AppHeader(), BuyerNavLink(), getBuyerNavItems(), HeaderNotificationItem(), typeToBorderColors, Sheet(), SheetContent(), SheetDescription() (+5 more)

### Community 208 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 209 - "OrderPaymentApproved"
Cohesion: 0.33
Nodes (3): OrderPaymentApproved, BuyerPaymentDecidedNotify, SellerPaymentPaidNotify

### Community 212 - "admin-jurusan/dashboard.tsx"
Cohesion: 0.38
Nodes (6): AdminJurusanDashboard(), Dashboard, formatRupiah(), formatTime(), Props, statusStyles

## Knowledge Gaps
- **516 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+511 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **73 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `NotificationModelTest`, `FortifyServiceProvider.php`, `Notification`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `UserRole.php`, `Illuminate\Console\Command`, `UpJurusanConsignment`, `TransactionCode`, `Illuminate\Foundation\Http\FormRequest`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Order`, `Illuminate\Foundation\Testing\RefreshDatabase`, `Inertia\Response`, `AdminDashboardController`, `HandleInertiaRequests`, `Position.php`, `EventServiceProvider.php`, `Illuminate\Database\Seeder`, `UpJurusanConsignmentStatus.php`, `.handle`, `SellerDashboardController`, `PicketUpJurusanConsignmentController`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Http\RedirectResponse`, `Controller`, `Illuminate\Database\Eloquent\Factories\Factory`, `NotificationDispatch`, `Product.php`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `inventory/index.tsx`, `card.tsx`, `up-jurusan/index.tsx`, `categories/index.tsx`, `app-sidebar.tsx`, `auth-simple-layout.tsx`, `cart/index.tsx`, `app-sidebar-header.tsx`, `seller/products/index.tsx`, `sidebar.tsx`, `Notifications/index.tsx`, `two-factor-setup-modal.tsx`, `seller/dashboard.tsx`, `app-header.tsx`, `button.tsx`, `admin-jurusan/dashboard.tsx`, `breadcrumbs.tsx`, `alert.tsx`, `toggle-group.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `UserRole.php`, `UpJurusanConsignment`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `User`, `Order`, `Illuminate\Foundation\Testing\RefreshDatabase`, `Inertia\Response`, `AdminDashboardController`, `HandleInertiaRequests`, `CartController`, `UpJurusanConsignmentStatus.php`, `SellerDashboardController`, `PicketUpJurusanConsignmentController`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Http\Request`, `LowStockDetected`, `Illuminate\Http\RedirectResponse`, `Controller`, `SellerProductController`, `Product.php`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 32 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 32 INFERRED edges - model-reasoned connections that need verification._
- **Are the 24 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 24 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _516 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `inventory/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06101190476190476 - nodes in this community are weakly interconnected._