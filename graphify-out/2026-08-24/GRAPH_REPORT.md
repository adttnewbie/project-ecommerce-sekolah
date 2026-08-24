# Graph Report - project-ecommerce-sekolah  (2026-08-23)

## Corpus Check
- 428 files · ~160,615 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2318 nodes · 5835 edges · 216 communities (142 shown, 74 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 283 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3092c5cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- categories/index.tsx
- cn
- card.tsx
- Notification
- inventory/index.tsx
- AuthRedirect
- auth-simple-layout.tsx
- confirm.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- PicketUpJurusanConsignmentController
- EduCart Design System
- UpJurusan
- Illuminate\Broadcasting\InteractsWithSockets
- User.php
- devDependencies
- EventServiceProvider.php
- UpJurusanConsignment
- dropdown-menu.tsx
- UpJurusanStockMovement
- User
- index.ts
- sidebar.tsx
- up-jurusan/index.tsx
- ReportAggregationService
- app-header.tsx
- dependencies
- Order
- NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅
- components.json
- UpJurusanDailyReport
- server.sh
- PendingOrderCreated
- compilerOptions
- Inertia\Response
- OrderStatus
- Closure
- Notifications/index.tsx
- PaymentTransitionService
- reports/index.tsx
- CreateNewUser.php
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
- CheckoutController
- LowStockDetected
- Production Hardening — Final Pass
- Illuminate\Http\Request
- require
- ci:check
- SchoolClass
- up-jurusan/consignments/index.tsx
- 2026_08_02_000002_add_financial_history_protection.php
- config
- SellerApplicationPending
- Illuminate\Console\Command
- EduCart
- Unit/ActorLifecycleTest.php
- admin-jurusan/dashboard.tsx
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- button.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- CartController
- post-create-project-cmd
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
- Illuminate\Http\RedirectResponse
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
- AdminProductModerationConcurrencyTest.php
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
- RejectProductRequest
- AGENTS.md
- package.json
- Illuminate\Foundation\Http\FormRequest
- Illuminate\Database\Seeder
- CheckoutController.php
- @types/react-dom
- catalog/show.tsx
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
- UpdateInventoryRequest
- RedirectAsIntended.php
- AppServiceProvider
- NotificationService
- ConsignmentConcurrencyTest.php
- babel-plugin-react-compiler
- class-variance-authority
- @types/node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 137 edges
3. `Product` - 93 edges
4. `Button()` - 65 edges
5. `Notification` - 62 edges
6. `Order` - 60 edges
7. `OrderItem` - 59 edges
8. `UpJurusanConsignment` - 52 edges
9. `EduCart Design System` - 50 edges
10. `UpJurusan` - 44 edges

## Surprising Connections (you probably didn't know these)
- `settlementOrder()` --calls--> `OrderItem`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/OrderItem.php
- `makePaymentItem()` --calls--> `OrderItem`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/OrderItem.php
- `payoutFixture()` --calls--> `Product`  [INFERRED]
  tests/Feature/ConsignmentPayoutTest.php → app/Models/Product.php
- `settlementOrder()` --calls--> `Product`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/Product.php
- `makeConsignment()` --calls--> `Product`  [INFERRED]
  tests/Unit/ConsignmentTransitionServiceTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (216 total, 74 thin omitted)

### Community 0 - "categories/index.tsx"
Cohesion: 0.06
Nodes (59): Badge(), badgeVariants, Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow() (+51 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (54): AlertError(), Props, TextLink(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+46 more)

### Community 2 - "card.tsx"
Cohesion: 0.08
Nodes (31): Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Props, UpJurusan (+23 more)

### Community 3 - "Notification"
Cohesion: 0.07
Nodes (4): Notification, self, NotificationModelTest, NotificationTest

### Community 4 - "inventory/index.tsx"
Cohesion: 0.06
Nodes (55): CardAction(), Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger(), SelectValue() (+47 more)

### Community 5 - "AuthRedirect"
Cohesion: 0.13
Nodes (7): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, AuthRedirect, Laravel\Fortify\Contracts\LoginResponse, Laravel\Fortify\Contracts\PasswordConfirmedResponse, Laravel\Passkeys\Contracts\PasskeyLoginResponse

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "confirm.tsx"
Cohesion: 0.13
Nodes (24): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+16 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.06
Nodes (8): NotificationPreferencesController, CartItem, DomainEvent, NotificationPreference, UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.10
Nodes (7): AdminProductModerationController, ProductStatus, SellerProductController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload()

### Community 11 - "OrderItem"
Cohesion: 0.09
Nodes (7): SellerOrderController, OrderItem, OrderItemCancellation, OrderItemFulfillment, up(), up(), OrderItemStatus

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.10
Nodes (9): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), up() (+1 more)

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.09
Nodes (7): AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, UserPolicy, ActorLifecycle, picketUpJurusanFixture(), makeConsignment()

### Community 16 - "Illuminate\Broadcasting\InteractsWithSockets"
Cohesion: 0.21
Nodes (7): AdminNotificationTriggered, DailyReportSubmitted, OrderItemStatusChanged, AdminNotificationNotify, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Foundation\Events\Dispatchable, Illuminate\Queue\SerializesModels

### Community 17 - "User.php"
Cohesion: 0.10
Nodes (3): label(), options(), SellerApplication

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint-config-prettier, eslint-import-resolver-typescript, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, eslint, eslint-config-prettier (+9 more)

### Community 19 - "EventServiceProvider.php"
Cohesion: 0.12
Nodes (7): OrderPaymentApproved, AdminJurusanConsignmentNotify, AdminJurusanDailyReportNotify, PicketOfficerOrderNotify, PicketOrderPaymentNotify, EventServiceProvider, Illuminate\Foundation\Support\Providers\EventServiceProvider

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.18
Nodes (5): UpJurusanConsignment, ConsignmentTransitionService, DomainEventService, up(), UpJurusanConsignmentStatus

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.09
Nodes (24): NavUser(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+16 more)

### Community 22 - "UpJurusanStockMovement"
Cohesion: 0.10
Nodes (3): UpJurusanStockMovement, MoneyCalculationService, payoutFixture()

### Community 23 - "User"
Cohesion: 0.09
Nodes (11): ExpireUnpaidOrdersCommand, SellerDashboardController, User, OrderPolicy, SystemActor, ProductCatalogSeeder, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable (+3 more)

### Community 24 - "index.ts"
Cohesion: 0.14
Nodes (14): AppContent(), Props, AppShell(), Props, SidebarInset(), SidebarProvider(), Toaster(), AppHeaderLayout() (+6 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.07
Nodes (45): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), Separator(), Sidebar(), SidebarContent() (+37 more)

### Community 26 - "up-jurusan/index.tsx"
Cohesion: 0.09
Nodes (34): HeaderNotification, notificationMenuStyle, roleLabels, typeToBorderColors, Props, Dialog(), DialogClose(), DialogContent() (+26 more)

### Community 27 - "ReportAggregationService"
Cohesion: 0.18
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 28 - "app-header.tsx"
Cohesion: 0.10
Nodes (22): AppHeader(), BuyerNavLink(), getBuyerNavItems(), AppSidebarHeader(), getSearchConfig(), Avatar(), AvatarBadge(), AvatarFallback() (+14 more)

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): @base-ui/react, clsx, @laravel/passkeys, dependencies, @base-ui/react, clsx, @laravel/passkeys, react (+3 more)

### Community 30 - "Order"
Cohesion: 0.09
Nodes (10): BuyerOrderController, Order, OrderLivenessService, OrderSettlementService, OrderStatusSync, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, settlementOrder() (+2 more)

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "UpJurusanDailyReport"
Cohesion: 0.17
Nodes (3): AdminJurusanDashboardController, AdminJurusanReportController, UpJurusanDailyReport

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "PendingOrderCreated"
Cohesion: 0.20
Nodes (3): PendingOrderCreated, AdminOrderNotify, CreatePendingOrderNotification

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "Inertia\Response"
Cohesion: 0.10
Nodes (11): AdminProductController, AdminSellerApplicationController, AdminUserController, BuyerCatalogController, BuyerProductDetailController, Controller, SellerConsignmentController, SellerInventoryController (+3 more)

### Community 38 - "OrderStatus"
Cohesion: 0.14
Nodes (11): Collection, Attribute, up(), down(), expandEnumColumn(), up(), down(), expandEnumColumn() (+3 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.09
Nodes (28): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+20 more)

### Community 41 - "PaymentTransitionService"
Cohesion: 0.26
Nodes (3): OrderPaymentSync, PaymentTransitionService, PaymentStatus

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "CreateNewUser.php"
Cohesion: 0.22
Nodes (4): CreateNewUser, Position, TestingUserSeeder, Laravel\Fortify\Contracts\CreatesNewUsers

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
Cohesion: 0.22
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
Nodes (3): ResetUserPassword, PasswordUpdateRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.08
Nodes (29): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+21 more)

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.18
Nodes (10): 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1, 4. Audit — Remaining null dereferences, 5. Audit — Remaining unbounded queries, 6. Production Checklist, 7. Remaining technical debt, 8. Blocking release (+2 more)

### Community 59 - "Illuminate\Http\Request"
Cohesion: 0.12
Nodes (6): NotificationController, SellerApplicationController, HandleInertiaRequests, NotificationDismissal, Illuminate\Http\Request, Inertia\Middleware

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 63 - "up-jurusan/consignments/index.tsx"
Cohesion: 0.25
Nodes (6): CartItem, DailyReportItem, formatRupiah(), PicketUpJurusanConsignments(), PosProduct, Props

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

### Community 69 - "Unit/ActorLifecycleTest.php"
Cohesion: 0.25
Nodes (3): Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, TestCase

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
Cohesion: 0.08
Nodes (36): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem() (+28 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.11
Nodes (11): CategoryFactory, OrderFactory, OrderItemFactory, static, ProductFactory, SellerApplicationFactory, UpJurusanConsignmentFactory, UpJurusanFactory (+3 more)

### Community 81 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 94 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 106 - "kilo.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js

### Community 107 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.15
Nodes (4): AdminJurusanConsignmentController, AdminOrderController, ProfileController, Illuminate\Http\RedirectResponse

### Community 108 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 114 - "Product.php"
Cohesion: 0.14
Nodes (3): Category, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Foundation\Configuration\Middleware

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

### Community 149 - "9. Layout"
Cohesion: 0.40
Nodes (5): 9. Layout, Breakpoints, Container, Grid produk, Header layout

### Community 150 - "AdminProductModerationConcurrencyTest.php"
Cohesion: 0.50
Nodes (3): moderationProduct(), moderationTransition(), ProductStatus

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

### Community 171 - "package.json"
Cohesion: 0.40
Nodes (4): packageManager, private, $schema, type

### Community 172 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.21
Nodes (5): UpdateOrderItemStatusRequest, ProfileDeleteRequest, TwoFactorAuthenticationRequest, Illuminate\Foundation\Http\FormRequest, Laravel\Fortify\InteractsWithTwoFactorState

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.36
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 177 - "catalog/show.tsx"
Cohesion: 0.32
Nodes (7): CatalogProduct, CatalogShow(), CatalogShowProps, formatRupiah(), imageSource(), PageProps, Auth

### Community 181 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

### Community 186 - "FortifyServiceProvider.php"
Cohesion: 0.12
Nodes (7): PasswordResetResponse, RegisterResponse, TwoFactorLoginResponse, Illuminate\Http\JsonResponse, Laravel\Fortify\Contracts\PasswordResetResponse, Laravel\Fortify\Contracts\RegisterResponse, Laravel\Fortify\Contracts\TwoFactorLoginResponse

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 207 - "ConsignmentConcurrencyTest.php"
Cohesion: 0.60
Nodes (3): consignmentForkWait(), consignmentRunner(), Closure

## Knowledge Gaps
- **487 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+482 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Notification`, `AuthRedirect`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `UpJurusan`, `User.php`, `UpJurusanConsignment`, `UpJurusanStockMovement`, `Order`, `Inertia\Response`, `PaymentTransitionService`, `CreateNewUser.php`, `CheckoutController.php`, `AdminDashboardController`, `PasswordValidationRules.php`, `CheckoutController`, `Illuminate\Http\Request`, `Illuminate\Console\Command`, `Unit/ActorLifecycleTest.php`, `NotificationService`, `Illuminate\Database\Eloquent\Factories\Factory`, `Product.php`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `categories/index.tsx`, `card.tsx`, `inventory/index.tsx`, `auth-simple-layout.tsx`, `confirm.tsx`, `Notifications/index.tsx`, `admin-jurusan/dashboard.tsx`, `button.tsx`, `dropdown-menu.tsx`, `seller/dashboard.tsx`, `index.ts`, `sidebar.tsx`, `up-jurusan/index.tsx`, `app-header.tsx`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Inertia\Response`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `PicketUpJurusanConsignmentController`, `CheckoutController.php`, `CartController`, `UpJurusan`, `NotificationService`, `AdminDashboardController`, `Product.php`, `UpJurusanStockMovement`, `User`, `CheckoutController`, `Illuminate\Http\Request`, `Order`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 24 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 18 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _487 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `categories/index.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056140350877192984 - nodes in this community are weakly interconnected._