# Graph Report - project-ecommerce-sekolah  (2026-08-24)

## Corpus Check
- 434 files · ~163,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2340 nodes · 5894 edges · 216 communities (143 shown, 73 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 291 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `271b55ae`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pages/dashboard.tsx
- cn
- badge.tsx
- Notification
- utils.ts
- AuthRedirect
- auth-simple-layout.tsx
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- PaymentTransitionService
- OrderItemStatus.php
- PicketUpJurusanConsignmentController
- EduCart Design System
- UpJurusan
- EventServiceProvider.php
- User.php
- devDependencies
- EventServiceProvider
- UpJurusanConsignment
- app-sidebar-header.tsx
- UpJurusanStockMovement
- User
- index.ts
- app-sidebar.tsx
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
- sidebar.tsx
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
- PasswordValidationRules.php
- seller/dashboard.tsx
- seller/orders/index.tsx
- LowStockDetected
- Production Hardening — Final Pass
- Illuminate\Http\Request
- require
- ci:check
- FortifyServiceProvider
- SellerOrderController
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SellerApplicationPending
- Illuminate\Console\Command
- EduCart
- two-factor-setup-modal.tsx
- Illuminate\Database\Eloquent\Model
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- ProductCatalogSeeder
- seller/orders/show.tsx
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
- ConsignmentConcurrencyTest.php
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
- alert.tsx
- @inertiajs/react
- NotificationHrefBackfill
- AGENTS.md
- package.json
- Illuminate\Foundation\Http\FormRequest
- Illuminate\Database\Seeder
- UpJurusanConsignmentStatus.php
- @types/react-dom
- Order
- @radix-ui/react-slot
- use-clipboard.ts
- NotificationToast.tsx
- @eslint/js
- eslint-plugin-react
- laravel-vite-plugin
- FortifyServiceProvider.php
- @inertiajs/vite
- @radix-ui/react-navigation-menu
- @radix-ui/react-separator
- seller/consignments/index.tsx
- input-otp
- tw-animate-css
- lucide-react
- @radix-ui/react-checkbox
- @radix-ui/react-collapsible
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-toggle-group
- react-dom
- @playwright/test
- prettier
- prettier-plugin-tailwindcss
- app-header.tsx
- cart/index.tsx
- toggle-group.tsx
- NotificationController
- RedirectAsIntended.php
- class-variance-authority
- TwoFactorAuthenticationRequest
- eslint-import-resolver-typescript
- typescript-eslint

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 142 edges
3. `Product` - 93 edges
4. `Notification` - 67 edges
5. `Button()` - 65 edges
6. `Order` - 61 edges
7. `OrderItem` - 59 edges
8. `UpJurusanConsignment` - 55 edges
9. `EduCart Design System` - 50 edges
10. `UpJurusan` - 45 edges

## Surprising Connections (you probably didn't know these)
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `payoutFixture()` --calls--> `Product`  [INFERRED]
  tests/Feature/ConsignmentPayoutTest.php → app/Models/Product.php
- `settlementOrder()` --calls--> `Product`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/Product.php
- `seedAssignedPicketWithConsignment()` --calls--> `Product`  [INFERRED]
  tests/Feature/PosSaleCodeCollisionTest.php → app/Models/Product.php
- `makeConsignment()` --calls--> `Product`  [INFERRED]
  tests/Unit/ConsignmentTransitionServiceTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (216 total, 73 thin omitted)

### Community 0 - "pages/dashboard.tsx"
Cohesion: 0.05
Nodes (56): Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), AdminJurusanReportDetail(), formatDateTime() (+48 more)

### Community 1 - "cn"
Cohesion: 0.07
Nodes (43): Props, TextLink(), AlertDialogOverlay(), CardFooter(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear() (+35 more)

### Community 2 - "badge.tsx"
Cohesion: 0.05
Nodes (37): Badge(), badgeVariants, AdminJurusanDashboard(), Dashboard, formatRupiah(), formatTime(), Props, statusStyles (+29 more)

### Community 3 - "Notification"
Cohesion: 0.07
Nodes (5): Notification, self, createPendingNotification(), NotificationModelTest, NotificationTest

### Community 4 - "utils.ts"
Cohesion: 0.06
Nodes (72): Props, Props, Card(), CardAction(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+64 more)

### Community 5 - "AuthRedirect"
Cohesion: 0.11
Nodes (10): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, TwoFactorLoginResponse, AuthRedirect, Illuminate\Http\JsonResponse, Laravel\Fortify\Contracts\LoginResponse, Laravel\Fortify\Contracts\PasswordConfirmedResponse (+2 more)

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "categories/index.tsx"
Cohesion: 0.13
Nodes (26): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+18 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (5): NotificationPreferencesController, NotificationPreference, UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.09
Nodes (8): AdminProductModerationController, CheckoutController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload(), Illuminate\Database\QueryException, createCartBuyerWithApprovedProduct()

### Community 11 - "PaymentTransitionService"
Cohesion: 0.20
Nodes (4): OrderPaymentSync, OrderStatusSync, PaymentTransitionService, PaymentStatus

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.10
Nodes (9): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), up() (+1 more)

### Community 13 - "PicketUpJurusanConsignmentController"
Cohesion: 0.15
Nodes (3): PicketUpJurusanConsignmentController, UpJurusanPosSale, failPosSaleInsertOnAttempts()

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.09
Nodes (8): AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, UserPolicy, ActorLifecycle, picketUpJurusanFixture(), seedAssignedPicketWithConsignment(), makeConsignment()

### Community 16 - "EventServiceProvider.php"
Cohesion: 0.17
Nodes (9): AdminNotificationTriggered, DailyReportSubmitted, OrderPaymentApproved, AdminJurusanDailyReportNotify, AdminNotificationNotify, PicketOrderPaymentNotify, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Foundation\Events\Dispatchable (+1 more)

### Community 17 - "User.php"
Cohesion: 0.10
Nodes (3): label(), options(), CartItem

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint-config-prettier, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint (+9 more)

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.10
Nodes (11): OrderItemStatusChanged, AdminJurusanConsignmentController, AdminJurusanConsignmentNotify, PicketOfficerOrderNotify, UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService (+3 more)

### Community 21 - "app-sidebar-header.tsx"
Cohesion: 0.07
Nodes (35): AppSidebarHeader(), getSearchConfig(), HeaderNotification, notificationMenuStyle, roleLabels, typeToBorderColors, Avatar(), AvatarBadge() (+27 more)

### Community 22 - "UpJurusanStockMovement"
Cohesion: 0.11
Nodes (3): UpJurusanStockMovement, MoneyCalculationService, payoutFixture()

### Community 23 - "User"
Cohesion: 0.09
Nodes (13): ExpireUnpaidOrdersCommand, SellerDashboardController, OrderItem, User, OrderItemCancellation, SystemActor, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable (+5 more)

### Community 24 - "index.ts"
Cohesion: 0.15
Nodes (13): AppContent(), Props, AppShell(), Props, Toaster(), AppHeaderLayout(), AppSidebarLayout(), AppLayout() (+5 more)

### Community 25 - "app-sidebar.tsx"
Cohesion: 0.12
Nodes (22): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), Separator(), SidebarContent(), SidebarFooter() (+14 more)

### Community 26 - "Controller"
Cohesion: 0.13
Nodes (8): AdminProductController, AdminSellerApplicationController, BuyerCatalogController, BuyerProductDetailController, Controller, SellerConsignmentController, SellerInventoryController, Illuminate\Foundation\Auth\Access\AuthorizesRequests

### Community 27 - "ReportAggregationService"
Cohesion: 0.18
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): @base-ui/react, clsx, @laravel/passkeys, dependencies, @base-ui/react, clsx, @laravel/passkeys, react (+3 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.13
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "UpJurusanDailyReport"
Cohesion: 0.15
Nodes (4): AdminJurusanDashboardController, AdminJurusanReportController, UpJurusanDailyReport, UniqueViolationRetry

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
Cohesion: 0.16
Nodes (5): AdminUserController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse, Inertia\Response

### Community 38 - "OrderItemStatus"
Cohesion: 0.07
Nodes (16): UpdateOrderItemStatusRequest, OrderItemFulfillment, Collection, Attribute, up(), up(), up(), down() (+8 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.09
Nodes (28): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+20 more)

### Community 41 - "sidebar.tsx"
Cohesion: 0.09
Nodes (28): NavUser(), Sidebar(), SidebarContext, SidebarContextProps, SidebarGroupAction(), SidebarInput(), SidebarInset(), SidebarMenuAction() (+20 more)

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "Position.php"
Cohesion: 0.19
Nodes (3): Position, SchoolClass, TestingUserSeeder

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

### Community 53 - "CreateNewUser.php"
Cohesion: 0.31
Nodes (6): CreateNewUser, emailRules(), nameRules(), profileRules(), ProfileUpdateRequest, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 54 - "PasswordValidationRules.php"
Cohesion: 0.27
Nodes (3): ResetUserPassword, PasswordUpdateRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.11
Nodes (21): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+13 more)

### Community 56 - "seller/orders/index.tsx"
Cohesion: 0.21
Nodes (11): formatDate(), formatRupiah(), nextActionFor(), nextStatus, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrderItem (+3 more)

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.11
Nodes (18): 10. Fase 2 — Integritas data (2026-08-24), 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1, 4. Audit — Remaining null dereferences, 5. Audit — Remaining unbounded queries, 6. Production Checklist, 7. Remaining technical debt (+10 more)

### Community 59 - "Illuminate\Http\Request"
Cohesion: 0.15
Nodes (5): BuyerOrderController, SellerApplicationController, HandleInertiaRequests, Illuminate\Http\Request, Inertia\Middleware

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 62 - "FortifyServiceProvider"
Cohesion: 0.25
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

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

### Community 69 - "two-factor-setup-modal.tsx"
Cohesion: 0.17
Nodes (11): ManageTwoFactor(), Props, TwoFactorRecoveryCodes(), Props, TwoFactorSetupModal(), InputOTP(), InputOTPGroup(), InputOTPSlot() (+3 more)

### Community 70 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.13
Nodes (6): DomainEvent, SellerApplication, CategoryFactory, SellerApplicationFactory, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

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
Nodes (34): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, PasskeyItem(), PasskeyRegistration(), Props (+26 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.11
Nodes (9): OrderFactory, OrderItemFactory, static, ProductFactory, UpJurusanConsignmentFactory, UpJurusanFactory, static, UserFactory (+1 more)

### Community 81 - "seller/orders/show.tsx"
Cohesion: 0.24
Nodes (9): formatRupiah(), nextActionFor(), nextStatus, OrderDetailProps, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrdersShow() (+1 more)

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

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

### Community 149 - "9. Layout"
Cohesion: 0.40
Nodes (5): 9. Layout, Breakpoints, Container, Grid produk, Header layout

### Community 150 - "ConsignmentConcurrencyTest.php"
Cohesion: 0.19
Nodes (6): moderationProduct(), moderationTransition(), ProductStatus, consignmentForkWait(), consignmentRunner(), Closure

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

### Community 165 - "alert.tsx"
Cohesion: 0.39
Nodes (6): AlertError(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants

### Community 171 - "package.json"
Cohesion: 0.40
Nodes (4): packageManager, private, $schema, type

### Community 172 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.18
Nodes (4): RejectProductRequest, UpdateInventoryRequest, ProfileDeleteRequest, Illuminate\Foundation\Http\FormRequest

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.36
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 174 - "UpJurusanConsignmentStatus.php"
Cohesion: 0.09
Nodes (4): UpJurusanPayout, Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, TestCase

### Community 177 - "Order"
Cohesion: 0.19
Nodes (4): AdminOrderController, Order, OrderPolicy, OrderSettlementService

### Community 181 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

### Community 186 - "FortifyServiceProvider.php"
Cohesion: 0.17
Nodes (4): PasswordResetResponse, RegisterResponse, Laravel\Fortify\Contracts\PasswordResetResponse, Laravel\Fortify\Contracts\RegisterResponse

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 203 - "app-header.tsx"
Cohesion: 0.19
Nodes (11): AppHeader(), BuyerNavLink(), getBuyerNavItems(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 204 - "cart/index.tsx"
Cohesion: 0.31
Nodes (6): Checkbox(), CartIndex(), CartIndexProps, CartItem, formatRupiah(), imageSource()

### Community 205 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

## Knowledge Gaps
- **493 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+488 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **73 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Notification`, `AuthRedirect`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `PaymentTransitionService`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `UpJurusan`, `User.php`, `UpJurusanConsignment`, `TransactionCode`, `UpJurusanStockMovement`, `OrderLivenessService`, `PendingOrderCreated`, `Illuminate\Http\RedirectResponse`, `Position.php`, `UpJurusanConsignmentStatus.php`, `Order`, `AdminDashboardController`, `CreateNewUser.php`, `PasswordValidationRules.php`, `Illuminate\Http\Request`, `Illuminate\Console\Command`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Database\Eloquent\Factories\Factory`, `ProductCatalogSeeder`, `Product.php`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `pages/dashboard.tsx`, `badge.tsx`, `utils.ts`, `auth-simple-layout.tsx`, `categories/index.tsx`, `app-sidebar-header.tsx`, `app-sidebar.tsx`, `alert.tsx`, `Notifications/index.tsx`, `sidebar.tsx`, `seller/dashboard.tsx`, `seller/orders/index.tsx`, `two-factor-setup-modal.tsx`, `app-header.tsx`, `cart/index.tsx`, `button.tsx`, `toggle-group.tsx`, `seller/orders/show.tsx`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Illuminate\Http\RedirectResponse`, `Illuminate\Database\Eloquent\Model`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Illuminate\Database\Eloquent\Relations\HasMany`, `CartController`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `UpJurusanConsignmentStatus.php`, `UpJurusan`, `ProductCatalogSeeder`, `AdminDashboardController`, `Product.php`, `UpJurusanStockMovement`, `User`, `Controller`, `Illuminate\Http\Request`, `SellerProductController`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 26 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 26 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 18 INFERRED edges - model-reasoned connections that need verification._
- **Are the 48 inferred relationships involving `Notification` (e.g. with `.handle()` and `.batchMarkAsRead()`) actually correct?**
  _`Notification` has 48 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _493 weakly-connected nodes found - possible documentation gaps or missing edges._