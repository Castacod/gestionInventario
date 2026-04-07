import request from 'supertest';
import { app } from '../src/index';

describe('Proveedores Routes', () => {
  describe('POST /api/proveedores', () => {
    it('should create a supplier successfully', async () => {
      const response = await request(app)
        .post('/api/proveedores')
        .send({
          nombre: 'Proveedor Test',
          contacto: 'contacto@test.com',
          telefono: '123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/proveedores')
        .send({
          nombre: ''
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/proveedores', () => {
    it('should get all suppliers', async () => {
      const response = await request(app)
        .get('/api/proveedores');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/proveedores/:id', () => {
    it('should get a supplier by id', async () => {
      const createResponse = await request(app)
        .post('/api/proveedores')
        .send({
          nombre: 'Proveedor Get Test',
          contacto: 'get@test.com'
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .get(`/api/proveedores/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Proveedor Get Test');
    });
  });

  describe('PUT /api/proveedores/:id', () => {
    it('should update a supplier', async () => {
      const createResponse = await request(app)
        .post('/api/proveedores')
        .send({
          nombre: 'Proveedor Update Test',
          contacto: 'update@test.com'
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .put(`/api/proveedores/${id}`)
        .send({
          nombre: 'Proveedor Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Proveedor Updated');
    });
  });
});