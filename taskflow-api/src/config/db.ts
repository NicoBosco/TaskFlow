import { Pool } from 'pg';
import { env } from './env';

// Configuración del Pool de PostgreSQL usando el objeto env validado por Zod
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  // En producción (Render + Neon/Supabase/etc.) se necesita SSL
  ssl: env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log('✅ Connected to PostgreSQL');
  }
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL pool error:', err);
  process.exit(1);
});


export default pool;
