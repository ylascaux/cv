import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  {
    path: '/',
    lang: 'fr',
    experience: 'Expériences',
    skills: 'Compétences',
    alternatePath: '/en/',
    download: '/downloads/yoann-lascaux-cv-fr.pdf',
  },
  {
    path: '/en/',
    lang: 'en',
    experience: 'Experience',
    skills: 'Skills',
    alternatePath: '/',
    download: '/downloads/yoann-lascaux-cv-en.pdf',
  },
] as const;

for (const cv of pages) {
  test(`${cv.lang} CV exposes its content and navigation`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    await page.goto(cv.path);

    await expect(page.locator('html')).toHaveAttribute('lang', cv.lang);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Senior Platform Engineer / SRE');
    await expect(page.getByRole('heading', { name: cv.experience })).toBeVisible();
    await expect(page.getByRole('heading', { name: cv.skills })).toBeVisible();
    await expect(page.locator('.language-link')).toHaveAttribute('href', cv.alternatePath);
    await expect(page.getByTestId('download-pdf')).toHaveAttribute('href', cv.download);
    expect(errors).toEqual([]);
  });

  test(`${cv.lang} CV has no automatically detectable accessibility violation`, async ({ page }) => {
    await page.goto(cv.path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`${cv.lang} CV does not overflow horizontally`, async ({ page }) => {
    await page.goto(cv.path);
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}
