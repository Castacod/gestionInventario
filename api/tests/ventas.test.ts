import request from 'supertest';
import { app } from '../src/index';
import { query } from '../src/db/postgres';

describe('Ventas Routes', () => {
  let clienteId: string;
  let productoId: string;

  beforeEach(async () => {
    // Create cliente
    const clienteResponse = await request(app)
      .post('/api/clientes')
      .send({
        nombre: 'Cliente Venta Test',
        email: 'venta@test.com'
      });
    clienteId = clienteResponse.body.id;

    // Create proveedor
    const provResponse = await request(app)
      .post('/api/proveedores')
      .send({
        nombre: 'Proveedor Venta Test'
      });
    const proveedorId = provResponse.body.id;

    // Create producto
    const prodResponse = await request(app)
      .post('/api/productos')
      .send({
        id_proveedor: proveedorId,
        nombre: 'Producto Venta Test',
        precio: 50.00,
        stock: 20
      });
    productoId = prodResponse.body.id;
  });

  describe('POST /api/ventas', () => {
    it('should create a sale using stored procedure successfully', async () => {
      const response = await request(app)
        .post('/api/ventas')
        .send({
          id_cliente: clienteId,
          items: [
            {
              id_producto: productoId,
              cantidad: 2,
              precio_unitario: 50.00
            }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id_venta');
      expect(response.body.total).toBe(100.00);
    });

    it('should return 400 for insufficient stock', async () => {
      const response = await request(app)
        .post('/api/ventas')
        .send({
          id_cliente: clienteId,
          items: [
            {
              id_producto: productoId,
              cantidad: 100, // More than stock
              precio_unitario: 50.00
            }
          ]
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Stock insuficiente');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/ventas')
        .send({
          id_cliente: 'invalid-uuid',
          items: []
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/ventas', () => {
    it('should get all sales', async () => {
      const response = await request(app)
        .get('/api/ventas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/ventas/:id', () => {
    it('should get a sale by id', async () => {
      const createResponse = await request(app)
        .post('/api/ventas')
        .send({
          id_cliente: clienteId,
          items: [
            {
              id_producto: productoId,
              cantidad: 1,
              precio_unitario: 50.00
            }
          ]
        });
      const id = createResponse.body.id_venta;

      const response = await request(app)
        .get(`/api/ventas/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.total).toBe(50.00);
    });
  });
});