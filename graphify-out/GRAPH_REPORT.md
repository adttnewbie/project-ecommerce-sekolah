# Graph Report - project-ecommerce-sekolah  (2026-08-24)

## Corpus Check
- 446 files · ~168,691 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2413 nodes · 6156 edges · 224 communities (148 shown, 76 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 325 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `981d7bdc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- badge.tsx
- cn
- picket/dashboard.tsx
- Notification
- inventory/index.tsx
- FortifyServiceProvider.php
- auth-simple-layout.tsx
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- UpJurusanDailyReport
- EduCart Design System
- UpJurusan
- Illuminate\Broadcasting\InteractsWithSockets
- User.php
- devDependencies
- nav-user.tsx
- UpJurusanConsignment
- dropdown-menu.tsx
- UpJurusanStockMovement
- pages/orders/show.tsx
- index.ts
- sidebar.tsx
- app-header.tsx
- ReportAggregationService
- User
- dependencies
- OrderLivenessService
- NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅
- components.json
- Illuminate\Foundation\Testing\RefreshDatabase
- server.sh
- PendingOrderCreated
- compilerOptions
- Inertia\Response
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
- ProfileValidationRules.php
- PasswordValidationRules.php
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
- PasswordResetResponse
- PaymentTransitionService
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
- OrderItemStatusChanged
- opencode.json
- .opencode/plugins/graphify.js
- radix-ui
- @radix-ui/react-avatar
- 2026_08_02_000001_add_unique_picket_assignment_to_users.php
- @radix-ui/react-dialog
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
- Illuminate\Database\Eloquent\Model
- @types/react-dom
- Order
- UpJurusanPosSale
- use-clipboard.ts
- NotificationToast.tsx
- DomainEventServiceTest.php
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
- ProductCatalogSeeder
- typescript-eslint
- BuyerOrderStateChanged
- post-create-project-cmd
- OrderPaymentApproved
- RejectProductRequest
- SaveCategoryRequest
- RedirectAsIntended.php
- @radix-ui/react-checkbox
- CreateNewUser.php
- TwoFactorAuthenticationRequest
- 2026_07_22_000001_expand_order_settlement_statuses.php
- consignmentForkWait
- babel-plugin-react-compiler
- @base-ui/react

## God Nodes (most connected - your core abstractions)
1. `cn()` - 207 edges
2. `User` - 152 edges
3. `Product` - 99 edges
4. `OrderItem` - 65 edges
5. `Button()` - 65 edges
6. `Order` - 64 edges
7. `Notification` - 60 edges
8. `UpJurusanConsignment` - 59 edges
9. `EduCart Design System` - 50 edges
10. `UpJurusan` - 49 edges

## Surprising Connections (you probably didn't know these)
- `buyerWithSentItem()` --calls--> `Order`  [INFERRED]
  tests/Feature/BuyerNotificationTest.php → app/Models/Order.php
- `makePaymentItem()` --calls--> `Order`  [INFERRED]
  tests/Unit/PaymentTransitionServiceTest.php → app/Models/Order.php
- `moderationProduct()` --calls--> `Product`  [INFERRED]
  tests/Feature/AdminProductModerationConcurrencyTest.php → app/Models/Product.php
- `moderationTransition()` --calls--> `Product`  [INFERRED]
  tests/Feature/AdminProductModerationConcurrencyTest.php → app/Models/Product.php
- `buyerWithSentItem()` --calls--> `Product`  [INFERRED]
  tests/Feature/BuyerNotificationTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (224 total, 76 thin omitted)

### Community 0 - "badge.tsx"
Cohesion: 0.05
Nodes (59): Badge(), badgeVariants, Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead() (+51 more)

### Community 1 - "cn"
Cohesion: 0.05
Nodes (61): AlertError(), Props, TextLink(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+53 more)

### Community 2 - "picket/dashboard.tsx"
Cohesion: 0.20
Nodes (7): Consignment, DailyReportTransaction, formatRupiah(), formatTime(), PicketDashboard(), PosProduct, Props

### Community 3 - "Notification"
Cohesion: 0.05
Nodes (12): CreateTestNotifications, DetectStuckOrdersCommand, NotificationsCleanup, Notification, self, NotificationHrefBackfill, Command, up() (+4 more)

### Community 4 - "inventory/index.tsx"
Cohesion: 0.06
Nodes (67): Props, Card(), CardAction(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Select() (+59 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.09
Nodes (11): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, RegisterResponse, TwoFactorLoginResponse, AuthRedirect, Laravel\Fortify\Contracts\LoginResponse, Laravel\Fortify\Contracts\PasswordConfirmedResponse (+3 more)

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "categories/index.tsx"
Cohesion: 0.13
Nodes (26): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+18 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (4): NotificationPreference, UpJurusanDailyReportTransaction, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.08
Nodes (9): AdminProductModerationController, CheckoutController, Product, PreOrderRules, buyerOwnerPayload(), sellerOwnerPayload(), Illuminate\Database\QueryException, createCartBuyerWithApprovedProduct() (+1 more)

### Community 11 - "OrderItem"
Cohesion: 0.07
Nodes (10): SellerOrderController, OrderItem, OrderItemCancellation, OrderItemFulfillment, up(), up(), OrderItemStatus, buyerWithSentItem() (+2 more)

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.09
Nodes (11): next(), nextForPreOrder(), self, values(), fromStorage(), self, values(), CartItem (+3 more)

### Community 13 - "UpJurusanDailyReport"
Cohesion: 0.19
Nodes (3): AdminJurusanDashboardController, AdminJurusanReportController, UpJurusanDailyReport

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.09
Nodes (9): AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, ActorLifecycle, createConsignmentedProduct(), seedAggregateActors(), picketUpJurusanFixture(), seedAssignedPicketWithConsignment() (+1 more)

### Community 16 - "Illuminate\Broadcasting\InteractsWithSockets"
Cohesion: 0.37
Nodes (4): DailyReportSubmitted, Illuminate\Broadcasting\InteractsWithSockets, Illuminate\Foundation\Events\Dispatchable, Illuminate\Queue\SerializesModels

### Community 17 - "User.php"
Cohesion: 0.09
Nodes (6): label(), options(), Category, SellerApplication, SellerApplicationFactory, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint-config-prettier, eslint-import-resolver-typescript, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, eslint, eslint-config-prettier (+9 more)

### Community 19 - "nav-user.tsx"
Cohesion: 0.21
Nodes (12): NavUser(), DropdownMenu(), DropdownMenuContent(), DropdownMenuTrigger(), SidebarMenuButton(), sidebarMenuButtonVariants, SidebarRail(), SidebarTrigger() (+4 more)

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.17
Nodes (6): UpJurusanConsignment, ConsignmentTransitionService, DomainEventService, up(), createReceivedConsignment(), UpJurusanConsignmentStatus

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.14
Nodes (13): DropdownMenuCheckboxItem(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+5 more)

### Community 22 - "UpJurusanStockMovement"
Cohesion: 0.09
Nodes (4): UpJurusanStockMovement, MoneyCalculationService, payoutFixture(), createOutMovement()

### Community 23 - "pages/orders/show.tsx"
Cohesion: 0.08
Nodes (34): DeleteUser(), Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), Props (+26 more)

### Community 24 - "index.ts"
Cohesion: 0.13
Nodes (15): AppContent(), Props, AppShell(), Props, SidebarInset(), SidebarProvider(), Toaster(), AppHeaderLayout() (+7 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.08
Nodes (37): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), Sidebar(), SidebarContent(), SidebarContext (+29 more)

### Community 26 - "app-header.tsx"
Cohesion: 0.19
Nodes (11): AppHeader(), BuyerNavLink(), getBuyerNavItems(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 27 - "ReportAggregationService"
Cohesion: 0.12
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 28 - "User"
Cohesion: 0.10
Nodes (11): ExpireUnpaidOrdersCommand, SellerDashboardController, User, UserPolicy, ConsignmentPayoutService, SystemActor, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable (+3 more)

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, clsx, @laravel/passkeys, dependencies, class-variance-authority, clsx, @laravel/passkeys, react (+3 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.12
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "NOTIFICATION SYSTEM - IMPLEMENTATION COMPLETE ✅"
Cohesion: 0.12
Nodes (15): 1. **Backend - Event & Listener Architecture**, 2. **Middleware - HandleInertiaRequests.php**, 3. **Frontend - app-sidebar-header.tsx**, 4. **Routes - web.php**, Changes Made, Current Status, New Events Created:, New Listeners Created: (+7 more)

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Illuminate\Foundation\Testing\RefreshDatabase"
Cohesion: 0.22
Nodes (3): Illuminate\Foundation\Testing\RefreshDatabase, Illuminate\Foundation\Testing\TestCase, TestCase

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
Cohesion: 0.12
Nodes (6): AdminSellerApplicationController, AdminUserController, BuyerCatalogController, BuyerProductDetailController, SellerConsignmentController, Inertia\Response

### Community 38 - "OrderStatus"
Cohesion: 0.16
Nodes (8): Collection, Attribute, up(), down(), expandEnumColumn(), up(), Illuminate\Database\Eloquent\Casts\Attribute, OrderStatus

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "Notifications/index.tsx"
Cohesion: 0.07
Nodes (33): NotificationBadge(), NotificationBadgeProps, NotificationEmptyState(), NotificationEmptyStateProps, NotificationFilterBar(), NotificationGroup(), NotificationItem(), NotificationItemProps (+25 more)

### Community 41 - "seller/orders/show.tsx"
Cohesion: 0.24
Nodes (9): formatRupiah(), nextActionFor(), nextStatus, OrderDetailProps, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrdersShow() (+1 more)

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "Position.php"
Cohesion: 0.21
Nodes (4): Position, SchoolClass, TestingUserSeeder, registrationPayload()

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
Nodes (3): ResetUserPassword, ProfileDeleteRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 55 - "seller/dashboard.tsx"
Cohesion: 0.08
Nodes (29): ChartConfig, ChartContainer(), ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION (+21 more)

### Community 56 - "Illuminate\Http\Request"
Cohesion: 0.17
Nodes (4): AdminJurusanConsignmentController, NotificationPreferencesController, PicketUpJurusanConsignmentController, Illuminate\Http\Request

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.05
Nodes (37): 10. Fase 2 — Integritas data (2026-08-24), 11. Fase 3 — Performa (2026-08-24), 12. Fase 4 — Pra-migrasi PostgreSQL & hardening (2026-08-24), 13. Notification hardening — audit 4 peran (2026-08-24), 14. Buyer notifications (2026-08-24), 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1 (+29 more)

### Community 59 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.11
Nodes (6): NotificationController, SellerApplicationController, ProfileController, NotificationDismissal, Illuminate\Http\JsonResponse, Illuminate\Http\RedirectResponse

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
Cohesion: 0.15
Nodes (6): AdminProductController, BuyerOrderController, Controller, SellerInventoryController, SecurityController, Illuminate\Foundation\Auth\Access\AuthorizesRequests

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

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
Cohesion: 0.07
Nodes (39): InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Button(), buttonVariants, Input() (+31 more)

### Community 78 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.10
Nodes (10): CategoryFactory, OrderFactory, OrderItemFactory, static, ProductFactory, UpJurusanConsignmentFactory, UpJurusanFactory, static (+2 more)

### Community 81 - "PaymentTransitionService"
Cohesion: 0.30
Nodes (4): OrderPaymentSync, OrderStatusSync, PaymentTransitionService, PaymentStatus

### Community 94 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (7): Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 106 - "kilo.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js

### Community 107 - "OrderItemStatusChanged"
Cohesion: 0.18
Nodes (7): OrderItemStatusChanged, AdminJurusanConsignmentNotify, AdminJurusanDailyReportNotify, BuyerOrderStatusNotify, PicketOfficerOrderNotify, NotificationDispatch, dispatchItemStatus()

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
Cohesion: 0.18
Nodes (4): UpdateInventoryRequest, UpdateOrderItemStatusRequest, PasswordUpdateRequest, Illuminate\Foundation\Http\FormRequest

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
Cohesion: 0.24
Nodes (4): AdminNotificationTriggered, AdminNotificationNotify, EventServiceProvider, Illuminate\Foundation\Support\Providers\EventServiceProvider

### Community 173 - "Illuminate\Database\Seeder"
Cohesion: 0.36
Nodes (4): DatabaseSeeder, TestNotificationSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 174 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.10
Nodes (3): UpJurusanPayout, Illuminate\Database\Eloquent\Model, roleUser()

### Community 177 - "Order"
Cohesion: 0.19
Nodes (4): AdminOrderController, Order, OrderPolicy, OrderSettlementService

### Community 181 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

### Community 184 - "DomainEventServiceTest.php"
Cohesion: 0.27
Nodes (4): DomainEvent, moderationProduct(), moderationTransition(), ProductStatus

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

### Community 203 - "app-sidebar-header.tsx"
Cohesion: 0.15
Nodes (15): AppSidebarHeader(), getSearchConfig(), HeaderNotification, notificationMenuStyle, roleLabels, typeToBorderColors, Avatar(), AvatarBadge() (+7 more)

### Community 208 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 209 - "OrderPaymentApproved"
Cohesion: 0.32
Nodes (3): OrderPaymentApproved, BuyerPaymentDecidedNotify, SellerPaymentPaidNotify

### Community 219 - "2026_07_22_000001_expand_order_settlement_statuses.php"
Cohesion: 0.83
Nodes (3): down(), expandEnumColumn(), up()

### Community 221 - "consignmentForkWait"
Cohesion: 1.00
Nodes (3): consignmentForkWait(), consignmentRunner(), Closure

## Knowledge Gaps
- **509 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+504 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **76 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `Notification`, `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `UpJurusan`, `User.php`, `UpJurusanConsignment`, `TransactionCode`, `UpJurusanStockMovement`, `OrderLivenessService`, `Illuminate\Foundation\Testing\RefreshDatabase`, `Inertia\Response`, `HandleInertiaRequests`, `EventServiceProvider.php`, `Position.php`, `Illuminate\Database\Seeder`, `Illuminate\Database\Eloquent\Model`, `Order`, `AdminDashboardController`, `UpJurusanPosSale`, `PasswordValidationRules.php`, `DomainEventServiceTest.php`, `ProductCatalogSeeder`, `Illuminate\Database\Eloquent\Factories\Factory`, `PaymentTransitionService`, `CreateNewUser.php`, `OrderItemStatusChanged`, `Product.php`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `badge.tsx`, `inventory/index.tsx`, `auth-simple-layout.tsx`, `categories/index.tsx`, `Notifications/index.tsx`, `seller/orders/show.tsx`, `app-sidebar-header.tsx`, `button.tsx`, `nav-user.tsx`, `pages/orders/show.tsx`, `dropdown-menu.tsx`, `seller/dashboard.tsx`, `index.ts`, `sidebar.tsx`, `app-header.tsx`, `breadcrumbs.tsx`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `UpJurusan`, `User.php`, `UpJurusanConsignment`, `UpJurusanStockMovement`, `User`, `OrderLivenessService`, `Inertia\Response`, `HandleInertiaRequests`, `CartController`, `Illuminate\Database\Eloquent\Model`, `AdminDashboardController`, `UpJurusanPosSale`, `Illuminate\Http\Request`, `LowStockDetected`, `DomainEventServiceTest.php`, `Controller`, `SellerProductController`, `ProductCatalogSeeder`, `Product.php`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 30 inferred relationships involving `User` (e.g. with `.handle()` and `.handle()`) actually correct?**
  _`User` has 30 INFERRED edges - model-reasoned connections that need verification._
- **Are the 23 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 23 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _509 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `badge.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054414414414414414 - nodes in this community are weakly interconnected._