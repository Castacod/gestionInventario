import request from 'supertest';
import { app } from '../src/index';

describe('Reportes Routes', () => {
  describe('GET /api/reportes/ventas-diarias', () => {
    it('should get daily sales report', async () => {
      const response = await request(app)
        .get('/api/reportes/ventas-diarias');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/reportes/productos-mas-vendidos', () => {
    it('should get best selling products report', async () => {
      const response = await request(app)
        .get('/api/reportes/productos-mas-vendidos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});