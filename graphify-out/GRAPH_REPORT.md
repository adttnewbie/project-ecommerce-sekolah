# Graph Report - project-ecommerce-sekolah  (2026-08-13)

## Corpus Check
- 382 files · ~149,009 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2078 nodes · 5320 edges · 206 communities (132 shown, 74 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 222 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2deb0122`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pages/dashboard.tsx
- cn
- card.tsx
- security.tsx
- up-jurusan/index.tsx
- FortifyServiceProvider.php
- auth-simple-layout.tsx
- categories/index.tsx
- Illuminate\Database\Eloquent\Relations\BelongsTo
- Product
- Illuminate\Database\Eloquent\Relations\HasMany
- OrderItem
- OrderItemStatus.php
- Illuminate\Http\Request
- EduCart Design System
- UpJurusan
- sidebar.tsx
- UserRole.php
- devDependencies
- ConsignmentTransitionService
- dropdown-menu.tsx
- UpJurusanConsignment
- User
- index.ts
- app-sidebar.tsx
- button.tsx
- ReportAggregationService
- avatar.tsx
- dependencies
- Order
- two-factor-setup-modal.tsx
- components.json
- PaymentMethod.php
- server.sh
- SellerProductController
- compilerOptions
- Inertia\Response
- OrderStatus
- Closure
- auth.ts
- ProductCatalogSeeder
- reports/index.tsx
- CreateNewUser.php
- composer.json
- scripts
- scripts
- toggle-group.tsx
- optionalDependencies
- Major
- AdminDashboardController
- require-dev
- setup
- ProfileValidationRules.php
- PasswordValidationRules.php
- seller/dashboard.tsx
- Illuminate\Database\Eloquent\Model
- RegisterResponse
- Production Hardening — Final Pass
- HandleInertiaRequests
- require
- ci:check
- FortifyServiceProvider
- up-jurusan/consignments/index.tsx
- 2026_08_02_000002_add_financial_history_protection.php
- config
- BuyerOrderController
- SystemActor
- EduCart
- TestCase
- admin-jurusan/dashboard.tsx
- psr-4
- laravel
- test
- 2026_06_26_000002_add_up_jurusan_owner_to_products.php
- 2026_07_01_000001_create_up_jurusan_daily_report_transaction_snapshots.php
- use-mobile.tsx
- utils.ts
- Illuminate\Database\Eloquent\Factories\Factory
- SellerOrderController
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
- artisan
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
- UpJurusanDailyReportTransaction
- UpJurusan.php
- @types/react-dom
- TwoFactorAuthenticationRequest
- @radix-ui/react-slot
- use-clipboard.ts
- @eslint/js
- eslint-plugin-react
- laravel-vite-plugin
- PasswordResetResponse
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
- typescript-eslint
- @base-ui/react
- eslint-import-resolver-typescript

## God Nodes (most connected - your core abstractions)
1. `cn()` - 201 edges
2. `User` - 126 edges
3. `Product` - 85 edges
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
- `settlementOrder()` --calls--> `Product`  [INFERRED]
  tests/Feature/OrderSettlementServiceTest.php → app/Models/Product.php

## Import Cycles
- None detected.

## Communities (206 total, 74 thin omitted)

### Community 0 - "pages/dashboard.tsx"
Cohesion: 0.05
Nodes (58): Table(), TableBody(), TableCell(), TableHead(), TableHeader(), TableRow(), AdminJurusanReportDetail(), formatDateTime() (+50 more)

### Community 1 - "cn"
Cohesion: 0.06
Nodes (51): AlertError(), Props, TextLink(), Alert(), AlertAction(), AlertDescription(), AlertTitle(), alertVariants (+43 more)

### Community 2 - "card.tsx"
Cohesion: 0.06
Nodes (46): Props, Badge(), badgeVariants, Card(), CardAction(), CardContent(), CardDescription(), CardHeader() (+38 more)

### Community 3 - "security.tsx"
Cohesion: 0.19
Nodes (11): Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration(), TwoFactorRecoveryCodes() (+3 more)

### Community 4 - "up-jurusan/index.tsx"
Cohesion: 0.07
Nodes (48): Select(), SelectContent(), SelectGroup(), SelectItem(), SelectLabel(), SelectTrigger(), SelectValue(), formatNumber() (+40 more)

### Community 5 - "FortifyServiceProvider.php"
Cohesion: 0.09
Nodes (11): LoginResponse, PasskeyLoginResponse, PasswordConfirmedResponse, RedirectAsIntended, TwoFactorLoginResponse, AuthRedirect, Illuminate\Contracts\Support\Responsable, Laravel\Fortify\Contracts\LoginResponse (+3 more)

### Community 6 - "auth-simple-layout.tsx"
Cohesion: 0.20
Nodes (8): AppLogo(), AppLogoIcon(), Props, AuthSimpleLayout(), AuthTheme, lightAuthTheme, AuthLayout(), AuthLayoutProps

### Community 7 - "categories/index.tsx"
Cohesion: 0.13
Nodes (26): AlertDialog(), AlertDialogAction(), AlertDialogCancel(), AlertDialogContent(), AlertDialogDescription(), AlertDialogFooter(), AlertDialogHeader(), AlertDialogTitle() (+18 more)

### Community 8 - "Illuminate\Database\Eloquent\Relations\BelongsTo"
Cohesion: 0.06
Nodes (4): UpJurusanDailyReportTransactionItem, UpJurusanPosSale, UpJurusanStockMovement, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 9 - "Product"
Cohesion: 0.10
Nodes (6): AdminProductModerationController, CartController, CheckoutController, Product, PreOrderRules, Illuminate\Database\QueryException

### Community 11 - "OrderItem"
Cohesion: 0.08
Nodes (9): OrderItem, OrderItemCancellation, OrderItemFulfillment, OrderPaymentSync, OrderStatusSync, up(), up(), OrderItemStatus (+1 more)

### Community 12 - "OrderItemStatus.php"
Cohesion: 0.12
Nodes (7): next(), nextForPreOrder(), self, values(), fromStorage(), self, values()

### Community 13 - "Illuminate\Http\Request"
Cohesion: 0.17
Nodes (4): AdminJurusanReportController, PicketUpJurusanConsignmentController, UpJurusanDailyReport, Illuminate\Http\Request

### Community 14 - "EduCart Design System"
Cohesion: 0.06
Nodes (32): 10.10 Skeleton, 10.3 Search Bar, 10.5 Badge, 10.6 Navbar, 10.7 Breadcrumb, 10.8 Modal dan Dialog, 10.9 Toast, 10. Core Components (+24 more)

### Community 15 - "UpJurusan"
Cohesion: 0.11
Nodes (6): AdminJurusanDashboardController, AdminJurusanUpJurusanController, UpJurusan, UpJurusanPolicy, ActorLifecycle, picketUpJurusanFixture()

### Community 16 - "sidebar.tsx"
Cohesion: 0.09
Nodes (26): AppHeader(), BuyerNavLink(), getBuyerNavItems(), Sheet(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+18 more)

### Community 17 - "UserRole.php"
Cohesion: 0.11
Nodes (4): label(), options(), SellerApplication, Illuminate\Database\Eloquent\Factories\HasFactory

### Community 18 - "devDependencies"
Cohesion: 0.12
Nodes (17): babel-plugin-react-compiler, eslint-config-prettier, eslint-plugin-import, eslint-plugin-react-hooks, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint (+9 more)

### Community 20 - "ConsignmentTransitionService"
Cohesion: 0.18
Nodes (4): ConsignmentTransitionService, DomainEventService, up(), UpJurusanConsignmentStatus

### Community 21 - "dropdown-menu.tsx"
Cohesion: 0.09
Nodes (26): NavUser(), DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+18 more)

### Community 22 - "UpJurusanConsignment"
Cohesion: 0.10
Nodes (7): AdminJurusanConsignmentController, SellerConsignmentController, UpJurusanConsignment, ConsignmentPayoutService, MoneyCalculationService, payoutFixture(), makeConsignment()

### Community 23 - "User"
Cohesion: 0.11
Nodes (11): SellerDashboardController, User, OrderPolicy, UserPolicy, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable (+3 more)

### Community 24 - "index.ts"
Cohesion: 0.15
Nodes (13): AppContent(), Props, AppShell(), Props, SidebarInset(), Toaster(), AppHeaderLayout(), AppSidebarLayout() (+5 more)

### Community 25 - "app-sidebar.tsx"
Cohesion: 0.13
Nodes (23): AppSidebar(), getMainNavItems(), lightTooltip, NavFooter(), NavMain(), Sidebar(), SidebarContent(), SidebarFooter() (+15 more)

### Community 26 - "button.tsx"
Cohesion: 0.15
Nodes (20): HeaderNotification, notificationMenuStyle, roleLabels, Props, Button(), buttonVariants, Dialog(), DialogClose() (+12 more)

### Community 27 - "ReportAggregationService"
Cohesion: 0.16
Nodes (3): Collection, ReportAggregationService, Illuminate\Support\Collection

### Community 28 - "avatar.tsx"
Cohesion: 0.17
Nodes (11): AppSidebarHeader(), getSearchConfig(), Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage() (+3 more)

### Community 29 - "dependencies"
Cohesion: 0.18
Nodes (11): class-variance-authority, clsx, @laravel/passkeys, dependencies, class-variance-authority, clsx, @laravel/passkeys, react (+3 more)

### Community 30 - "Order"
Cohesion: 0.10
Nodes (7): AdminOrderController, Order, OrderLivenessService, OrderSettlementService, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder, WeakMap

### Community 31 - "two-factor-setup-modal.tsx"
Cohesion: 0.21
Nodes (8): Props, TwoFactorSetupStep(), InputOTP(), InputOTPGroup(), InputOTPSlot(), useClipboard(), OTP_MAX_LENGTH, UseTwoFactorAuthReturn

### Community 32 - "components.json"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 34 - "server.sh"
Cohesion: 0.11
Nodes (18): APP_DEBUG, APP_ENV, APP_FAKER_LOCALE, APP_FALLBACK_LOCALE, APP_KEY, APP_LOCALE, APP_URL, BCRYPT_ROUNDS (+10 more)

### Community 36 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 37 - "Inertia\Response"
Cohesion: 0.10
Nodes (10): AdminProductController, AdminSellerApplicationController, AdminUserController, BuyerCatalogController, BuyerProductDetailController, Controller, SellerInventoryController, SecurityController (+2 more)

### Community 38 - "OrderStatus"
Cohesion: 0.14
Nodes (11): Collection, Attribute, up(), down(), expandEnumColumn(), up(), down(), expandEnumColumn() (+3 more)

### Community 39 - "Closure"
Cohesion: 0.22
Nodes (7): EnsureUserIsAdmin, EnsureUserIsAdminJurusan, EnsureUserIsBuyer, EnsureUserIsPicketOfficer, EnsureUserIsSeller, Closure, Symfony\Component\HttpFoundation\Response

### Community 40 - "auth.ts"
Cohesion: 0.20
Nodes (8): Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes, react

### Community 42 - "reports/index.tsx"
Cohesion: 0.13
Nodes (11): DailyReport, DateTimeProps, EmptyStateProps, formatRupiah(), Props, ReportHeaderProps, ReportsSection(), ReportsSectionProps (+3 more)

### Community 43 - "CreateNewUser.php"
Cohesion: 0.13
Nodes (8): CreateNewUser, Position, SchoolClass, DatabaseSeeder, TestingUserSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 44 - "composer.json"
Cohesion: 0.14
Nodes (13): autoload-dev, psr-4, description, keywords, license, minimum-stability, name, prefer-stable (+5 more)

### Community 45 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, lint, lint:check, post-autoload-dump, post-update-cmd, pre-package-uninstall, types:check, Illuminate\\Foundation\\ComposerScripts::postAutoloadDump (+6 more)

### Community 46 - "scripts"
Cohesion: 0.20
Nodes (10): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+2 more)

### Community 47 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

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

### Community 56 - "Illuminate\Database\Eloquent\Model"
Cohesion: 0.18
Nodes (4): CartItem, DomainEvent, NotificationDismissal, Illuminate\Database\Eloquent\Model

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

### Community 63 - "up-jurusan/consignments/index.tsx"
Cohesion: 0.25
Nodes (6): CartItem, DailyReportItem, formatRupiah(), PicketUpJurusanConsignments(), PosProduct, Props

### Community 64 - "2026_08_02_000002_add_financial_history_protection.php"
Cohesion: 0.67
Nodes (5): detach(), down(), replaceConstraint(), restrict(), up()

### Community 65 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 67 - "SystemActor"
Cohesion: 0.22
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

### Community 77 - "utils.ts"
Cohesion: 0.08
Nodes (37): DeleteUser(), InputError(), Props, PasskeyVerify(), Props, PasswordInput(), Checkbox(), Input() (+29 more)

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
Cohesion: 0.14
Nodes (5): NotificationDismissalController, SellerApplicationController, ProfileController, PaymentTransitionService, Illuminate\Http\RedirectResponse

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

### Community 150 - "artisan"
Cohesion: 0.29
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
Cohesion: 0.18
Nodes (4): UpdateInventoryRequest, UpdateOrderItemStatusRequest, PasswordUpdateRequest, Illuminate\Foundation\Http\FormRequest

### Community 174 - "UpJurusan.php"
Cohesion: 0.14
Nodes (4): UpJurusanPayout, consignmentForkWait(), consignmentRunner(), Closure

### Community 181 - "use-clipboard.ts"
Cohesion: 0.50
Nodes (3): CopiedValue, CopyFn, UseClipboardReturn

### Community 190 - "seller/consignments/index.tsx"
Cohesion: 0.67
Nodes (3): formatRupiah(), Props, SellerConsignments()

## Knowledge Gaps
- **466 isolated node(s):** `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema`, `.opencode/plugins/graphify.js`, `$schema` (+461 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **74 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `pages/dashboard.tsx`, `card.tsx`, `up-jurusan/index.tsx`, `auth-simple-layout.tsx`, `categories/index.tsx`, `admin-jurusan/dashboard.tsx`, `utils.ts`, `toggle-group.tsx`, `sidebar.tsx`, `dropdown-menu.tsx`, `seller/dashboard.tsx`, `index.ts`, `app-sidebar.tsx`, `button.tsx`, `avatar.tsx`, `breadcrumbs.tsx`, `two-factor-setup-modal.tsx`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `User` connect `User` to `FortifyServiceProvider.php`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `Product`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `OrderItemStatus.php`, `Illuminate\Http\Request`, `UpJurusan`, `UserRole.php`, `ConsignmentTransitionService`, `TransactionCode`, `UpJurusanConsignment`, `Order`, `Inertia\Response`, `ProductCatalogSeeder`, `CreateNewUser.php`, `UpJurusan.php`, `AdminDashboardController`, `PasswordValidationRules.php`, `Illuminate\Database\Eloquent\Model`, `HandleInertiaRequests`, `SystemActor`, `Illuminate\Database\Eloquent\Factories\Factory`, `Product.php`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Product` connect `Product` to `SellerProductController`, `Inertia\Response`, `Illuminate\Database\Eloquent\Relations\BelongsTo`, `ProductCatalogSeeder`, `Illuminate\Database\Eloquent\Relations\HasMany`, `OrderItem`, `Illuminate\Http\Request`, `UpJurusan.php`, `UpJurusan`, `UserRole.php`, `AdminDashboardController`, `Product.php`, `UpJurusanConsignment`, `User`, `Illuminate\Database\Eloquent\Model`, `HandleInertiaRequests`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 22 inferred relationships involving `User` (e.g. with `.handle()` and `.activities()`) actually correct?**
  _`User` has 22 INFERRED edges - model-reasoned connections that need verification._
- **Are the 16 inferred relationships involving `Product` (e.g. with `.adminQueue()` and `.stats()`) actually correct?**
  _`Product` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `file:///home/adttnewbie/Documents/Coding/project-ecommerce-sekolah/.kilo/plugins/graphify.js`, `$schema` to the rest of the system?**
  _466 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `pages/dashboard.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05311871227364185 - nodes in this community are weakly interconnected._