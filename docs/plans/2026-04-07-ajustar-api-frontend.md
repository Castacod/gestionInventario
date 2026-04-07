# Plan: Ajustar servicios API y organizar vistas frontend

**Date**: 2026-04-07
**Complexity**: medium
**Estimated time**: 40 min

## Acceptance Criteria
- [ ] `api/src/index.ts` monta todos los servicios relevantes: clientes, productos, proveedores, ventas, reportes, auth, cuentas, auditoría, redis y transacciones.
- [ ] `sql/init.sql` incluye el esquema relacional completo para los servicios expuestos en la API, incluyendo tablas `users`, `accounts`, `ledger_movements` y las vistas de reportes.
- [ ] El frontend tiene una vista organizada de reportes en `web/app/reportes/page.tsx` y la navegación lateral la incluye.
- [ ] Las vistas actuales `Dashboard`, `Productos`, `Clientes`, `Proveedores` y `Ventas` usan diseño coherente y estilo profesional.
- [ ] No quedan rutas API incompletas expuestas ni servicios desconectados del frontend.

## Edge Cases
1. Usuario navega a reportes sin datos → mostrar estado vacío con llamada exitosa.
2. API se inicia sin `JWT_SECRET` pero no se usa auth → la aplicación principal debe seguir funcionando.
3. Frontend carga productos sin proveedor → manejar `null` sin fallar.
4. Vista de ventas muestra ventas sin `total` → formatear como `$0.00`.

---

## Tasks

### Task 1 — Alinear rutas API
**Agent**: backend-api-expert
**Files**: api/src/index.ts
**Time**: 8 min

Steps:
1. Editar `api/src/index.ts` para importar y montar `auth`, `accounts`, `audit`, `redis-admin`, `transactions`.
2. Verificar que cada ruta está expuesta con prefijos coherentes.
3. Run: `npm --workspace=api run build` (si aplica) o `npm --workspace=api run dev -- --help`.

Verification: `grep -n "use(\"/api/" api/src/index.ts`

### Task 2 — Completar esquema SQL
**Agent**: db-schema-expert
**Files**: sql/init.sql
**Time**: 10 min

Steps:
1. Añadir tablas `users`, `accounts`, `ledger_movements` al SQL de inicialización.
2. Mantener el esquema existente de productos/clientes/proveedores/ventas.
3. Añadir comentarios para el uso de auth y transacciones.
4. Run: `grep -n "CREATE TABLE IF NOT EXISTS users" sql/init.sql`

Verification: `tail -n +1 sql/init.sql | grep -nE "users|accounts|ledger_movements"`

### Task 3 — Crear página de reportes profesional
**Agent**: frontend-ux-expert
**Files**: web/app/reportes/page.tsx, web/components/Sidebar.tsx
**Time**: 12 min

Steps:
1. Añadir nueva página de reportes que llame a `/api/reportes/ventas-diarias` y `/api/reportes/productos-mas-vendidos`.
2. Agregar la ruta `Reportes` en el Sidebar.
3. Usar `Card` y estado vacío claro.
4. Run: `npm --workspace=web run dev` y navegar a `/reportes`.

Verification: `grep -R "reportes" web/app web/components/Sidebar.tsx`

### Task 4 — Refactorizar dashboard y estilos globales
**Agent**: frontend-ui-expert
**Files**: web/app/page.tsx, web/app/globals.css, web/components/Card.tsx
**Time**: 10 min

Steps:
1. Ajustar `web/app/page.tsx` para mostrar KPI con tarjetas y un diseño de resumen.
2. Mejorar `globals.css` para estilo más profesional y consistente.
3. Ajustar `Card.tsx` para aceptar descripción opcional y una mejor estructura.
4. Run: verificar en navegador o `npm --workspace=web run build`.

Verification: `grep -n "className=\"badge" web/app/page.tsx`

### Task 5 — Ajustes de coherencia frontend/backend
**Agent**: fullstack-refactor
**Files**: web/app/ventas/page.tsx, web/app/productos/page.tsx, web/app/clientes/page.tsx, web/app/proveedores/page.tsx
**Time**: 10 min

Steps:
1. Asegurar que las páginas usan la API con validación básica.
2. Normalizar los estados de carga, los mensajes y los textos de botón.
3. Añadir formato de fechas y manejo de datos faltantes.
4. Run: pruebas manuales de endpoints con datos simulados.

Verification: `grep -R "handleSubmit\|loadData\|loadClientes" web/app`
