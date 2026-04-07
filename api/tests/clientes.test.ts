import request from 'supertest';
import { app } from '../src/index';

describe('Clientes Routes', () => {
  describe('POST /api/clientes', () => {
    it('should create a client successfully', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .send({
          nombre: 'Cliente Test',
          email: 'cliente@test.com',
          telefono: '123456789'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/clientes')
        .send({
          nombre: '',
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/clientes', () => {
    it('should get all clients', async () => {
      const response = await request(app)
        .get('/api/clientes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/clientes/:id', () => {
    it('should get a client by id', async () => {
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nombre: 'Cliente Get Test',
          email: 'get@test.com'
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .get(`/api/clientes/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Cliente Get Test');
    });
  });

  describe('PUT /api/clientes/:id', () => {
    it('should update a client', async () => {
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nombre: 'Cliente Update Test',
          email: 'update@test.com'
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .put(`/api/clientes/${id}`)
        .send({
          nombre: 'Cliente Updated'
        });

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Cliente Updated');
    });
  });

  describe('GET /api/clientes/:id/compras', () => {
    it('should get client purchase history', async () => {
      const createResponse = await request(app)
        .post('/api/clientes')
        .send({
          nombre: 'Cliente Compras Test',
          email: 'compras@test.com'
        });
      const id = createResponse.body.id;

      const response = await request(app)
        .get(`/api/clientes/${id}/compras`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});