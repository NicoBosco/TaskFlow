import pool from '../config/db';

async function seedDemoData() {
  console.log('🏗️  Iniciando carga de datos de prueba...');
  
  try {
    // Verificación de conexión
    console.log('🔍 Verificando conexión para carga de datos...');
    const bridge = await pool.connect();
    bridge.release();
    console.log('✅ Conexión establecida.');
    
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@taskflow.com']);
    if (userRes.rowCount === 0) {
      console.log('❌ Error: Usuario demo no encontrado.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;

    // Limpieza total para reconstrucción
    await pool.query('DELETE FROM projects WHERE user_id = $1', [userId]);
    console.log('🧹 Limpieza de datos previa completada.');

    // 1. PROYECTOS ACTIVOS
    const activeProjects = [
      { name: '🚀 TaskFlow: Preparación v1.0', desc: 'Tareas pendientes para el lanzamiento oficial. Revisión de infraestructura y ajustes finales de UI.' },
      { name: '⚡ Buscador Global', desc: 'Implementación de barra de comandos para navegación rápida en la plataforma.' },
      { name: '🛠️ Optimizaciones de API', desc: 'Mejoras en el manejo de errores y refactorización del core de la aplicación.' }
    ];

    for (const p of activeProjects) {
      const pRes = await pool.query(
        'INSERT INTO projects (user_id, name, description, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, p.name, p.desc, 'active']
      );
      const pid = pRes.rows[0].id;

      if (p.name.includes('Rumbo a Producción')) {
        const t1 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{infra, dev}') RETURNING id",
          [pid, 'Desplegar Docker en Vercel', 'Hay que ver si el build no explota con las nuevas dependencias.', 'done', 'high']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Armar Dockerfile', true), ($1, 'Configurar logs', true), ($1, 'Variables de entorno', true)", [t1.rows[0].id]);

        const t2 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{frontend}') RETURNING id",
          [pid, 'Refinar Modo Oscuro', 'Ajustar contraste en formularios y asegurar legibilidad en componentes críticos.', 'in_progress', 'high']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Fix inputs login', true), ($1, 'Fondo del dashboard', false), ($1, 'Iconos de la navbar', false)", [t2.rows[0].id]);

        await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{marketing}')",
          [pid, 'Optimización SEO y OpenGraph', 'Configuración de meta-etiquetas para correcta visualización en redes sociales.', 'todo', 'medium']
        );

        const t3 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{pagos}') RETURNING id",
          [pid, 'Módulo de Suscripciones', 'Implementación de pasarela de pagos para funciones extendidas.', 'todo', 'high']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Webhook de eventos', false), ($1, 'Precios en la landing', false), ($1, 'Mails de recibo', false)", [t3.rows[0].id]);
      }

      if (p.name.includes('Barra de Comandos')) {
        const t4 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{ux, front}') RETURNING id",
          [pid, 'Atajo global de teclado (Ctrl+K)', 'done', 'high']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Event listener', true), ($1, 'Estado abierto/cerrado', true)", [t4.rows[0].id]);

        const t5 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{logica}') RETURNING id",
          [pid, 'Buscador con Fuse.js', 'in_progress', 'medium']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Ranking por relevancia', false), ($1, 'Indexar proyectos', true)", [t5.rows[0].id]);

        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{ui}')",
          [pid, 'Efecto de desenfoque en el fondo', 'todo', 'low']
        );
      }

      if (p.name.includes('Mantenimiento Global')) {
        const t6 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{backend}') RETURNING id",
          [pid, 'Caché con Redis', 'done', 'high']
        );
        await pool.query("INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Setup servidor', true), ($1, 'Invalidar al actualizar', true)", [t6.rows[0].id]);

        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{seguridad}')",
          [pid, 'Límite de peticiones (Rate Limit)', 'in_progress', 'medium']
        );
        
        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{dev}')",
          [pid, 'Centralizar logs con Winston', 'todo', 'low']
        );
      }
    }

    // 2. PROYECTO ARCHIVADO (Legacy)
    const pArchived = await pool.query(
      "INSERT INTO projects (user_id, name, description, status, archived_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [userId, '📁 Versión Alpha (PHP/jQuery)', 'La primera versión rudimentaria antes de pasarnos a Node.', 'finished']
    );
    await pool.query(
      "INSERT INTO tasks (project_id, title, status, priority, archived_at) VALUES ($1, $2, $3, $4, NOW()), ($1, $5, $3, $4, NOW())",
      [pArchived.rows[0].id, 'Configurar servidor Apache', 'done', 'low', 'Arreglar scripts de mails']
    );

    // 3. PROYECTO EN PAPELERA (Trash)
    const pTrash = await pool.query(
      "INSERT INTO projects (user_id, name, description, status, deleted_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [userId, '🗑️ Experimento Descartado', 'Prototipo de tableros con tecnología experimental (Cripto).', 'active']
    );
    await pool.query("INSERT INTO tasks (project_id, title, status, deleted_at) VALUES ($1, $2, $3, NOW())", [pTrash.rows[0].id, 'Investigar contratos inteligentes', 'todo']);

    // 4. TAREAS ARCHIVADAS Y ELIMINADAS EN PROYECTO 1
    const mainPidRes = await pool.query('SELECT id FROM projects WHERE user_id = $1 AND name LIKE $2', [userId, '%Rumbo a Producción%']);
    if (mainPidRes.rowCount! > 0) {
      const mainPid = mainPidRes.rows[0].id;
      await pool.query(
        "INSERT INTO tasks (project_id, title, status, archived_at) VALUES ($1, $2, $3, NOW()), ($1, $4, $3, NOW())",
        [mainPid, '📦 Backup de Enero', 'done', '📧 Avisar a los beta testers (v0.5)']
      );
      
      await pool.query(
        "INSERT INTO tasks (project_id, title, status, deleted_at) VALUES ($1, $2, $3, NOW())",
        [mainPid, 'Probar librería vieja de tablas', 'todo']
      );
    }

    console.log('✅ Demo Ultra-Completa sembrada con éxito.');
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('❌ Error fatal en la carga de datos:', message);
    process.exit(1);
  }
}

seedDemoData();
