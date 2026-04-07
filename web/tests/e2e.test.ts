import { test, expect } from '@playwright/test';

test.describe('E2E Tests', () => {
  test('should navigate to productos page and perform CRUD operations', async ({ page }) => {
    // Navigate to productos page
    await page.goto('/productos');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if page title is visible
    await expect(page.locator('h1').filter({ hasText: 'Productos' })).toBeVisible();

    // Click add product button
    await page.locator('button').filter({ hasText: 'Agregar Producto' }).click();

    // Fill form
    await page.locator('input[name="nombre"]').fill('Producto E2E Test');
    await page.locator('input[name="descripcion"]').fill('Descripción de prueba');
    await page.locator('input[name="precio"]').fill('100.50');
    await page.locator('input[name="stock"]').fill('10');

    // Select proveedor (assuming there's at least one)
    await page.locator('select[name="id_proveedor"]').selectOption({ index: 1 });

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for success message or product to appear
    await expect(page.locator('text=Producto E2E Test')).toBeVisible();

    // Edit the product
    await page.locator('button').filter({ hasText: 'Editar' }).first().click();
    await page.locator('input[name="nombre"]').fill('Producto E2E Updated');
    await page.locator('button[type="submit"]').click();

    // Verify update
    await expect(page.locator('text=Producto E2E Updated')).toBeVisible();

    // Delete the product
    await page.locator('button').filter({ hasText: 'Eliminar' }).first().click();
    // Confirm delete if there's a confirmation dialog
    await page.locator('button').filter({ hasText: 'Confirmar' }).click();

    // Verify deletion
    await expect(page.locator('text=Producto E2E Updated')).not.toBeVisible();
  });

  test('should navigate to clientes page and perform CRUD', async ({ page }) => {
    await page.goto('/clientes');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'Clientes' })).toBeVisible();

    // Add client
    await page.locator('button').filter({ hasText: 'Agregar Cliente' }).click();
    await page.locator('input[name="nombre"]').fill('Cliente E2E Test');
    await page.locator('input[name="email"]').fill('e2e@test.com');
    await page.locator('input[name="telefono"]').fill('123456789');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Cliente E2E Test')).toBeVisible();

    // Edit
    await page.locator('button').filter({ hasText: 'Editar' }).first().click();
    await page.locator('input[name="nombre"]').fill('Cliente E2E Updated');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Cliente E2E Updated')).toBeVisible();

    // Delete
    await page.locator('button').filter({ hasText: 'Eliminar' }).first().click();
    await page.locator('button').filter({ hasText: 'Confirmar' }).click();

    await expect(page.locator('text=Cliente E2E Updated')).not.toBeVisible();
  });

  test('should navigate to proveedores page and perform CRUD', async ({ page }) => {
    await page.goto('/proveedores');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'Proveedores' })).toBeVisible();

    // Add supplier
    await page.locator('button').filter({ hasText: 'Agregar Proveedor' }).click();
    await page.locator('input[name="nombre"]').fill('Proveedor E2E Test');
    await page.locator('input[name="contacto"]').fill('contacto@test.com');
    await page.locator('input[name="telefono"]').fill('987654321');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Proveedor E2E Test')).toBeVisible();

    // Edit
    await page.locator('button').filter({ hasText: 'Editar' }).first().click();
    await page.locator('input[name="nombre"]').fill('Proveedor E2E Updated');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('text=Proveedor E2E Updated')).toBeVisible();

    // Delete
    await page.locator('button').filter({ hasText: 'Eliminar' }).first().click();
    await page.locator('button').filter({ hasText: 'Confirmar' }).click();

    await expect(page.locator('text=Proveedor E2E Updated')).not.toBeVisible();
  });

  test('should navigate to ventas page and create a sale', async ({ page }) => {
    await page.goto('/ventas');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'Ventas' })).toBeVisible();

    // Assuming there's a form to create sale
    // This might need adjustment based on actual UI
    await page.locator('button').filter({ hasText: 'Nueva Venta' }).click();

    // Select client
    await page.locator('select[name="id_cliente"]').selectOption({ index: 1 });

    // Add product to sale
    await page.locator('button').filter({ hasText: 'Agregar Producto' }).click();
    await page.locator('select[name="id_producto"]').selectOption({ index: 1 });
    await page.locator('input[name="cantidad"]').fill('2');
    await page.locator('input[name="precio_unitario"]').fill('50.00');

    // Submit sale
    await page.locator('button[type="submit"]').click();

    // Verify sale created
    await expect(page.locator('text=Venta creada')).toBeVisible();
  });

  test('should navigate to dashboard and view reports', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1').filter({ hasText: 'Dashboard' })).toBeVisible();

    // Check if reports are displayed
    await expect(page.locator('text=Ventas Diarias')).toBeVisible();
    await expect(page.locator('text=Productos Más Vendidos')).toBeVisible();
  });
});