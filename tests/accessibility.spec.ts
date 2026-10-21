import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessible private pilot', () => {
  test('has no automated WCAG A or AA findings in its primary views', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const route of ['/', '/mirror', '/settings']) {
      await page.goto(route)
      await page.getByRole('heading', { level: 1 }).waitFor()
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      expect(results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map(({ target }) => target) }))).toEqual([])
    }
    await page.goto('/mirror')
    await page.getByRole('textbox').fill('A private thought')
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations.map(({ id }) => id)).toEqual([])
  })

  test('reflows without horizontal scrolling and supports reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    for (const width of [320, 375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      for (const route of ['/', '/mirror', '/settings']) {
        await page.goto(route)
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      }
    }
    await page.goto('/mirror')
    await page.getByRole('textbox').fill('A moment to pause')
    await page.getByRole('button', { name: 'Release', exact: true }).click()
    await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
    await expect(page.locator('.release-petal')).toHaveCount(0)
  })
})
