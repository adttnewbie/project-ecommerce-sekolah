# Graph Report - project-ecommerce-sekolah  (2026-08-02)

## Corpus Check
- 375 files · ~143,601 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2051 nodes · 5263 edges · 204 communities (130 shown, 74 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 223 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `178ecadb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- badge.tsx
- cn
- card.tsx
- security.tsx
- up-jurusan/index.tsx
- FortifyServiceProvider.php
- PasswordValidationRules.php
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItemStatus
- Product.php
- PicketUpJurusanConsignmentController
- EduCart Design System
- Illuminate\Http\RedirectResponse
- app-header.tsx
- UserRole.php
- devDependencies
- inventory/index.tsx
- UpJurusanConsignment
- app-sidebar-header.tsx
- User
- index.ts
- sidebar.tsx
- Order
- ReportAggregationService
- reports/index.tsx
- dependencies
- OrderLivenessService
- PasswordResetResponse
- components.json
- Illuminate\Http\Request
- server.sh
- Illuminate\Database\Eloquent\Model
- compilerOptions
- seller/orders/index.tsx
- OrderStatus
- Closure
- SellerProductController
- PaymentTransitionService
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
- chart.tsx
- HandleInertiaRequests
- Position.php
- Production Hardening — Final Pass
- CartController
- require
- ci:check
- FortifyServiceProvider
- Illuminate\Foundation\Http\FormRequest
- 2026_08_02_000002_add_financial_history_protection.php
- config
- ProfileValidationRules.php
- ExpireUnpaidOrdersCommand.php
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
- TwoFactorAuthenticationRequest
- eslint.config.js
- icon.tsx
- placeholder-pattern.tsx
- UserFactory
- 10.1 Button
- UpdateInventoryRequest
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
- use-clipboard.ts
- 9. Layout
- SaveCategoryRequest
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
- UpJurusanDailyReportTransaction
- @inertiajs/react
- AGENTS.md
- @inertiajs/vite
- package.json
- UpJurusanConsignmentStatus.php
- @types/react-dom
- prettier
- self
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
- UpdateOrderItemStatusRequest
- fromStorage
- post-autoload-dump
- 2026_06_30_000001_add_payment_fields_to_orders.php
- 2026_07_01_000006_add_payment_fields_to_order_items.php
- eslint-plugin-react-hooks
- @radix-ui/react-checkbox

## God Nodes (most connected - your core abstractions)
1. `cn()` - 201 edges
2. `User` - 126 edges
3. `Product` - 86 edges
4. `Button()` - 62 edges
5. `Order` - 60 edges
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

## Communities (204 total, 74 thin omitted)

### Community 0 - "badge.tsx"
Cohesion: 0.04
Nodes (77): Badge(), badgeVariants, ChartConfig, ChartContainer(), Table(), TableBody(), TableCell(), TableHead() (+69 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (48): Props, TextLink(), CardFooter(), ComboboxChip(), ComboboxChips(), ComboboxChipsInput(), ComboboxClear(), ComboboxContent() (+40 more)

### Community 2 - "card.tsx"
Cohesion: 0.07
Nodes (34): Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle(), Props, UpJurusan (+26 more)

### Community 3 - "security.tsx"
Cohesion: 0.11
Nodes (19): Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration(), TwoFactorRecoveryCodes() (+11 more)

### Community 4 - "up-jurusan/index.tsx"
Cohesion: 0.07
Nodes (46): CardAction(), Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger(), SelectValue() (+38 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.09
Nodes (11): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, RedirectAsIntended, TwoFactorLoginResponse, AuthRedirect, Illuminate\Contracts\Support\Responsable, Laravel\Fortify\Contracts\LoginResponse (+3 more)

### Community 6 - "PasswordValidationRules.php"
Cohesion: 0.24
Nodes (3): ResetUserPassword, ProfileDeleteRequest, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 7 - "categories/index.tsx"
Cohesion: 0.12
Nodes (27): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay() (+19 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.07
Nodes (3): DomainEvent, UpJurusanDailyReportTransactionItem, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.12
Nodes (7): AdminProductModerationController, BuyerProductDetailController, Product, PreOrderRules, OrderItemFactory, settlementOrder(), makePaymentItem()

### Community 11 - "OrderItemStatus"
Cohesion: 0.16
Nodes (5): OrderItemFulfillment, OrderStatusSync, up(), up(), OrderItemStatus

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.09
Nodes (9): AdminJurusanDashboardController, AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, UserPolicy, ActorLifecycle, Illuminate\Http\RedirectResponse, picketUpJurusanFixture() (+1 more)

### Community 16 - "app-header.tsx"
Cohesion: 0.19
Nodes (11): AppHeader(), BuyerNavLink(), getBuyerNavItems(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+3 more)

### Community 17 - "UserRole.php"
Cohesion: 0.08
Nodes (9): label(), options(), Category, CategoryFactory, SellerApplicationFactory, UpJurusanConsignmentFactory, UpJurusanFactory, Illuminate\Database\Eloquent\Factories\Factory (+1 more)

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint, eslint-config-prettier, @eslint/js, eslint-plugin-react, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler (+9 more)

### Community 19 - "inventory/index.tsx"
Cohesion: 0.10
Nodes (27): DeleteUser(), Props, Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter() (+19 more)

### Community 20 - "UpJurusanConsignment"
Cohesion: 0.15
Nodes (7): AdminJurusanConsignmentController, UpJurusanConsignment, ConsignmentPayoutService, ConsignmentTransitionService, DomainEventService, up(), UpJurusanConsignmentStatus

### Community 21 - "app-sidebar-header.tsx"
Cohesion: 0.08
Nodes (31): AppSidebarHeader(), getSearchConfig(), HeaderNotification, notificationMenuStyle, roleLabels, Avatar(), AvatarBadge(), AvatarFallback() (+23 more)

### Community 23 - "User"
Cohesion: 0.12
Nodes (9): SellerDashboardController, OrderItem, User, OrderItemCancellation, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable (+1 more)

### Community 24 - "index.ts"
Cohesion: 0.14
Nodes (14): AppContent(), Props, AppShell(), Props, SidebarInset(), SidebarProvider(), Toaster(), AppHeaderLayout() (+6 more)

### Community 25 - "sidebar.tsx"
Cohesion: 0.06
Nodes (49): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), NavUser(), Separator(), Sidebar() (+41 more)

### Community 26 - "Order"
Cohesion: 0.15
Nodes (5): AdminOrderController, BuyerOrderController, Order, OrderPolicy, OrderSettlementService

### Community 27 - "ReportAggregationService"
Cohesion: 0.12
Nodes (4): UpJurusanDailyReport, Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 28 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): clsx, concurrently, @laravel/passkeys, dependencies, clsx, concurrently, @laravel/passkeys, react (+3 more)

### Community 30 - "OrderLivenessService"
Cohesion: 0.14
Nodes (4): OrderLivenessService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "PasswordResetResponse"
Cohesion: 0.19
Nodes (4): PasswordResetResponse, RegisterResponse, Laravel\Fortify\Contracts\PasswordResetResponse, Laravel\Fortify\Contracts\RegisterResponse

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 33 - "Illuminate\Http\Request"
Cohesion: 0.08
Nodes (13): AdminJurusanReportController, AdminProductController, AdminSellerApplicationController, AdminUserController, BuyerCatalogController, Controller, NotificationDismissalController, SellerConsignmentController (+5 more)

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 35 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.16
Nodes (5): SellerApplicationController, CartItem, NotificationDismissal, SellerApplication, Illuminate\Database\Eloquent\Model

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "seller/orders/index.tsx"
Cohesion: 0.21
Nodes (11): formatDate(), formatRupiah(), nextActionFor(), nextStatus, OrderStatus, PaymentStatus, paymentStatusStyles, SellerOrderItem (+3 more)

### Community 38 - "OrderStatus"
Cohesion: 0.14
Nodes (11): Collection, Attribute, up(), down(), expandEnumColumn(), up(), down(), expandEnumColumn() (+3 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "SellerProductController"
Cohesion: 0.24
Nodes (3): SellerProductController, up(), ProductStatus

### Community 41 - "PaymentTransitionService"
Cohesion: 0.29
Nodes (3): OrderPaymentSync, PaymentTransitionService, PaymentStatus

### Community 43 - "UpJurusanStockMovement"
Cohesion: 0.09
Nodes (4): SellerOrderController, UpJurusanStockMovement, MoneyCalculationService, payoutFixture()

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.11
Nodes (20): scripts, lint, lint:check, post-root-package-install, post-update-cmd, pre-package-uninstall, setup, types:check (+12 more)

### Community 46 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+2 more)

### Community 47 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 48 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 51 - "require-dev"
Cohesion: 0.18
Nodes (11): require-dev, fakerphp/faker, larastan/larastan, laravel/pail, laravel/pao, laravel/pint, laravel/sail, mockery/mockery (+3 more)

### Community 53 - "breadcrumbs.tsx"
Cohesion: 0.17
Nodes (13): AlertError(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants, Breadcrumb(), BreadcrumbEllipsis() (+5 more)

### Community 55 - "chart.tsx"
Cohesion: 0.29
Nodes (8): ChartContext, ChartContextProps, ChartLegendContent(), ChartTooltipContent(), getPayloadConfigFromPayload(), INITIAL_DIMENSION, TooltipNameType, useChart()

### Community 57 - "Position.php"
Cohesion: 0.18
Nodes (5): SchoolClass, DatabaseSeeder, TestingUserSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 58 - "Production Hardening — Final Pass"
Cohesion: 0.18
Nodes (10): 1. Implemented (6 items), 2. Audit — Remaining races, 3. Audit — Remaining N+1, 4. Audit — Remaining null dereferences, 5. Audit — Remaining unbounded queries, 6. Production Checklist, 7. Remaining technical debt, 8. Blocking release (+2 more)

### Community 60 - "require"
Cohesion: 0.25
Nodes (8): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/tinker, laravel/wayfinder, php

### Community 61 - "ci:check"
Cohesion: 0.25
Nodes (8): ci:check, dev, bun run format:check, bun run lint:check, bun run types:check, bunx concurrently -c \"#93c5fd,#c4b5fd,#fb7185,#fdba74\" \"php artisan serve --host=localhost\" \"php artisan queue:listen --tries=1 --timeout=0\" \"php artisan pail --timeout=0\" \"bun run dev\" --names=server,queue,logs,vite --kill-others, Composer\\Config::disableProcessTimeout, @test

### Community 62 - "FortifyServiceProvider"
Cohesion: 0.25
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 63 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.28
Nodes (3): RejectProductRequest, PasswordUpdateRequest, Illuminate\Foundation\Http\FormRequest

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 66 - "ProfileValidationRules.php"
Cohesion: 0.36
Nodes (4): emailRules(), nameRules(), profileRules(), ProfileUpdateRequest

### Community 67 - "ExpireUnpaidOrdersCommand.php"
Cohesion: 0.21
Nodes (4): DetectStuckOrdersCommand, ExpireUnpaidOrdersCommand, SystemActor, Illuminate\Console\Command

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
Cohesion: 0.08
Nodes (34): InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Button(), buttonVariants, Checkbox() (+26 more)

### Community 81 - "post-create-project-cmd"
Cohesion: 0.50
Nodes (4): post-create-project-cmd, @php artisan key:generate --ansi, @php artisan migrate --graceful --ansi, @php -r \"file_exists('database/database.sqlite') || touch('database/database.sqlite');\

### Community 94 - "TwoFactorAuthenticationRequest"
Cohesion: 0.33
Nodes (3): SecurityController, TwoFactorAuthenticationRequest, Laravel\Fortify\InteractsWithTwoFactorState

### Community 102 - "10.1 Button"
Cohesion: 0.33
Nodes (6): 10.1 Button, Button states, Destructive button, Outline button, Primary button, Secondary button

### Community 106 - "CreateNewUser.php"
Cohesion: 0.40
Nodes (3): CreateNewUser, Position, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 107 - "TransactionCode"
Cohesion: 0.22
Nodes (3): TransactionCode, OrderFactory, up()

### Community 119 - "10.4 Product Card"
Cohesion: 0.40
Nodes (5): 10.4 Product Card, Hover, Price, Product image, Product name

### Community 122 - "4. Color System"
Cohesion: 0.40
Nodes (5): 4. Color System, Aturan penggunaan warna, Neutral color, Primary color, Semantic color

### Community 148 - "use-clipboard.ts"
Cohesion: 0.33
Nodes (5): TwoFactorSetupStep(), CopiedValue, CopyFn, useClipboard(), UseClipboardReturn

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

### Community 179 - "self"
Cohesion: 0.50
Nodes (4): next(), nextForPreOrder(), self, values()

### Community 197 - "fromStorage"
Cohesion: 0.67
Nodes (3): fromStorage(), self, values()

### Community 198 - "post-autoload-dump"
Cohesion: 0.67
Nodes (3): post-autoload-dump, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump, @php artisan package:discover --ansi

## Knowledge Gaps
- **459 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+454 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `User` connect `User` to `FortifyServiceProvider.php`, `PasswordValidationRules.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `Product.php`, `PicketUpJurusanConsignmentController`, `Illuminate\Http\RedirectResponse`, `UserRole.php`, `UpJurusanConsignment`, `Order`, `OrderLivenessService`, `Illuminate\Http\Request`, `PaymentTransitionService`, `CheckoutController`, `UpJurusanStockMovement`, `UpJurusanConsignmentStatus.php`, `AdminDashboardController`, `ProductCatalogSeeder`, `HandleInertiaRequests`, `Position.php`, `ExpireUnpaidOrdersCommand.php`, `ProductFactory`, `CreateNewUser.php`, `TransactionCode`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `badge.tsx`, `card.tsx`, `up-jurusan/index.tsx`, `seller/orders/index.tsx`, `admin-jurusan/dashboard.tsx`, `categories/index.tsx`, `button.tsx`, `auth-simple-layout.tsx`, `app-header.tsx`, `inventory/index.tsx`, `breadcrumbs.tsx`, `app-sidebar-header.tsx`, `chart.tsx`, `index.ts`, `sidebar.tsx`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `Illuminate\Http\Request`, `Illuminate\Database\Eloquent\Model`, `UpdateInventoryRequest`, `SellerProductController`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `CheckoutController`, `UpJurusanStockMovement`, `Product.php`, `PicketUpJurusanConsignmentController`, `UpJurusanConsignmentStatus.php`, `Illuminate\Http\RedirectResponse`, `Illuminate\Database\Eloquent\Relations\HasMany`, `UserRole.php`, `AdminDashboardController`, `ProductCatalogSeeder`, `User`, `HandleInertiaRequests`, `CartController`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `User` (e.g. with `.handle()` and `.activities()`) actually correct?**
  _`User` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _459 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `badge.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.042105263157894736 - nodes in this community are weakly interconnected._