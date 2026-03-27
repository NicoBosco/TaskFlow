import pool from '../config/db';
import {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
} from '../types';

// Obtiene todos los proyectos de un usuario con filtros opcionales.

export async function getAll(userId: number, filters: { archived?: boolean; deleted?: boolean } = {}): Promise<Project[]> {
  const { archived = false, deleted = false } = filters;
  
  const filterQuery = deleted 
    ? ` AND p.deleted_at IS NOT NULL`
    : archived 
      ? ` AND p.archived_at IS NOT NULL AND p.deleted_at IS NULL`
      : ` AND p.archived_at IS NULL AND p.deleted_at IS NULL`;

  const query = `
    SELECT 
      p.id, p.user_id, p.name, p.description, p.status, p.priority, p.due_date, p.archived_at, p.deleted_at, p.created_at, p.updated_at,
      COUNT(t.id)::int as total_tasks,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int as completed_tasks
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.user_id = $1
    ${filterQuery}
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;

  const result = await pool.query<Project>(query, [userId]);
  return result.rows;
}

export async function getById(id: number, userId: number): Promise<Project | null> {
  const result = await pool.query<Project>(
    `SELECT 
      p.id, p.user_id, p.name, p.description, p.status, p.priority, p.due_date, p.archived_at, p.deleted_at, p.created_at, p.updated_at,
      COUNT(t.id)::int as total_tasks,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int as completed_tasks
     FROM projects p
     LEFT JOIN tasks t ON p.id = t.project_id
     WHERE p.id = $1 AND p.user_id = $2
     GROUP BY p.id`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function create(
  payload: CreateProjectPayload,
  userId: number
): Promise<Project> {
  const { name, description, status = 'active', priority = 'medium', due_date = null } = payload;

  const result = await pool.query<Project>(
    `INSERT INTO projects (user_id, name, description, status, priority, due_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, user_id, name, description, status, priority, due_date, archived_at, deleted_at, created_at, updated_at`,
    [userId, name, description || null, status, priority, due_date]
  );
  return result.rows[0];
}

export async function update(
  id: number,
  userId: number,
  payload: UpdateProjectPayload
): Promise<Project | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | Date | null)[] = [];
  const updateableFields: (keyof UpdateProjectPayload)[] = [
    'name', 'description', 'status', 'priority', 'due_date', 'archived_at', 'deleted_at'
  ];

  for (const field of updateableFields) {
    if (payload[field] !== undefined) {
      fields.push(`${field} = $${values.length + 1}`);
      values.push(payload[field]);
    }
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  
  values.push(userId);
  const userParamIdx = values.length;
  values.push(id);
  const idParamIdx = values.length;

  const result = await pool.query<Project>(
    `UPDATE projects
     SET ${fields.join(', ')}
     WHERE user_id = $${userParamIdx} AND id = $${idParamIdx}
     RETURNING id, user_id, name, description, status, priority, due_date, archived_at, deleted_at, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}

// --- Gestión de Borrado y Archivo ---

export async function archive(id: number, userId: number): Promise<Project | null> {
  return update(id, userId, { archived_at: new Date(), deleted_at: null });
}

export async function unarchive(id: number, userId: number): Promise<Project | null> {
  return update(id, userId, { archived_at: null });
}

export async function softDelete(id: number, userId: number): Promise<Project | null> {
  return update(id, userId, { deleted_at: new Date() });
}

export async function restore(id: number, userId: number): Promise<Project | null> {
  return update(id, userId, { deleted_at: null });
}

export async function permanentDelete(id: number, userId: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM projects WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  return (result.rowCount ?? 0) > 0;
}
