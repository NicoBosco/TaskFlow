import fs from 'fs';
import path from 'path';
import pool from '../config/db';

//Script de Migraciones.
//Lee todos los archivos .sql en la carpeta migrations y los ejecuta en orden.
 
async function applyMigrations() {
  console.log('🚀 Iniciando sincronización de base de datos...');
  const migrationsDir = path.join(__dirname, '../db/migrations');
  
  try {
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
    
    // Verificación de conexión antes de procesar
    console.log('🔍 Verificando conexión a PostgreSQL...');
    try {
      const bridge = await pool.connect();
      bridge.release();
      console.log('✅ Conexión establecida.');
    } catch (connErr: unknown) {
      const message = connErr instanceof Error ? connErr.message : 'Error desconocido';
      console.error('\n❌ ERROR DE CONEXIÓN A LA BASE DE DATOS');
      console.error('Mensaje técnico:', message);
      console.error('\nSugerencias de resolución:');
      console.error('1. Asegúrate de que PostgreSQL esté instalado y en ejecución.');
      console.error('2. Verifica que la base de datos definida en .env (o .env.test) exista.');
      console.error('3. Comprueba que las credenciales (usuario/password) sean correctas.\n');
      process.exit(1);
    }

    for (const file of files) {
      console.log(`📄 Aplicando migración: ${file}...`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`✅ ${file} aplicada con éxito.`);
      } catch (err: unknown) {
        await client.query('ROLLBACK');
        const message = err instanceof Error ? err.message : 'Error en consulta SQL';
        console.error(`❌ Error en ${file}:`, message);
      } finally {
        client.release();
      }
    }
    
    console.log('✨ Sincronización finalizada.');
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fatal';
    console.error('💥 Error fatal durante las migraciones:', message);
    process.exit(1);
  }
}

applyMigrations();
