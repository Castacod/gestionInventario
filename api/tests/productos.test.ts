import request from 'supertest';
import { app } from '../src/index';

describe('Productos Routes', () => {
  let proveedorId: string;
  let productoId: string;

  beforeEach(async () => {
    // Create a proveedor for testing
    const provResponse = await request(app)
      .post('/api/proveedores')
      .send({
        nombre: 'Proveedor Test',
        contacto: 'contacto@test.com',
        telefono: '123456789'
      });
    proveedorId = provResponse.body.id;
  });

  describe('POST /api/productos', () => {
    it('should create a product successfully', async () => {
      const response = await request(app)
        .post('/api/productos')
        .send({
          id_proveedor: proveedorId,
          nombre: 'Producto Test',
          descripcion: 'Descripción test',
          precio: 100.50,
          stock: 10
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      productoId = response.body.id;
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/productos')
        .send({
          nombre: '',
          precio: -10,
          stock: -5
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/productos', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/productos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/productos/:id', () => {
    it('should get a product by id', async () => {
      const createResponse = await request(app)
        .post('/api/productos')
        .send({
          id_proveedor: proveedorId,
          nombre: 'Producto Get Test',
          precio: 50.00,
          stock: 5
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .get(`/api/productos/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Producto Get Test');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/productos/00000000-0000-0000-0000-000000000000');

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/productos/:id', () => {
    it('should update a product', async () => {
      const createResponse = await request(app)
        .post('/api/productos')
        .send({
          id_proveedor: proveedorId,
          nombre: 'Producto Update Test',
          precio: 75.00,
          stock: 8
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .put(`/api/productos/${id}`)
        .send({
          nombre: 'Producto Updated',
          precio: 80.00
        });

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Producto Updated');
    });
  });

  describe('DELETE /api/productos/:id', () => {
    it('should delete a product', async () => {
      const createResponse = await request(app)
        .post('/api/productos')
        .send({
          id_proveedor: proveedorId,
          nombre: 'Producto Delete Test',
          precio: 25.00,
          stock: 3
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .delete(`/api/productos/${id}`);

      expect(response.status).toBe(200);

      // Verify deletion
      const getResponse = await request(app)
        .get(`/api/productos/${id}`);
      expect(getResponse.status).toBe(404);
    });
  });
});