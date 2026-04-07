import request from 'supertest';
import { app } from '../src/index'; // assuming app is exported

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toBe('Usuario creado');
    });

    it('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 for duplicate email', async () => {
      await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password123'
        });

      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'password456'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Email ya registrado');
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app)
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('sessionId');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('should return 400 for invalid input', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid',
          password: 'pass'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});