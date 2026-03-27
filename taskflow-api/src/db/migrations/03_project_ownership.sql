-- Tareas (v3): Vinculación de proyectos por usuario
-- Ejecutar después de migration_v2.sql

BEGIN;

-- Agregamos user_id a proyectos si no existe
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='user_id') THEN
    ALTER TABLE projects ADD COLUMN user_id INTEGER;
  END IF;
END $$;

-- Asignamos proyectos existentes al usuario demo
UPDATE projects SET user_id = (SELECT id FROM users ORDER BY id ASC LIMIT 1) WHERE user_id IS NULL;

-- Relación de clave foránea
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='projects_user_id_fkey' AND table_name='projects') THEN
    ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Forzamos integridad para el dueño del proyecto
ALTER TABLE projects ALTER COLUMN user_id SET NOT NULL;

-- Índice para consultas de pertenencia
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);

COMMIT;

