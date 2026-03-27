-- MIGRACIÓN 05: SOPORTE PARA SUBTAREAS (CHECKLISTS)
-- Permite desglosar una tarea principal en múltiples pasos accionables.

CREATE TABLE IF NOT EXISTS subtasks (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por tarea
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);

-- Función y Trigger para actualización automática de updated_at
CREATE OR REPLACE FUNCTION update_subtasks_modtime_fn()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_update_subtasks_modtime
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_subtasks_modtime_fn();
