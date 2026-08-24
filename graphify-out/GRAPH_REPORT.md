# Graph Report - project-ecommerce-sekolah  (2026-08-24)

## Corpus Check
- 435 files · ~164,608 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2354 nodes · 5929 edges · 202 communities (139 shown, 63 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 293 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7238f68d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pages/orders/show.tsx
- cn
- card.tsx
- Notification
- utils.ts
- FortifyServiceProvider.php
- auth-simple-layout.tsx
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- PicketUpJurusanConsignmentController
- EduCart Design System
- UpJurusan
- Illuminate\Broadcasting\InteractsWithSockets
- UserRole.php
- devDependencies
- EventServiceProvider.php
- UpJurusanConsignment
- dropdown-menu.tsx
- UpJurusanStockMovement
- User
- index.ts
- sidebar.tsx
- Controller
- ReportAggregationService
- SellerProductController
- dependencies
- OrderLivenessService
- NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅
- components.json
- UpJurusanDailyReport
- server.sh
- PendingOrderCreated
- compilerOptions
- Illuminate\Http\RedirectResponse
- OrderItemStatus
- Closure
- Notifications/index.tsx
- Unit/ActorLifecycleTest.php
- reports/index.tsx
- SchoolClass
- composer.json
- scripts
- scripts
- ProductPendingModeration
- optionalDependencies
- Major
- AdminDashboardController
- require-dev
- setup
- ProfileValidationRules.php
- PasswordValidationRules.php
- seller/dashboard.tsx
- seller/orders/index.tsx
- LowStockDetected
- Production Hardening — Final Pass
- Illuminate\Http\Request
- require
- ci:check
- AppServiceProvider
- BuyerOrderController
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SellerApplicationPending
- Illuminate\Console\Command
- EduCart
- up-jurusan/consignments/index.tsx
- SellerApplication
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- ProductCatalogSeeder
- admin-jurusan/dashboard.tsx
- breadcrumbs.tsx
- eslint.config.js
- icon.tsx
- placeholder-pattern.tsx
- AdminCategoryController
- 10.1 Button
- StoreProductRequest
- @fontsource-variable/inter
- globals
- kilo.json
- CartController
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
- RejectProductRequest
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
- SaveCategoryRequest
- @inertiajs/react
- NotificationHrefBackfill
- AGENTS.md
- CreateNewUser.php
- Illuminate\Foundation\Http\FormRequest
- Illuminate\Database\Seeder
- UpJurusanConsignmentStatus.php
- @types/react-dom
- Order
- post-create-project-cmd
- use-clipboard.ts
- NotificationToast.tsx
- 2026_06_25_000001_create_up_jurusan_tables.php
- clsx
- laravel-vite-plugin
- react
- sonner
- @radix-ui/react-navigation-menu
- @radix-ui/react-separator
- seller/consignments/index.tsx
- input-otp
- tw-animate-css
- app-header.tsx
- cart/index.tsx
- toggle-group.tsx
- NotificationController
- class-variance-authority
- TwoFactorAuthenticationRequest

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 145 edges
3. `Product` - 94 edges
4. `Notification` - 67 edges
5. `Button()` - 65 edges
6. `Order` - 61 edges
7. `OrderItem` - 59 edges
8. `UpJurusanConsignment` - 57 edges
9. `EduCart Design System` - 50 edges
10. `UpJurusan` - 48 edges

## Surprising Connections (you probably didn't know these)
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `payoutFixture()` --calls--> `Product`  [INFERRED]
  tests/Feature/ConsignmentPayoutTest.php → app/Models/Product.php
- `createConsignmentedProduct()` --calls--> `Product`  [INFERRED]
  tests/Feature/MoneyAggregateMapTest.php → app/Models/Product.php
- `settlementOrder()` --calls--> `Product`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/Product.php
- `seedAssignedPicketWithConsignment()` --calls--> `Product`  [INFERRED]
  tests/Feature/PosSaleCodeCollisionTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (202 total, 63 thin omitted)

### Community 0 - "pages/orders/show.tsx"
Cohesion: 0.05
Nodes (66): Badge(), badgeVariants, Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow() (+58 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (49): AlertError(), Props, TextLink(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+41 more)

### Community 2 - "card.tsx"
Cohesion: 0.07
Nodes (36): Props, TwoFactorRecoveryCodes(), Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Props (+28 more)

### Community 3 - "Notification"
Cohesion: 0.07
Nodes (5): Notification, self, createPendingNotification(), NotificationModelTest, NotificationTest

### Community 4 - "utils.ts"
Cohesion: 0.06
Nodes (64): HeaderNotification, notificationMenuStyle, roleLabels, typeToBorderColors, Props, Dialog(), DialogClose(), DialogContent() (+56 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.07
Nodes (16): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, PasswordResetResponse, RedirectAsIntended, RegisterResponse, TwoFactorLoginResponse, AuthRedirect (+8 more)

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "categories/index.tsx"
Cohesion: 0.12
Nodes (27): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+19 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.06
Nodes (6): DomainEvent, NotificationPreference, UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.10
Nodes (8): AdminProductModerationController, CheckoutController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload(), Illuminate\Database\QueryException, createCartBuyerWithApprovedProduct()

### Community 11 - "OrderItem"
Cohesion: 0.10
Nodes (8): SellerOrderController, OrderItem, OrderItemCancellation, OrderPaymentSync, PaymentTransitionService, PaymentStatus, settlementOrder(), makePaymentItem()

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.10
Nodes (10): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), CartItem (+2 more)

### Community 13 - "PicketUpJurusanConsignmentController"
Cohesion: 0.15
Nodes (4): PicketUpJurusanConsignmentController, UpJurusanPosSale, UniqueViolationRetry, failPosSaleInsertOnAttempts()

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.12
Nodes (5): AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, ActorLifecycle, picketUpJurusanFixture()

### Community 16 - "Illuminate\Broadcasting\InteractsWithSockets"
Cohesion: 0.16
Nodes (9): AdminNotificationTriggered, DailyReportSubmitted, OrderPaymentApproved, AdminJurusanDailyReportNotify, AdminNotificationNotify, PicketOrderPaymentNotify, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Foundation\Events\Dispatchable (+1 more)

### Community 18 - "devDependencies"
Cohesion: 0.06
Nodes (31): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, @eslint/js, eslint-plugin-import, eslint-plugin-react, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder (+23 more)

### Community 19 - "EventServiceProvider.php"
Cohesion: 0.21
Nodes (5): OrderItemStatusChanged, AdminJurusanConsignmentNotify, PicketOfficerOrderNotify, EventServiceProvider, Illuminate\Foundation\Support\Providers\EventServiceProvider

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.13
Nodes (10): AdminJurusanConsignmentController, UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService, createReceivedConsignment(), createConsignmentedProduct(), seedAssignedPicketWithConsignment() (+2 more)

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): NavUser(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+12 more)

### Community 22 - "UpJurusanStockMovement"
Cohesion: 0.08
Nodes (4): UpJurusanStockMovement, MoneyCalculationService, payoutFixture(), createOutMovement()

### Community 23 - "User"
Cohesion: 0.11
Nodes (11): ExpireUnpaidOrdersCommand, SellerDashboardController, User, UserPolicy, SystemActor, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser (+3 more)

### Community 24 - "index.ts"
Cohesion: 0.13
Nodes (15): AppContent(), Props, AppShell(), Props, SidebarInset(), SidebarProvider(), Toaster(), AppHeaderLayout() (+7 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.07
Nodes (44): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), Separator(), Sidebar(), SidebarContent() (+36 more)

### Community 26 - "Controller"
Cohesion: 0.15
Nodes (7): AdminProductController, BuyerCatalogController, BuyerProductDetailController, Controller, SellerConsignmentController, SellerInventoryController, Illuminate\Foundation\Auth\Access\AuthorizesRequests

### Community 27 - "ReportAggregationService"
Cohesion: 0.14
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 29 - "dependencies"
Cohesion: 0.09
Nodes (23): @base-ui/react, @inertiajs/vite, @laravel/passkeys, lucide-react, dependencies, @base-ui/react, @inertiajs/vite, @laravel/passkeys (+15 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.16
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "UpJurusanDailyReport"
Cohesion: 0.19
Nodes (3): AdminJurusanDashboardController, AdminJurusanReportController, UpJurusanDailyReport

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "PendingOrderCreated"
Cohesion: 0.14
Nodes (3): PendingOrderCreated, AdminOrderNotify, CreatePendingOrderNotification

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.15
Nodes (5): AdminUserController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse, Inertia\Response

### Community 38 - "OrderItemStatus"
Cohesion: 0.08
Nodes (15): OrderItemFulfillment, Collection, Attribute, up(), up(), up(), down(), expandEnumColumn() (+7 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.07
Nodes (33): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+25 more)

### Community 41 - "Unit/ActorLifecycleTest.php"
Cohesion: 0.24
Nodes (3): Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, TestCase

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "SchoolClass"
Cohesion: 0.18
Nodes (4): Position, SchoolClass, FortifyServiceProvider, TestingUserSeeder

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, lint, lint:check, post-autoload-dump, post-update-cmd, pre-package-uninstall, types:check, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 46 - "scripts"
Cohesion: 0.13
Nodes (14): packageManager, private, $schema, scripts, build, build:ssr, dev, format (+6 more)

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

### Community 53 - "ProfileValidationRules.php"
Cohesion: 0.43
Nodes (4): emailRules(), nameRules(), profileRules(), ProfileUpdateRequest

### Community 54 - "PasswordValidationRules.php"
Cohesion: 0.27
Nodes (3): ResetUserPassword, ProfileDeleteRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.11
Nodes (21): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+13 more)

### Community 56 - "seller/orders/index.tsx"
Cohesion: 0.21
Nodes (11): formatDate(), formatRupiah(), nextActionFor(), nextStatus, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrderItem (+3 more)

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.08
Nodes (23): 10. Fase 2 — Integritas data (2026-08-24), 11. Fase 3 — Performa (2026-08-24), 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1, 4. Audit — Remaining null dereferences, 5. Audit — Remaining unbounded queries, 6. Production Checklist (+15 more)

### Community 59 - "Illuminate\Http\Request"
Cohesion: 0.13
Nodes (5): AdminOrderController, NotificationPreferencesController, HandleInertiaRequests, Illuminate\Http\Request, Inertia\Middleware

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 67 - "Illuminate\Console\Command"
Cohesion: 0.24
Nodes (5): CreateTestNotifications, DetectStuckOrdersCommand, NotificationsCleanup, Command, Illuminate\Console\Command

### Community 68 - "EduCart"
Cohesion: 0.22
Nodes (8): Demo Data, Deployment Checklist, EduCart, Fitur Utama, Production Notes, Quality Checks, Role Pengguna, Setup Local

### Community 69 - "up-jurusan/consignments/index.tsx"
Cohesion: 0.25
Nodes (6): CartItem, DailyReportItem, formatRupiah(), PicketUpJurusanConsignments(), PosProduct, Props

### Community 70 - "SellerApplication"
Cohesion: 0.31
Nodes (3): AdminSellerApplicationController, SellerApplicationController, SellerApplication

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
Cohesion: 0.07
Nodes (43): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem() (+35 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.09
Nodes (11): CategoryFactory, OrderFactory, OrderItemFactory, static, ProductFactory, SellerApplicationFactory, UpJurusanConsignmentFactory, UpJurusanFactory (+3 more)

### Community 81 - "admin-jurusan/dashboard.tsx"
Cohesion: 0.38
Nodes (6): AdminJurusanDashboard(), Dashboard, formatRupiah(), formatTime(), Props, statusStyles

### Community 94 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 106 - "kilo.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js

### Community 108 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 114 - "Product.php"
Cohesion: 0.11
Nodes (5): Category, Illuminate\Foundation\Configuration\Middleware, moderationProduct(), moderationTransition(), ProductStatus

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

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

### Community 172 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.18
Nodes (4): UpdateInventoryRequest, UpdateOrderItemStatusRequest, PasswordUpdateRequest, Illuminate\Foundation\Http\FormRequest

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.24
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 174 - "UpJurusanConsignmentStatus.php"
Cohesion: 0.11
Nodes (5): UpJurusanPayout, Illuminate\Database\Eloquent\Factories\HasFactory, consignmentForkWait(), consignmentRunner(), Closure

### Community 177 - "Order"
Cohesion: 0.21
Nodes (3): Order, OrderPolicy, OrderSettlementService

### Community 179 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 181 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 203 - "app-header.tsx"
Cohesion: 0.10
Nodes (22): AppHeader(), BuyerNavLink(), getBuyerNavItems(), AppSidebarHeader(), getSearchConfig(), Avatar(), AvatarBadge(), AvatarFallback() (+14 more)

### Community 204 - "cart/index.tsx"
Cohesion: 0.27
Nodes (7): CardAction(), Checkbox(), CartIndex(), CartIndexProps, CartItem, formatRupiah(), imageSource()

### Community 205 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

## Knowledge Gaps
- **498 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+493 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **63 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Notification`, `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `UpJurusan`, `UserRole.php`, `UpJurusanConsignment`, `TransactionCode`, `UpJurusanStockMovement`, `OrderLivenessService`, `PendingOrderCreated`, `Illuminate\Http\RedirectResponse`, `Unit/ActorLifecycleTest.php`, `CreateNewUser.php`, `SchoolClass`, `UpJurusanConsignmentStatus.php`, `Order`, `AdminDashboardController`, `PasswordValidationRules.php`, `Illuminate\Http\Request`, `Illuminate\Console\Command`, `Illuminate\Database\Eloquent\Factories\Factory`, `ProductCatalogSeeder`, `Product.php`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `pages/orders/show.tsx`, `card.tsx`, `utils.ts`, `auth-simple-layout.tsx`, `categories/index.tsx`, `Notifications/index.tsx`, `app-header.tsx`, `cart/index.tsx`, `button.tsx`, `toggle-group.tsx`, `admin-jurusan/dashboard.tsx`, `dropdown-menu.tsx`, `seller/dashboard.tsx`, `index.ts`, `sidebar.tsx`, `seller/orders/index.tsx`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Notification` connect `Notification` to `SellerApplicationPending`, `Illuminate\Console\Command`, `PendingOrderCreated`, `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `NotificationHrefBackfill`, `OrderItemStatus.php`, `Illuminate\Database\Seeder`, `NotificationController`, `ProductPendingModeration`, `Illuminate\Broadcasting\InteractsWithSockets`, `EventServiceProvider.php`, `LowStockDetected`, `Illuminate\Http\Request`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 19 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 19 INFERRED edges - model-reasoned connections that need verification._
- **Are the 48 inferred relationships involving `Notification` (e.g. with `.handle()` and `.batchMarkAsRead()`) actually correct?**
  _`Notification` has 48 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _498 weakly-connected nodes found - possible documentation gaps or missing edges._