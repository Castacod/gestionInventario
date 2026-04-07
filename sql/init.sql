-- ==========================================
-- Sistema de Gestión de Ventas e Inventario
-- ==========================================

-- 1. Tablas y Relaciones
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_proveedor UUID REFERENCES proveedores(id) ON DELETE SET NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio NUMERIC(14, 2) NOT NULL CHECK (precio >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_cliente UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  total NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  estado TEXT DEFAULT 'COMPLETADA',
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS detalles_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_venta UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  id_producto UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario NUMERIC(14, 2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0)
);

-- ==========================================
-- 2. Índices de optimización
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON ventas(id_cliente);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);
CREATE INDEX IF NOT EXISTS idx_detalles_venta ON detalles_venta(id_venta);
CREATE INDEX IF NOT EXISTS idx_detalles_producto ON detalles_venta(id_producto);

-- ==========================================
-- 3. Triggers para actualizar el stock
-- ==========================================
CREATE OR REPLACE FUNCTION fn_actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar que haya stock suficiente
  IF (SELECT stock FROM productos WHERE id = NEW.id_producto) < NEW.cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente para el producto con ID %', NEW.id_producto;
  END IF;

  -- Actualizar el inventario restando la cantidad vendida
  UPDATE productos
  SET stock = stock - NEW.cantidad
  WHERE id = NEW.id_producto;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_stock ON detalles_venta;
CREATE TRIGGER trg_actualizar_stock
AFTER INSERT ON detalles_venta
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_stock();

-- ==========================================
-- 4. Vistas para Reportes
-- ==========================================
-- Ventas Diarias
CREATE OR REPLACE VIEW vw_ventas_diarias AS
SELECT 
  DATE(fecha) as fecha_venta,
  COUNT(id) as total_operaciones,
  SUM(total) as monto_total
FROM ventas
WHERE estado = 'COMPLETADA'
GROUP BY DATE(fecha)
ORDER BY fecha_venta DESC;

-- Productos Más Vendidos
CREATE OR REPLACE VIEW vw_productos_mas_vendidos AS
SELECT 
  p.id,
  p.nombre,
  SUM(d.cantidad) as total_vendido
FROM detalles_venta d
JOIN productos p ON p.id = d.id_producto
JOIN ventas v ON v.id = d.id_venta
WHERE v.estado = 'COMPLETADA'
GROUP BY p.id, p.nombre
ORDER BY total_vendido DESC;

-- ==========================================
-- 5. Procedimiento Almacenado de Registro de Venta
-- ==========================================
-- Uso con Node.js pasando un JSON de items:
-- [{"id_producto": "uuid...", "cantidad": 2, "precio_unitario": 10.5}]
CREATE OR REPLACE PROCEDURE sp_registrar_venta(
  p_id_cliente UUID,
  p_items JSON
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_id_venta UUID;
  v_total NUMERIC(14, 2) := 0;
  v_item JSON;
  v_id_producto UUID;
  v_cantidad INT;
  v_precio NUMERIC(14, 2);
  v_subtotal NUMERIC(14, 2);
BEGIN
  -- 1. Crear el encabezado de la venta (total inicial en 0)
  INSERT INTO ventas(id_cliente, total)
  VALUES (p_id_cliente, 0)
  RETURNING id INTO v_id_venta;

  -- 2. Iterar sobre el array JSON de items
  FOR v_item IN SELECT * FROM json_array_elements(p_items)
  LOOP
    v_id_producto := (v_item->>'id_producto')::UUID;
    v_cantidad := (v_item->>'cantidad')::INT;
    v_precio := (v_item->>'precio_unitario')::NUMERIC;
    v_subtotal := v_cantidad * v_precio;
    
    -- Insertar el detalle
    -- NOTA: El trigger trg_actualizar_stock validará y restará el stock automáticamente.
    INSERT INTO detalles_venta(id_venta, id_producto, cantidad, precio_unitario, subtotal)
    VALUES (v_id_venta, v_id_producto, v_cantidad, v_precio, v_subtotal);

    -- Sumarizar total
    v_total := v_total + v_subtotal;
  END LOOP;

  -- 3. Actualizar el total en el encabezado
  UPDATE ventas
  SET total = v_total
  WHERE id = v_id_venta;

  -- Si no hubo excepciones hasta acá, se hace autocommit en postgres (las funciones actúan en una única transacción de forma implícita).
  -- El control de transacción se garantiza: si hay error (ej. stock), todo hace ROLLBACK automático.
END;
$$;
