import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_dev_secret';


let user1Token: string;
let user1Id: number;
let user2Id: number;

async function setupUsers() {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM users');
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE projects_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE tasks_id_seq RESTART WITH 1");

  // Crear Usuario 1
  const u1 = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ('User One', 'user1@test.com', 'hash') RETURNING id"
  );
  user1Id = u1.rows[0].id;
  user1Token = jwt.sign({ userId: user1Id }, JWT_SECRET);

  // Crear Usuario 2
  const u2 = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ('User Two', 'user2@test.com', 'hash') RETURNING id"
  );
  user2Id = u2.rows[0].id;
}

beforeEach(async () => {
  await setupUsers();
});

afterAll(async () => {
  await pool.end();
});


describe('API de Proyectos (Autenticada)', () => {

  describe('GET /api/projects', () => {
    it('debe devolver 401 si no se proporciona token', async () => {
      const res = await request(app).get('/api/projects');
      expect(res.status).toBe(401);
    });

    it('debe devolver un array vacío cuando el usuario no tiene proyectos', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('debe devolver solo los proyectos que pertenecen al usuario autenticado', async () => {
      // Seed de proyecto para usuario 1
      await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'User 1 Project')",
        [user1Id]
      );
      // Seed de proyecto para usuario 2
      await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'User 2 Project')",
        [user2Id]
      );

      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('User 1 Project');
    });
  });

  describe('POST /api/projects', () => {
    it('debe crear un nuevo proyecto para el usuario autenticado', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'New Project', description: 'Description' });

      expect(res.status).toBe(201);
      expect(res.body.user_id).toBe(user1Id);
      expect(res.body.name).toBe('New Project');
    });

    it('debe devolver 400 cuando falta el nombre', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ description: 'No name' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('El nombre del proyecto es requerido');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('debe devolver un proyecto si pertenece al usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'My Project') RETURNING id",
        [user1Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('My Project');
    });

    it('debe devolver 404 si el proyecto pertenece a otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'Other Project') RETURNING id",
        [user2Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Proyecto no encontrado');
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('debe actualizar el proyecto si pertenece al usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'Old Name') RETURNING id",
        [user1Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'New Name' });

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('New Name');
    });

    it('debe devolver 404 al intentar actualizar un proyecto de otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'Secret Project') RETURNING id",
        [user2Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'Hacked name' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('debe eliminar el proyecto si pertenece al usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'To Delete') RETURNING id",
        [user1Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Proyecto eliminado correctamente');

      // Verificar que se haya eliminado
      const check = await pool.query('SELECT * FROM projects WHERE id = $1', [projectId]);
      expect(check.rowCount).toBe(0);
    });

    it('debe devolver 404 al intentar eliminar un proyecto de otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO projects (user_id, name) VALUES ($1, 'Other Project') RETURNING id",
        [user2Id]
      );
      const projectId = insert.rows[0].id;

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });
  });
});

