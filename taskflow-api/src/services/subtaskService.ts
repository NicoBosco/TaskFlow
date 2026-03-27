import pool from '../config/db';
import { Subtask, CreateSubtaskPayload, UpdateSubtaskPayload } from '../types';

//Obtiene todas las subtareas de una tarea específica.
export async function getSubtasksByTask(taskId: number): Promise<Subtask[]> {
  const result = await pool.query<Subtask>(
    `SELECT id, task_id, title, is_completed, created_at, updated_at
     FROM subtasks
     WHERE task_id = $1
     ORDER BY created_at ASC`,
    [taskId]
  );
  return result.rows;
}

//Crea una nueva subtarea.
export async function createSubtask(taskId: number, payload: CreateSubtaskPayload): Promise<Subtask> {
  const { title } = payload;
  const result = await pool.query<Subtask>(
    `INSERT INTO subtasks (task_id, title)
     VALUES ($1, $2)
     RETURNING id, task_id, title, is_completed, created_at, updated_at`,
    [taskId, title]
  );
  return result.rows[0];
}

//Actualiza una subtarea (título o estado de completado).
export async function updateSubtask(id: number, payload: UpdateSubtaskPayload): Promise<Subtask | null> {
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  if (payload.title !== undefined) {
    fields.push(`title = $${values.length + 1}`);
    values.push(payload.title);
  }
  if (payload.is_completed !== undefined) {
    fields.push(`is_completed = $${values.length + 1}`);
    values.push(payload.is_completed);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(id);
  const idParamIdx = values.length;

  const result = await pool.query<Subtask>(
    `UPDATE subtasks
     SET ${fields.join(', ')}
     WHERE id = $${idParamIdx}
     RETURNING id, task_id, title, is_completed, created_at, updated_at`,
    values
  );

  return result.rows[0] || null;
}

//Elimina una subtarea permanentemente.
export async function deleteSubtask(id: number): Promise<boolean> {
  const result = await pool.query(`DELETE FROM subtasks WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
