-- Esquema de base de datos para TaskFlow
-- Inicializa las tablas principales de usuarios, proyectos y tareas

-- Limpieza inicial (Desarrollo)
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;

-- Tabla de Usuarios
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  DEFAULT 'Administrador',
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Proyectos
CREATE TABLE projects (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'paused', 'finished')),
    priority    VARCHAR(10) NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
    due_date    DATE DEFAULT NULL,
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    deleted_at  TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE tasks (
    id          SERIAL PRIMARY KEY,
    project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'in_progress', 'done')),
    priority    VARCHAR(10) NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
    due_date    DATE,
    tags        TEXT[]                   DEFAULT '{}',
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    deleted_at  TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización de consultas comunes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status     ON tasks(status);
CREATE INDEX idx_tasks_priority   ON tasks(priority);
CREATE INDEX idx_tasks_due_date    ON tasks(due_date);
CREATE INDEX idx_tasks_archived_at ON tasks(archived_at);
CREATE INDEX idx_tasks_deleted_at  ON tasks(deleted_at);

-- Datos iniciales para pruebas (Semilla básica)
-- Usuario demo (contraseña: "demo1234")
INSERT INTO users (name, email, password_hash)
VALUES (
    'Usuario Demo',
    'demo@taskflow.com',
    '$2b$10$rGHkpDFqCLk6nt.0YcHF0.bKTe7K.h0XWdDLFOg9Qjzm.DVrRxO7i'
);

-- Proyectos de ejemplo
INSERT INTO projects (user_id, name, description) VALUES
  (1, 'Rediseño Web', 'Rediseño completo del sitio corporativo incluyendo landing y contacto'),
  (1, 'App Móvil MVP', 'Primera versión de la aplicación nativa para clientes'),
  (1, 'Dashboard Interno', 'Panel de métricas para el equipo de operaciones');

-- Tareas de ejemplo
INSERT INTO tasks (project_id, title, description, status, priority) VALUES
  (1, 'Diseñar wireframes', 'Crear wireframes de baja fidelidad en Figma', 'done', 'high'),
  (1, 'Maquetación de landing', 'Implementar la estructura responsive de la landing', 'in_progress', 'high'),
  (1, 'Redacción de contenidos', 'Definir textos para todas las secciones web', 'todo', 'medium'),
  (1, 'Configuración SEO', 'Ajustar etiquetas meta y sitemap', 'todo', 'low'),
  (2, 'Definir stack tecnológico', 'Elegir entre React Native o Flutter', 'done', 'high'),
  (2, 'Flujo de autenticación', 'Implementar pantallas de login y registro', 'in_progress', 'high'),
  (2, 'Pantalla de perfil', 'Construir vista de edición de perfil', 'todo', 'medium'),
  (3, 'Investigación de librerías', 'Evaluar Chart.js vs Recharts', 'done', 'medium'),
  (3, 'Componente de ingresos', 'Construir gráfico de ingresos mensuales', 'todo', 'high');

