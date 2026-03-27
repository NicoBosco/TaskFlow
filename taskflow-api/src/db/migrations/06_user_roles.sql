-- Migración v5: Agrega el campo de rol a la tabla de usuarios
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'Administrador';
