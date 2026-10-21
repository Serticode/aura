import { test, expect } from '@playwright/test'

test.describe('Private Mirror', () => {
  test('hands moods from Greeting to Mirror once and clears repeat expression', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Overwhelmed', exact: true }).click()
    await page.getByRole('button', { name: 'Tired', exact: true }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page.getByRole('button', { name: 'Overwhelmed', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('button', { name: 'Tired', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Release', exact: true }).click()
    await page.getByRole('button', { name: 'Express something else' }).click()
    await expect(page.getByRole('button', { name: 'Overwhelmed', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await page.reload()
    await expect(page.getByRole('button', { name: 'Tired', exact: true })).toHaveAttribute('aria-pressed', 'false')
  })

  test('Skip and direct entry start without moods', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Low', exact: true }).click()
    await page.getByRole('link', { name: 'Skip for now' }).click()
    await expect(page.getByRole('button', { name: 'Low', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await page.goto('/mirror')
    await expect(page.getByRole('button', { name: 'Low', exact: true })).toHaveAttribute('aria-pressed', 'false')
  })

  test('protects drafts on navigation and restores writing focus after Escape', async ({ page }) => {
    await page.goto('/mirror')
    const draft = page.getByRole('textbox')
    await draft.fill('Private unfinished draft')
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(draft).toBeFocused()
    await expect(draft).toHaveValue('Private unfinished draft')
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: 'Discard and leave' }).click()
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Mirror', exact: true }).click()
    await expect(draft).toHaveValue('')
  })

  test('keeps writing in memory while saved words are open and saves only identifiers', async ({ page }) => {
    const requests: string[] = []
    page.on('request', (request) => requests.push(request.url() + (request.postData() ?? '')))
    await page.goto('/mirror')
    await page.getByRole('textbox').fill('PRIVATE_SENTINEL_aura_2026')
    await page.getByRole('button', { name: 'Saved words (0)', exact: true }).click()
    await page.getByRole('button', { name: 'Back to Mirror', exact: true }).click()
    await expect(page.getByRole('textbox')).toHaveValue('PRIVATE_SENTINEL_aura_2026')
    await page.getByRole('button', { name: 'Overwhelmed', exact: true }).click()
    await page.getByRole('button', { name: 'Release', exact: true }).click()
    await expect(page.getByRole('heading', { level: 2 })).toBeFocused()
    await page.getByRole('button', { name: 'Save affirmation', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Remove saved affirmation', exact: true })).toHaveAttribute('aria-pressed', 'true')
    const stored = await page.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('aura')
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const rows = await new Promise<unknown[]>((resolve, reject) => {
        const request = db.transaction('affirmations').objectStore('affirmations').getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      db.close()
      return { rows, local: { ...localStorage }, session: { ...sessionStorage } }
    })
    expect(stored.rows).toEqual([{ id: 'overwhelmed' }])
    expect(JSON.stringify(stored)).not.toContain('PRIVATE_SENTINEL_aura_2026')
    expect(requests.join(' ')).not.toContain('PRIVATE_SENTINEL_aura_2026')
    await page.reload()
    await page.getByRole('button', { name: 'Saved words (1)', exact: true }).click()
    await expect(page.getByText('You don’t have to put every feeling into words. There’s room for you here.', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Remove affirmation:' }).click()
    await expect(page.getByText('Nothing saved yet.', { exact: false })).toBeVisible()
  })

  test('migrates legacy quiet mode once and reset prevents its resurrection', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('aura.support.quiet', 'true'))
    await page.goto('/mirror')
    await expect(page.getByRole('button', { name: 'Just let me release', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await page.getByRole('button', { name: 'Release', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Released.', exact: true })).toBeVisible()
    await page.getByRole('link', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: 'Clear device data', exact: true }).click()
    await page.getByRole('button', { name: 'Keep my data', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Clear device data', exact: true })).toBeFocused()
    await page.getByRole('button', { name: 'Clear device data', exact: true }).click()
    await page.getByRole('button', { name: 'Clear data', exact: true }).click()
    await expect(page.getByText('Saved words removed. Your preferences are reset.')).toBeVisible()
    await page.reload()
    await page.getByRole('link', { name: 'Mirror', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Gentle words', exact: true })).toHaveAttribute('aria-pressed', 'true')
  })

  test('keeps Mirror usable when IndexedDB is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      IDBFactory.prototype.open = () => { throw new DOMException('Unavailable', 'SecurityError') }
    })
    await page.goto('/mirror')
    await page.getByRole('textbox').fill('Writing without device storage')
    await page.getByRole('button', { name: 'Release', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Express something else' })).toBeVisible()
    await page.getByRole('button', { name: 'Save affirmation', exact: true }).click()
    await expect(page.getByText('Could not update saved words.', { exact: false })).toBeVisible()
  })

  test('synchronizes quiet and motion preferences across tabs', async ({ page, context }) => {
    await page.goto('/mirror')
    const settings = await context.newPage()
    await settings.goto('/settings')
    await settings.getByRole('button', { name: 'Quiet expression', exact: false }).click()
    await expect(page.getByRole('button', { name: 'Just let me release', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await settings.getByRole('switch', { name: 'Reduce motion', exact: true }).click()
    await expect(page.getByRole('switch', { name: 'Reduce motion:', exact: false })).toHaveAttribute('aria-checked', 'true')
    await expect(settings.getByRole('switch', { name: 'Platform sounds' })).toBeDisabled()
  })

})
