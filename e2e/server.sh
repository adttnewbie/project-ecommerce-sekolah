#!/usr/bin/env bash
#
# Boots the Laravel app for Playwright against an isolated SQLite database.
# Never touches the .env MySQL connection. Run via `npx playwright test`.
set -euo pipefail

cd "$(dirname "$0")/.."

DB_PATH=/tmp/educart-e2e.sqlite
rm -f "$DB_PATH"

export APP_ENV=testing
export APP_DEBUG=true
export APP_KEY=base64:i+Q/UiJ2ugMkfwPcvOI11bDzS+hCbziKb/3uVEvBptY=
export APP_URL=http://127.0.0.1:8000
export APP_LOCALE=en
export APP_FALLBACK_LOCALE=en
export APP_FAKER_LOCALE=en_US
export BCRYPT_ROUNDS=12
export LOG_CHANNEL=stack
export LOG_STACK=single
export LOG_LEVEL=warning

# Isolated database and stores (sqlite, not the .env mysql production DB).
export DB_CONNECTION=sqlite
export DB_DATABASE="$DB_PATH"
export SESSION_DRIVER=file
export CACHE_STORE=file
export QUEUE_CONNECTION=sync
export FILESYSTEM_DISK=local

# Guard: fail loudly if the app still resolves to the production connection.
RESOLVED_CONNECTION=$(php -r '
    require "vendor/autoload.php";
    $app = require "bootstrap/app.php";
    $app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    echo config("database.default");
')
if [ "$RESOLVED_CONNECTION" != "sqlite" ]; then
    echo "ERROR: e2e server refused to start; database connection is '$RESOLVED_CONNECTION', expected sqlite" >&2
    exit 1
fi

php artisan migrate:fresh --force --seed
php artisan config:clear >/dev/null 2>&1 || true

# Compile frontend assets (includes the logout fix under test).
bun run build >/dev/null

exec php artisan serve --host=127.0.0.1 --port=8000
