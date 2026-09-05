import { test, expect } from '@playwright/test';

test('buyer sees tokopedia-style account', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('buyer@example.com');
    await page.getByLabel(/password/i).fill('password');
    await page.getByRole('button', { name: /log in|masuk/i }).click();
    await page.goto('/settings/profile');
    await expect(
        page.getByRole('heading', { name: /akun saya|pesanan saya/i }).first(),
    ).toBeVisible();
    await expect(
        page.getByText('Pesanan', { exact: true }).first(),
    ).toBeVisible();
});
