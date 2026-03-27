import pool from '../config/db';
import {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  TaskFilters,
  ProjectStats,
} from '../types';

const TASK_SELECT = `
  t.id, t.project_id, t.title, t.description, t.status, t.priority,
  t.due_date, t.tags, t.archived_at, t.deleted_at, t.created_at, t.updated_at
`;

// Obtiene las tareas de un proyecto validando pertenencia
export async function getByProject(
  projectId: number,
  userId: number,
  filters: TaskFilters
): Promise<Task[]> {
  const conditions: string[] = ['t.project_id = $1', 'p.user_id = $2'];
  const values: (string | number | boolean | Date)[] = [projectId, userId];

  if (filters.deleted) {
    conditions.push('t.deleted_at IS NOT NULL');
  } else if (filters.archived) {
    conditions.push('t.archived_at IS NOT NULL');
    conditions.push('t.deleted_at IS NULL');
  } else {
    conditions.push('t.archived_at IS NULL');
    conditions.push('t.deleted_at IS NULL');
  }

  if (filters.status) {
    conditions.push(`t.status = $${values.length + 1}`);
    values.push(filters.status);
  }

  if (filters.priority) {
    conditions.push(`t.priority = $${values.length + 1}`);
    values.push(filters.priority);
  }

  if (filters.search) {
    conditions.push(`t.title ILIKE $${values.length + 1}`);
    values.push(`%${filters.search}%`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filters.overdue || filters.due_filter === 'overdue') {
    conditions.push(`t.due_date IS NOT NULL`);
    conditions.push(`t.due_date < $${values.length + 1}`);
    conditions.push(`t.status != 'done'`);
    values.push(today.toISOString().split('T')[0]);
  } else if (filters.due_filter === 'next3') {
    const next3 = new Date(today);
    next3.setDate(today.getDate() + 3);
    conditions.push(`t.due_date >= $${values.length + 1}`);
    conditions.push(`t.due_date <= $${values.length + 2}`);
    conditions.push(`t.status != 'done'`);
    values.push(today.toISOString().split('T')[0], next3.toISOString().split('T')[0]);
  } else if (filters.due_filter === 'next7') {
    const next3 = new Date(today);
    next3.setDate(today.getDate() + 3);
    const next7 = new Date(today);
    next7.setDate(today.getDate() + 7);
    conditions.push(`t.due_date > $${values.length + 1}`);
    conditions.push(`t.due_date <= $${values.length + 2}`);
    conditions.push(`t.status != 'done'`);
    values.push(next3.toISOString().split('T')[0], next7.toISOString().split('T')[0]);
  } else if (filters.due_filter === 'long') {
    const next7 = new Date(today);
    next7.setDate(today.getDate() + 7);
    conditions.push(`t.due_date > $${values.length + 1}`);
    conditions.push(`t.status != 'done'`);
    values.push(next7.toISOString().split('T')[0]);
  } else if (filters.due_filter === 'none') {
    conditions.push(`t.due_date IS NULL`);
  }

  const result = await pool.query<Task>(
    `SELECT ${TASK_SELECT}
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE ${conditions.join(' AND ')}
     ORDER BY
       CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
       t.due_date ASC NULLS LAST,
       t.created_at DESC`,
    values
  );

  return result.rows;
}

export async function getById(id: number, userId: number): Promise<Task | null> {
  const result = await pool.query<Task>(
    `SELECT ${TASK_SELECT}
     FROM tasks t
     JOIN projects p ON t.project_id = p.id
     WHERE t.id = $1 AND p.user_id = $2`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function create(
  projectId: number,
  userId: number,
  payload: CreateTaskPayload
): Promise<Task | null> {
  // Verificamos que el proyecto pertenezca al usuario antes de insertar
  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  if (projectCheck.rowCount === 0) return null;

  const {
    title,
    description,
    status = 'todo',
    priority = 'medium',
    due_date = null,
    tags = [],
  } = payload;

  const result = await pool.query<Task>(
    `INSERT INTO tasks (project_id, title, description, status, priority, due_date, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, project_id, title, description, status, priority, due_date, tags, archived_at, deleted_at, created_at, updated_at`,
    [projectId, title, description || null, status, priority, due_date, tags]
  );
  return result.rows[0];
}

export async function update(
  id: number,
  userId: number,
  payload: UpdateTaskPayload
): Promise<Task | null> {
  // Actualización dinámica basada en los campos provistos
  const fields: string[] = [];
  const values: (string | string[] | null | number | Date)[] = [];
  let pIndex = 1;

  if (payload.title !== undefined) {
    fields.push(`title = $${pIndex++}`);
    values.push(payload.title);
  }
  if (payload.description !== undefined) {
    fields.push(`description = $${pIndex++}`);
    values.push(payload.description);
  }
  if (payload.status !== undefined) {
    fields.push(`status = $${pIndex++}`);
    values.push(payload.status);
  }
  if (payload.priority !== undefined) {
    fields.push(`priority = $${pIndex++}`);
    values.push(payload.priority);
  }
  if (payload.due_date !== undefined) {
    fields.push(`due_date = $${pIndex++}`);
    values.push(payload.due_date);
  }
  if (payload.tags !== undefined) {
    fields.push(`tags = $${pIndex++}`);
    values.push(payload.tags);
  }
  if (payload.archived_at !== undefined) {
    fields.push(`archived_at = $${pIndex++}`);
    values.push(payload.archived_at);
  }
  if (payload.deleted_at !== undefined) {
    fields.push(`deleted_at = $${pIndex}`);
    values.push(payload.deleted_at);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  
  // Agregamos userId e id para el filtrado seguro
  values.push(userId);
  const userParam = values.length;
  values.push(id);
  const idParam = values.length;

  const result = await pool.query<Task>(
    `UPDATE tasks
     SET ${fields.join(', ')}
     WHERE id = $${idParam} AND project_id IN (SELECT id FROM projects WHERE user_id = $${userParam})
     RETURNING id, project_id, title, description, status, priority, due_date, tags, archived_at, deleted_at, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}

export async function softDelete(id: number, userId: number): Promise<Task | null> {
  return update(id, userId, { deleted_at: new Date() });
}

export async function restore(id: number, userId: number): Promise<Task | null> {
  return update(id, userId, { deleted_at: null });
}

export async function permanentDelete(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM tasks
     WHERE id = $1 AND deleted_at IS NOT NULL
     AND project_id IN (SELECT id FROM projects WHERE user_id = $2)`,
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function archive(id: number, userId: number): Promise<Task | null> {
  return update(id, userId, { archived_at: new Date(), deleted_at: null });
}

export async function unarchive(id: number, userId: number): Promise<Task | null> {
  return update(id, userId, { archived_at: null });
}

export async function getStats(
  projectId: number,
  userId: number
): Promise<ProjectStats | null> {
  // Validamos la propiedad del proyecto
  const projectCheck = await pool.query(
    'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
    [projectId, userId]
  );
  if (projectCheck.rowCount === 0) return null;

  const result = await pool.query(
    `SELECT
       COUNT(*)                                                   AS total,
       COUNT(*) FILTER (WHERE status = 'todo'
         AND archived_at IS NULL AND deleted_at IS NULL)          AS todo,
       COUNT(*) FILTER (WHERE status = 'in_progress'
         AND archived_at IS NULL AND deleted_at IS NULL)          AS in_progress,
       COUNT(*) FILTER (WHERE status = 'done'
         AND archived_at IS NULL AND deleted_at IS NULL)          AS done,
       COUNT(*) FILTER (WHERE due_date IS NOT NULL
         AND due_date < CURRENT_DATE AND status != 'done'
         AND archived_at IS NULL AND deleted_at IS NULL)          AS overdue,
       COUNT(*) FILTER (WHERE archived_at IS NOT NULL
         AND deleted_at IS NULL)                                  AS archived,
       COUNT(*) FILTER (WHERE deleted_at IS NOT NULL)             AS deleted
     FROM tasks
     WHERE project_id = $1`,
    [projectId]
  );

  const row = result.rows[0];
  return {
    total: parseInt(row.total, 10),
    todo: parseInt(row.todo, 10),
    in_progress: parseInt(row.in_progress, 10),
    done: parseInt(row.done, 10),
    overdue: parseInt(row.overdue, 10),
    archived: parseInt(row.archived, 10),
    deleted: parseInt(row.deleted, 10),
  };
}

