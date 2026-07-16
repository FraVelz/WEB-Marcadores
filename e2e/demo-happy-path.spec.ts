import { expect, test } from "@playwright/test"

test.describe("demo banner + happy path", () => {
  test("/demo shows unmistakable demo banner", async ({ page }) => {
    await page.goto("/demo", { waitUntil: "networkidle" })
    await expect(page).toHaveURL(/\/marcadores/)
    const banner = page.getByTestId("demo-banner")
    await expect(banner).toBeVisible({ timeout: 30_000 })
    await expect(banner).toContainText("Modo demo")
    await expect(banner).toContainText("Datos de ejemplo")
  })

  test("demo happy path: create folder via dialog", async ({ page }) => {
    await page.goto("/demo", { waitUntil: "networkidle" })
    await expect(page.getByTestId("demo-banner")).toBeVisible({ timeout: 30_000 })
    await expect(page.getByText("Cargando…")).toHaveCount(0, { timeout: 30_000 })

    await page.getByRole("button", { name: "Nueva carpeta" }).first().click()
    const dialog = page.getByTestId("new-folder-dialog")
    await expect(dialog).toBeVisible()

    const name = `E2E Folder ${Date.now()}`
    await dialog.getByLabel("Nombre de carpeta").fill(name)
    await dialog.getByRole("button", { name: "Crear" }).click()

    await expect(dialog).toBeHidden({ timeout: 10_000 })
    await expect(page.getByText(name).first()).toBeVisible({ timeout: 10_000 })
  })
})

test.describe("authed happy path", () => {
  test("login → marcadores without demo banner when credentials provided", async ({ page }) => {
    const email = process.env.E2E_EMAIL
    const password = process.env.E2E_PASSWORD
    test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD for authed e2e")

    await page.goto("/")
    await page.getByLabel(/email|correo/i).fill(email!)
    await page.getByLabel(/password|contraseña/i).fill(password!)
    await page.getByRole("button", { name: /entrar|iniciar|sign in|login/i }).click()
    await expect(page).toHaveURL(/\/marcadores/, { timeout: 30_000 })
    await expect(page.getByTestId("demo-banner")).toHaveCount(0)
  })
})
