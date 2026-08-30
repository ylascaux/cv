import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const pages = [
  {
    path: '/',
    lang: 'fr',
    experience: 'Expériences',
    skills: 'Compétences',
    currentRole: 'Poste actuel',
    moreDetails: 'Plus de détails',
    additionalResponsibilities: 'Missions complémentaires',
    alternatePath: '/en/',
    download: '/downloads/yoann-lascaux-cv-fr.pdf',
    enableDarkTheme: 'Activer le thème sombre',
    enableLightTheme: 'Activer le thème clair',
    sourceLabel: 'Code source & infrastructure sur GitHub',
    canonical: 'https://cv.yoann-lascaux.fr/',
    alternate: 'https://cv.yoann-lascaux.fr/en/',
    seoDescription:
      'CV de Yoann Lascaux, Senior Platform Engineer / SRE spécialisé en AWS, Kubernetes, Terraform, CI/CD, observabilité et plateformes Cloud.',
  },
  {
    path: '/en/',
    lang: 'en',
    experience: 'Experience',
    skills: 'Skills',
    currentRole: 'Current role',
    moreDetails: 'More details',
    additionalResponsibilities: 'Additional responsibilities',
    alternatePath: '/',
    download: '/downloads/yoann-lascaux-cv-en.pdf',
    enableDarkTheme: 'Enable dark theme',
    enableLightTheme: 'Enable light theme',
    sourceLabel: 'Source code & infrastructure on GitHub',
    canonical: 'https://cv.yoann-lascaux.fr/en/',
    alternate: 'https://cv.yoann-lascaux.fr/',
    seoDescription:
      'Resume of Yoann Lascaux, Senior Platform Engineer / SRE specializing in AWS, Kubernetes, Terraform, CI/CD, observability and Cloud platforms.',
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
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', cv.seoDescription);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', cv.canonical);
    await expect(page.locator(`link[rel="alternate"][hreflang="${cv.lang}"]`)).toHaveAttribute('href', cv.canonical);
    await expect(
      page.locator(`link[rel="alternate"][hreflang]:not([hreflang="${cv.lang}"]):not([hreflang="x-default"])`),
    ).toHaveAttribute('href', cv.alternate);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', cv.canonical);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      'https://cv.yoann-lascaux.fr/og-image.png',
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    const socialImageDimensions = await page.evaluate(
      () =>
        new Promise<{ width: number; height: number }>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
          image.onerror = () => reject(new Error('Unable to load the social image.'));
          image.src = '/og-image.png';
        }),
    );
    expect(socialImageDimensions).toEqual({ width: 1200, height: 630 });
    const structuredData = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
    expect(structuredData['@graph'].map((item: { '@type': string }) => item['@type'])).toEqual([
      'ProfilePage',
      'Person',
    ]);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Senior Platform Engineer / SRE');
    await expect(page.getByRole('heading', { name: cv.experience })).toBeVisible();
    await expect(page.getByRole('heading', { name: cv.skills })).toBeVisible();
    await expect(page.getByText(cv.currentRole, { exact: true })).toBeVisible();
    await expect(page.locator('.company-mark')).toHaveCount(9);
    const companyLogos = page.locator('.company-mark img');
    await expect(companyLogos).toHaveCount(9);
    expect(
      await companyLogos.evaluateAll((images) =>
        images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0),
      ),
    ).toBe(true);
    await expect(page.locator('.skill-group-icon')).toHaveCount(8);
    const experienceDetails = page.locator('.experience-details');
    await expect(experienceDetails).toHaveCount(8);
    const firstDetails = experienceDetails.first();
    await expect(firstDetails.locator('summary')).toHaveText(cv.moreDetails);
    await expect(firstDetails).not.toHaveAttribute('open', '');
    await firstDetails.locator('summary').click();
    await expect(firstDetails).toHaveAttribute('open', '');
    await expect(firstDetails.getByText(cv.additionalResponsibilities, { exact: true })).toBeVisible();
    await expect(firstDetails.getByText('AWS', { exact: true })).toBeVisible();
    await expect(page.locator('.language-link')).toHaveAttribute('href', cv.alternatePath);
    await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/yoann-lascaux/',
    );
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
      'href',
      'https://github.com/ylascaux',
    );
    await expect(page.getByRole('link', { name: cv.sourceLabel, exact: true })).toHaveAttribute(
      'href',
      'https://github.com/ylascaux/cv',
    );
    await expect(page.getByTestId('download-pdf')).toBeVisible();
    await expect(page.getByTestId('download-pdf')).toHaveAttribute('href', cv.download);
    expect(errors).toEqual([]);
  });

  test(`${cv.lang} theme follows the system and can be persisted`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(cv.path);

    const themeToggle = page.getByTestId('theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(themeToggle).toHaveAccessibleName(cv.enableLightTheme);

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(themeToggle).toHaveAccessibleName(cv.enableDarkTheme);
    expect(await page.evaluate(() => localStorage.getItem('cv-theme'))).toBe('light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test(`${cv.lang} PDF layout exposes contact details and three columns`, async ({ page }) => {
    await page.goto(cv.path);
    await page.evaluate(() => localStorage.setItem('cv-theme', 'dark'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.emulateMedia({ media: 'print' });

    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.contact-email')).toHaveText('yoann-cv@lascaux.ovh');
    await expect(page.locator('.contact-email')).toBeVisible();
    await expect(page.locator('.contact-label')).toBeHidden();
    await expect(page.getByTestId('download-pdf')).toBeHidden();
    await expect(page.locator('.print-details').first()).toBeVisible();
    await expect(page.locator('.resume-layout')).toHaveCSS('grid-template-areas', '"profile-sidebar main skills"');
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

test('SEO discovery files expose the public bilingual URLs', async ({ request }) => {
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok()).toBe(true);
  expect(await robotsResponse.text()).toContain('Sitemap: https://cv.yoann-lascaux.fr/sitemap.xml');

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok()).toBe(true);
  expect(sitemapResponse.headers()['content-type']).toContain('xml');
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toContain('<loc>https://cv.yoann-lascaux.fr/</loc>');
  expect(sitemap).toContain('<loc>https://cv.yoann-lascaux.fr/en/</loc>');
  expect(sitemap).toContain('hreflang="x-default"');
});
