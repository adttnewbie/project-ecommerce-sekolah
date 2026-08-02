import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const BUYER_EMAIL = 'buyer@educart.test';
const BUYER_PASSWORD = 'password';
const BUYER_NAME = 'Buyer EduCart';
const PROTECTED_PAGE = '/seller/dashboard';

async function loginAsBuyer(page: Page): Promise<void> {
    await page.goto('/login');
    await page.getByLabel('Email').fill(BUYER_EMAIL);
    await page.getByLabel('Kata Sandi').fill(BUYER_PASSWORD);
    await page.getByTestId('login-button').click();
}

test.describe('buyer authentication', () => {
    test('login submits credentials and redirects the buyer home', async ({
        page,
    }) => {
        await loginAsBuyer(page);

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByText(BUYER_NAME)).toBeVisible();
    });

    test('guest visiting a protected page is redirected to login', async ({
        page,
    }) => {
        await page.goto(PROTECTED_PAGE);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByTestId('login-button')).toBeVisible();
    });

    test('logout posts to the logout route and redirects the buyer to the guest home', async ({
        page,
    }) => {
        await loginAsBuyer(page);

        await page.getByText(BUYER_NAME).click();
        await page.getByTestId('logout-button').click();

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    });

    test('logout destroys the server session so protected pages require login again', async ({
        page,
    }) => {
        await loginAsBuyer(page);

        await page.getByText(BUYER_NAME).click();
        await page.getByTestId('logout-button').click();

        await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

        await page.goto(PROTECTED_PAGE);

        await expect(page).toHaveURL(/\/login$/);
        await expect(page.getByTestId('login-button')).toBeVisible();
    });
});
