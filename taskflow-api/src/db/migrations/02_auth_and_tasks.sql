-- Tareas (v2): Soporte para autenticación y campos extendidos
-- Ejecutar después de schema.sql inicial

-- Tabla de usuarios para autenticación JWT
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campos adicionales para tareas
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS due_date    DATE,
    ADD COLUMN IF NOT EXISTS tags        TEXT[]                    DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Índices para optimizar las nuevas consultas
CREATE INDEX IF NOT EXISTS idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_archived_at ON tasks(archived_at);
CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at  ON tasks(deleted_at);

-- Usuario de demostración (pass: "demo1234")
INSERT INTO users (name, email, password_hash)
VALUES (
    'Demo User',
    'demo@taskflow.com',
    '$2b$10$rGHkpDFqCLk6nt.0YcHF0.bKTe7K.h0XWdDLFOg9Qjzm.DVrRxO7i'
) ON CONFLICT (email) DO NOTHING;
