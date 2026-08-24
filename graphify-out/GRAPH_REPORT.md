# Graph Report - project-ecommerce-sekolah  (2026-08-24)

## Corpus Check
- 436 files · ~165,740 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2364 nodes · 6002 edges · 211 communities (138 shown, 73 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 307 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8c4a8e6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- card.tsx
- cn
- picket/dashboard.tsx
- Notification
- inventory/index.tsx
- FortifyServiceProvider.php
- auth-simple-layout.tsx
- moderation.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- Product.php
- Inertia\Response
- EduCart Design System
- User
- EventServiceProvider.php
- User.php
- devDependencies
- sidebar.tsx
- UpJurusanConsignment
- dropdown-menu.tsx
- UpJurusanStockMovement
- two-factor-setup-modal.tsx
- index.ts
- app-sidebar.tsx
- app-header.tsx
- ReportAggregationService
- SellerProductController
- dependencies
- OrderLivenessService
- NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅
- components.json
- orders.tsx
- server.sh
- PendingOrderCreated
- compilerOptions
- web.php
- OrderStatus
- Closure
- Notifications/index.tsx
- seller/orders/show.tsx
- reports/index.tsx
- Position.php
- composer.json
- scripts
- scripts
- ProductPendingModeration
- optionalDependencies
- Major
- AdminDashboardController
- require-dev
- setup
- CreateNewUser.php
- Illuminate\Foundation\Http\FormRequest
- seller/dashboard.tsx
- seller/orders/index.tsx
- LowStockDetected
- Production Hardening — Final Pass
- Illuminate\Http\Request
- require
- ci:check
- FortifyServiceProvider
- reports/show.tsx
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SellerApplicationPending
- Illuminate\Console\Command
- EduCart
- catalog/index.tsx
- package.json
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- auth.ts
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
- ResetUserPassword.php
- opencode.json
- .opencode/plugins/graphify.js
- radix-ui
- @radix-ui/react-avatar
- 2026_08_02_000001_add_unique_picket_assignment_to_users.php
- @radix-ui/react-dialog
- Category
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
- UpdateOrderItemStatusRequest
- UpdateInventoryRequest
- Illuminate\Database\Seeder
- Illuminate\Database\Eloquent\Model
- @types/react-dom
- Order
- receiving.tsx
- use-clipboard.ts
- NotificationToast.tsx
- @base-ui/react
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
- app-sidebar-header.tsx
- prettier-plugin-tailwindcss
- @types/node
- typescript-eslint
- class-variance-authority
- TwoFactorAuthenticationRequest

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 153 edges
3. `Product` - 96 edges
4. `Notification` - 68 edges
5. `Button()` - 65 edges
6. `Order` - 62 edges
7. `OrderItem` - 59 edges
8. `UpJurusanConsignment` - 57 edges
9. `EduCart Design System` - 50 edges
10. `UpJurusan` - 48 edges

## Surprising Connections (you probably didn't know these)
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `settlementOrder()` --calls--> `OrderItem`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/OrderItem.php
- `makePaymentItem()` --calls--> `OrderItem`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/OrderItem.php
- `moderationProduct()` --calls--> `Product`  [INFERRED]
  tests/Feature/AdminProductModerationConcurrencyTest.php → app/Models/Product.php
- `moderationTransition()` --calls--> `Product`  [INFERRED]
  tests/Feature/AdminProductModerationConcurrencyTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (211 total, 73 thin omitted)

### Community 0 - "card.tsx"
Cohesion: 0.06
Nodes (69): Props, Badge(), badgeVariants, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+61 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (57): AlertError(), Props, TextLink(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+49 more)

### Community 2 - "picket/dashboard.tsx"
Cohesion: 0.20
Nodes (7): Consignment, DailyReportTransaction, formatRupiah(), formatTime(), PicketDashboard(), PosProduct, Props

### Community 3 - "Notification"
Cohesion: 0.08
Nodes (5): Notification, self, createPendingNotification(), NotificationModelTest, NotificationTest

### Community 4 - "inventory/index.tsx"
Cohesion: 0.07
Nodes (53): Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+45 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.07
Nodes (16): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, PasswordResetResponse, RedirectAsIntended, RegisterResponse, TwoFactorLoginResponse, AuthRedirect (+8 more)

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "moderation.tsx"
Cohesion: 0.14
Nodes (19): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+11 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (3): UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.07
Nodes (13): BuyerCatalogController, BuyerProductDetailController, CartController, CheckoutController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload() (+5 more)

### Community 11 - "OrderItem"
Cohesion: 0.07
Nodes (11): SellerOrderController, OrderItem, OrderItemCancellation, OrderItemFulfillment, OrderPaymentSync, OrderStatusSync, PaymentTransitionService, up() (+3 more)

### Community 12 - "Product.php"
Cohesion: 0.11
Nodes (9): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), CartItem (+1 more)

### Community 13 - "Inertia\Response"
Cohesion: 0.08
Nodes (8): AdminJurusanReportController, AdminSellerApplicationController, PicketUpJurusanConsignmentController, UpJurusanDailyReport, UpJurusanPosSale, UniqueViolationRetry, Inertia\Response, failPosSaleInsertOnAttempts()

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "User"
Cohesion: 0.05
Nodes (19): ExpireUnpaidOrdersCommand, AdminJurusanDashboardController, AdminJurusanUpJurusanController, SellerDashboardController, UpJurusan, User, UpJurusanPolicy, UserPolicy (+11 more)

### Community 16 - "EventServiceProvider.php"
Cohesion: 0.12
Nodes (12): AdminNotificationTriggered, DailyReportSubmitted, OrderItemStatusChanged, OrderPaymentApproved, AdminJurusanConsignmentNotify, AdminJurusanDailyReportNotify, AdminNotificationNotify, PicketOfficerOrderNotify (+4 more)

### Community 17 - "User.php"
Cohesion: 0.10
Nodes (4): label(), options(), SellerApplication, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler (+9 more)

### Community 19 - "sidebar.tsx"
Cohesion: 0.10
Nodes (24): NavUser(), Sidebar(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarMenuAction(), SidebarMenuBadge() (+16 more)

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.12
Nodes (8): AdminJurusanConsignmentController, UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService, up(), createReceivedConsignment(), UpJurusanConsignmentStatus

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.12
Nodes (18): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+10 more)

### Community 22 - "UpJurusanStockMovement"
Cohesion: 0.09
Nodes (4): UpJurusanStockMovement, MoneyCalculationService, payoutFixture(), createOutMovement()

### Community 23 - "two-factor-setup-modal.tsx"
Cohesion: 0.17
Nodes (11): ManageTwoFactor(), Props, TwoFactorRecoveryCodes(), Props, TwoFactorSetupModal(), InputOTP(), InputOTPGroup(), InputOTPSlot() (+3 more)

### Community 24 - "index.ts"
Cohesion: 0.14
Nodes (14): AppContent(), Props, AppShell(), Props, SidebarInset(), SidebarProvider(), Toaster(), AppHeaderLayout() (+6 more)

### Community 25 - "app-sidebar.tsx"
Cohesion: 0.13
Nodes (22): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), SidebarContent(), SidebarFooter(), SidebarGroup() (+14 more)

### Community 26 - "app-header.tsx"
Cohesion: 0.19
Nodes (11): AppHeader(), BuyerNavLink(), getBuyerNavItems(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 27 - "ReportAggregationService"
Cohesion: 0.12
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, @laravel/passkeys, dependencies, clsx, @laravel/passkeys, @radix-ui/react-checkbox, react, sonner (+3 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.12
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "orders.tsx"
Cohesion: 0.20
Nodes (9): formatRupiah(), nextStatus, OrderStatus, PaymentStatus, paymentStatusStyles, PicketOrderItem, PicketOrders(), Props (+1 more)

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "PendingOrderCreated"
Cohesion: 0.18
Nodes (3): PendingOrderCreated, AdminOrderNotify, CreatePendingOrderNotification

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 38 - "OrderStatus"
Cohesion: 0.14
Nodes (11): Collection, Attribute, up(), down(), expandEnumColumn(), up(), down(), expandEnumColumn() (+3 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.09
Nodes (28): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+20 more)

### Community 41 - "seller/orders/show.tsx"
Cohesion: 0.24
Nodes (9): formatRupiah(), nextActionFor(), nextStatus, OrderDetailProps, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrdersShow() (+1 more)

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "Position.php"
Cohesion: 0.19
Nodes (4): Position, SchoolClass, TestingUserSeeder, registrationPayload()

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-update-cmd, pre-package-uninstall, types:check (+10 more)

### Community 46 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+2 more)

### Community 47 - "ProductPendingModeration"
Cohesion: 0.15
Nodes (5): ProductPendingModeration, AdminProductModerationNotify, CreateProductModerationNotification, EventServiceProvider, Illuminate\Foundation\Support\Providers\EventServiceProvider

### Community 48 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 51 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 52 - "setup"
Cohesion: 0.22
Nodes (9): post-root-package-install, setup, bun install, bun run build, composer install, @php artisan key:generate, @php artisan migrate --force --seed, @php artisan storage:link (+1 more)

### Community 53 - "CreateNewUser.php"
Cohesion: 0.27
Nodes (6): CreateNewUser, emailRules(), nameRules(), profileRules(), ProfileUpdateRequest, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 54 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.27
Nodes (3): PasswordUpdateRequest, ProfileDeleteRequest, Illuminate\Foundation\Http\FormRequest

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.11
Nodes (21): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+13 more)

### Community 56 - "seller/orders/index.tsx"
Cohesion: 0.21
Nodes (11): formatDate(), formatRupiah(), nextActionFor(), nextStatus, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrderItem (+3 more)

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.07
Nodes (28): 10. Fase 2 — Integritas data (2026-08-24), 11. Fase 3 — Performa (2026-08-24), 12. Fase 4 — Pra-migrasi PostgreSQL & hardening (2026-08-24), 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1, 4. Audit — Remaining null dereferences, 5. Audit — Remaining unbounded queries (+20 more)

### Community 59 - "Illuminate\Http\Request"
Cohesion: 0.06
Nodes (19): AdminProductController, AdminProductModerationController, AdminUserController, Controller, NotificationController, NotificationPreferencesController, SellerApplicationController, SellerConsignmentController (+11 more)

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 62 - "FortifyServiceProvider"
Cohesion: 0.25
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 63 - "reports/show.tsx"
Cohesion: 0.28
Nodes (7): AdminJurusanReportDetail(), formatDateTime(), formatRupiah(), Props, Report, SummaryProps, Transaction

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

### Community 69 - "catalog/index.tsx"
Cohesion: 0.28
Nodes (8): CatalogCategory, CatalogIndex(), CatalogIndexProps, CatalogPaginator, CatalogProduct, formatRupiah(), imageSource(), PageProps

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
Cohesion: 0.06
Nodes (51): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, PasskeyItem(), PasskeyRegistration(), Props (+43 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.11
Nodes (11): CategoryFactory, OrderFactory, OrderItemFactory, static, ProductFactory, SellerApplicationFactory, UpJurusanConsignmentFactory, UpJurusanFactory (+3 more)

### Community 79 - "auth.ts"
Cohesion: 0.40
Nodes (4): Passkey, TwoFactorSecretKey, TwoFactorSetupData, User

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

### Community 114 - "Category"
Cohesion: 0.12
Nodes (4): Category, moderationProduct(), moderationTransition(), ProductStatus

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

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.36
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 174 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.08
Nodes (9): DomainEvent, UpJurusanPayout, Illuminate\Database\Eloquent\Model, Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, consignmentForkWait(), consignmentRunner(), Closure (+1 more)

### Community 177 - "Order"
Cohesion: 0.16
Nodes (5): AdminOrderController, BuyerOrderController, Order, OrderPolicy, OrderSettlementService

### Community 181 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 203 - "app-sidebar-header.tsx"
Cohesion: 0.15
Nodes (14): AppSidebarHeader(), getSearchConfig(), HeaderNotification, notificationMenuStyle, roleLabels, typeToBorderColors, Avatar(), AvatarBadge() (+6 more)

## Knowledge Gaps
- **502 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+497 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **73 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Notification`, `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `Product.php`, `Inertia\Response`, `EventServiceProvider.php`, `User.php`, `UpJurusanConsignment`, `TransactionCode`, `UpJurusanStockMovement`, `OrderLivenessService`, `PendingOrderCreated`, `web.php`, `Position.php`, `Illuminate\Database\Seeder`, `Illuminate\Database\Eloquent\Model`, `ProductPendingModeration`, `Order`, `AdminDashboardController`, `CreateNewUser.php`, `Illuminate\Http\Request`, `SellerApplicationPending`, `Illuminate\Console\Command`, `Illuminate\Database\Eloquent\Factories\Factory`, `ResetUserPassword.php`, `Category`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `card.tsx`, `inventory/index.tsx`, `auth-simple-layout.tsx`, `moderation.tsx`, `sidebar.tsx`, `dropdown-menu.tsx`, `two-factor-setup-modal.tsx`, `index.ts`, `app-sidebar.tsx`, `app-header.tsx`, `orders.tsx`, `Notifications/index.tsx`, `seller/orders/show.tsx`, `seller/dashboard.tsx`, `seller/orders/index.tsx`, `app-sidebar-header.tsx`, `button.tsx`, `admin-jurusan/dashboard.tsx`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `Notification` connect `Notification` to `SellerApplicationPending`, `Illuminate\Console\Command`, `PendingOrderCreated`, `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `NotificationHrefBackfill`, `Product.php`, `Illuminate\Database\Seeder`, `Illuminate\Database\Eloquent\Model`, `ProductPendingModeration`, `EventServiceProvider.php`, `LowStockDetected`, `Illuminate\Http\Request`, `OrderLivenessService`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 34 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 34 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 21 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _502 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `card.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.060626858842370165 - nodes in this community are weakly interconnected._