import pool from '../config/db';
import bcrypt from 'bcryptjs';

async function recreateDemoUser() {
  const email = 'demo@taskflow.com';
  const password = '123456'; // Simplificado al máximo
  
  try {
    // Verificación proactiva de conexión
    console.log('🔍 Verificando conexión para limpieza...');
    const bridge = await pool.connect();
    bridge.release();
    console.log('✅ Conexión establecida.');

    console.log('🧹 Limpiando usuario demo existente...');
    await pool.query('DELETE FROM users WHERE email = $1', [email.toLowerCase()]);

    console.log('🔐 Generando hash para "123456"...');
    const hash = await bcrypt.hash(password, 10);

    console.log('👤 Creando nuevo usuario demo...');
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)',
      ['Demo User', email.toLowerCase(), hash]
    );

    console.log('✅ Usuario demo recreado con éxito.');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fatal';
    console.error('❌ Error fatal en reset:', message);
    process.exit(1);
  }
}

recreateDemoUser();
