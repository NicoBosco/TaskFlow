import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/db';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_dev_secret';

// ─── Setup ─────────────────────────────────────────────────────────────────

let user1Token: string;
let user1Id: number;
let user2Id: number;
let user1ProjectId: number;
let user2ProjectId: number;

async function setupTestData() {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM projects');
  await pool.query('DELETE FROM users');
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE projects_id_seq RESTART WITH 1");
  await pool.query("ALTER SEQUENCE tasks_id_seq RESTART WITH 1");

  // User 1
  const u1 = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ('User One', 'user1@test.com', 'hash') RETURNING id"
  );
  user1Id = u1.rows[0].id;
  user1Token = jwt.sign({ userId: user1Id }, JWT_SECRET);

  const p1 = await pool.query(
    "INSERT INTO projects (user_id, name) VALUES ($1, 'User 1 Project') RETURNING id",
    [user1Id]
  );
  user1ProjectId = p1.rows[0].id;

  // User 2
  const u2 = await pool.query(
    "INSERT INTO users (name, email, password_hash) VALUES ('User Two', 'user2@test.com', 'hash') RETURNING id"
  );
  user2Id = u2.rows[0].id;

  const p2 = await pool.query(
    "INSERT INTO projects (user_id, name) VALUES ($1, 'User 2 Project') RETURNING id",
    [user2Id]
  );
  user2ProjectId = p2.rows[0].id;
}

beforeEach(async () => {
  await setupTestData();
});

afterAll(async () => {
  await pool.end();
});

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('API de Tareas (Autenticada)', () => {

  describe('POST /api/projects/:projectId/tasks', () => {
    it('debe crear una tarea en un proyecto propiedad del usuario', async () => {
      const res = await request(app)
        .post(`/api/projects/${user1ProjectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'User 1 Task' });

      expect(res.status).toBe(201);
      expect(res.body.project_id).toBe(user1ProjectId);
      expect(res.body.title).toBe('User 1 Task');
    });

    it('debe devolver 404 si el proyecto pertenece a otro usuario', async () => {
      const res = await request(app)
        .post(`/api/projects/${user2ProjectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'Stealing project' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Proyecto no encontrado');
    });
  });

  describe('GET /api/projects/:projectId/tasks', () => {
    beforeEach(async () => {
      await pool.query(`
        INSERT INTO tasks (project_id, title, status) VALUES
          (${user1ProjectId}, 'Task A', 'todo'),
          (${user1ProjectId}, 'Task B', 'done'),
          (${user2ProjectId}, 'Secret Task', 'todo')
      `);
    });

    it('debe devolver solo las tareas de proyectos propiedad del usuario', async () => {
      const res = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].title).not.toBe('Secret Task');
    });

    it('debe filtrar tareas por estado', async () => {
      const res = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks?status=done`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].status).toBe('done');
    });

    it('debe filtrar tareas por rangos cronológicos de vencimiento', async () => {
      // Insert tasks with specific dates relative to NOW
      await pool.query(`
        INSERT INTO tasks (project_id, title, due_date) VALUES
          (${user1ProjectId}, 'Overdue Task', CURRENT_DATE - INTERVAL '1 day'),
          (${user1ProjectId}, 'Today Task', CURRENT_DATE),
          (${user1ProjectId}, 'Soon Task', CURRENT_DATE + INTERVAL '2 days'),
          (${user1ProjectId}, 'NextWeek Task', CURRENT_DATE + INTERVAL '5 days'),
          (${user1ProjectId}, 'LongTerm Task', CURRENT_DATE + INTERVAL '10 days'),
          (${user1ProjectId}, 'NoDate Task', NULL)
      `);

      // 1. Test next3 (0 to 3 days) -> Today, Soon
      const res3 = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks?due_filter=next3`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(res3.body.length).toBe(2);
      expect(res3.body.map((t: { title: string }) => t.title)).toContain('Today Task');
      expect(res3.body.map((t: { title: string }) => t.title)).toContain('Soon Task');

      // 2. Test long (> 7 days) -> LongTerm
      const resLong = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks?due_filter=long`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(resLong.body.length).toBe(1);
      expect(resLong.body[0].title).toBe('LongTerm Task');

      // 3. Test none -> NoDate + Task A & B (from beforeEach)
      const resNone = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks?due_filter=none`)
        .set('Authorization', `Bearer ${user1Token}`);
      // Task A and Task B have no due_date (inserted in beforeEach), plus NoDate Task
      expect(resNone.body.some((t: { title: string }) => t.title === 'NoDate Task')).toBe(true);
    });

    it('debe devolver 404 si el proyecto es de otro usuario', async () => {
      const res = await request(app)
        .get(`/api/projects/${user2ProjectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('debe devolver la tarea si el proyecto padre pertenece al usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, 'My Task') RETURNING id",
        [user1ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('My Task');
    });

    it('debe devolver 404 si la tarea pertenece al proyecto de otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, 'Other Task') RETURNING id",
        [user2ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('debe actualizar la tarea si la propiedad es válida', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title, status) VALUES ($1, 'Old Title', 'todo') RETURNING id",
        [user1ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ title: 'New Title', status: 'done' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.status).toBe('done');
    });

    it('debe devolver 404 al actualizar una tarea de otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, 'Some Task') RETURNING id",
        [user2ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ status: 'done' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('debe realizar un borrado lógico de la tarea si la propiedad es válida', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, 'Bye bye') RETURNING id",
        [user1ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Tarea eliminada correctamente');
      expect(res.body.task.deleted_at).toBeDefined();

      // Verify it's NOT in the list
      const listRes = await request(app)
        .get(`/api/projects/${user1ProjectId}/tasks`)
        .set('Authorization', `Bearer ${user1Token}`);
      
      const deletedTaskInList = listRes.body.find((t: { id: number }) => t.id === taskId);
      expect(deletedTaskInList).toBeUndefined();
    });

    it('debe devolver 404 si se intenta eliminar una tarea de otro usuario', async () => {
      const insert = await pool.query(
        "INSERT INTO tasks (project_id, title) VALUES ($1, 'Safe task') RETURNING id",
        [user2ProjectId]
      );
      const taskId = insert.rows[0].id;

      const res = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('Cálculo de estadísticas (Propiedad)', () => {
    it('debe devolver estadísticas solo para el proyecto del usuario', async () => {
      await pool.query(`
        INSERT INTO tasks (project_id, title, status) VALUES
          (${user1ProjectId}, 'T1', 'done'),
          (${user1ProjectId}, 'T2', 'todo'),
          (${user2ProjectId}, 'T3', 'done')
      `);

      const res = await request(app)
        .get(`/api/projects/${user1ProjectId}/stats`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.done).toBe(1);
    });
  });
});

