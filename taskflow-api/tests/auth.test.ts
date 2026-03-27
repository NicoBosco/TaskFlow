import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/db';

async function clearUsers() {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM users');
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
}

beforeEach(async () => {
  await clearUsers();
});

afterAll(async () => {
  await pool.end();
});

describe('API de Autenticación', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  };

  describe('POST /api/auth/register', () => {
    it('debe registrar un nuevo usuario y devolver un token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('debe devolver 409 si el usuario ya existe', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Este correo electrónico ya está registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(testUser);
    });

    it('debe iniciar sesión y devolver un token con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('debe devolver 401 para credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe devolver la info del usuario para un token válido', async () => {
      const registerRes = await request(app).post('/api/auth/register').send(testUser);
      const token = registerRes.body.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe(testUser.email);
    });

    it('debe devolver 401 si no se proporciona token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
