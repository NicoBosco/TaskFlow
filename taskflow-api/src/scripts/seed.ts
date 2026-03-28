import pool from '../config/db';

async function seedDemoData() {
  console.log('Iniciando carga de datos de demo...');
  
  try {
    console.log('Verificando conexión...');
    const bridge = await pool.connect();
    bridge.release();
    console.log('Conexión OK.');
    
    const userRes = await pool.query('SELECT id FROM users WHERE email = $1', ['demo@taskflow.com']);
    if (userRes.rowCount === 0) {
      console.log('Error: usuario demo no encontrado. Ejecutá primero las migraciones.');
      process.exit(1);
    }
    const userId = userRes.rows[0].id;

    // Limpieza previa
    await pool.query('DELETE FROM projects WHERE user_id = $1', [userId]);
    console.log('Datos previos eliminados.');

    // 1. PROYECTOS ACTIVOS
    const activeProjects = [
      {
        name: '🚀 TaskFlow v1.0',
        desc: 'Tareas pendientes para el lanzamiento. Revisión de infraestructura y ajustes de UI.'
      },
      {
        name: '⚡ Buscador Global',
        desc: 'Barra de comandos para navegación rápida dentro de la app.'
      },
      {
        name: '🛠️ Optimizaciones de API',
        desc: 'Mejoras en manejo de errores y refactorización de endpoints.'
      }
    ];

    for (const p of activeProjects) {
      const pRes = await pool.query(
        'INSERT INTO projects (user_id, name, description, status) VALUES ($1, $2, $3, $4) RETURNING id',
        [userId, p.name, p.desc, 'active']
      );
      const pid = pRes.rows[0].id;

      if (p.name.includes('TaskFlow')) {
        const t1 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{infra, dev}') RETURNING id",
          [pid, 'Deploy en producción', 'Verificar que el build pase con las nuevas dependencias.', 'done', 'high']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Armar Dockerfile', true), ($1, 'Configurar logs', true), ($1, 'Variables de entorno', true)",
          [t1.rows[0].id]
        );

        const t2 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{frontend}') RETURNING id",
          [pid, 'Refinar modo oscuro', 'Ajustar contraste en formularios y revisar legibilidad en los componentes.', 'in_progress', 'high']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Inputs del login', true), ($1, 'Fondo del dashboard', false), ($1, 'Iconos de la navbar', false)",
          [t2.rows[0].id]
        );

        await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{marketing}')",
          [pid, 'SEO y OpenGraph', 'Configurar meta-tags para que los links se vean bien al compartirlos.', 'todo', 'medium']
        );

        const t3 = await pool.query(
          "INSERT INTO tasks (project_id, title, description, status, priority, tags) VALUES ($1, $2, $3, $4, $5, '{pagos}') RETURNING id",
          [pid, 'Módulo de suscripciones', 'Integrar una pasarela de pagos para el plan pago.', 'todo', 'high']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Webhook de Stripe', false), ($1, 'Página de precios', false), ($1, 'Mails de confirmación', false)",
          [t3.rows[0].id]
        );
      }

      if (p.name.includes('Buscador')) {
        const t4 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{ux, front}') RETURNING id",
          [pid, 'Atajo de teclado Ctrl+K', 'done', 'high']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Event listener global', true), ($1, 'Estado abierto/cerrado', true)",
          [t4.rows[0].id]
        );

        const t5 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{logica}') RETURNING id",
          [pid, 'Búsqueda con Fuse.js', 'in_progress', 'medium']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Ranking por relevancia', false), ($1, 'Indexar proyectos', true)",
          [t5.rows[0].id]
        );

        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{ui}')",
          [pid, 'Backdrop blur en el overlay', 'todo', 'low']
        );
      }

      if (p.name.includes('Optimizaciones')) {
        const t6 = await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{backend}') RETURNING id",
          [pid, 'Caché con Redis', 'done', 'high']
        );
        await pool.query(
          "INSERT INTO subtasks (task_id, title, is_completed) VALUES ($1, 'Setup del servidor', true), ($1, 'Invalidar caché al actualizar', true)",
          [t6.rows[0].id]
        );

        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{seguridad}')",
          [pid, 'Rate limiting en endpoints', 'in_progress', 'medium']
        );
        
        await pool.query(
          "INSERT INTO tasks (project_id, title, status, priority, tags) VALUES ($1, $2, $3, $4, '{dev}')",
          [pid, 'Logs centralizados con Winston', 'todo', 'low']
        );
      }
    }

    // 2. PROYECTO ARCHIVADO
    const pArchived = await pool.query(
      "INSERT INTO projects (user_id, name, description, status, archived_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [userId, '📁 Versión Alpha (PHP/jQuery)', 'La primera versión antes de migrar a Node. Archivada como referencia.', 'finished']
    );
    await pool.query(
      "INSERT INTO tasks (project_id, title, status, priority, archived_at) VALUES ($1, $2, $3, $4, NOW()), ($1, $5, $3, $4, NOW())",
      [pArchived.rows[0].id, 'Configurar servidor Apache', 'done', 'low', 'Arreglar scripts de envío de mails']
    );

    // 3. PROYECTO EN PAPELERA
    const pTrash = await pool.query(
      "INSERT INTO projects (user_id, name, description, status, deleted_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id",
      [userId, '🗑️ Prototipo Descartado', 'Tablero experimental que no llegó a ningún lado. Pendiente de limpieza.', 'active']
    );
    await pool.query(
      "INSERT INTO tasks (project_id, title, status, deleted_at) VALUES ($1, $2, $3, NOW())",
      [pTrash.rows[0].id, 'Investigar alternativas de BD grafo', 'todo']
    );

    // 4. TAREAS ARCHIVADAS Y ELIMINADAS EN PROYECTO PRINCIPAL
    const mainPidRes = await pool.query(
      'SELECT id FROM projects WHERE user_id = $1 AND name LIKE $2',
      [userId, '%TaskFlow%']
    );
    if (mainPidRes.rowCount! > 0) {
      const mainPid = mainPidRes.rows[0].id;
      await pool.query(
        "INSERT INTO tasks (project_id, title, status, archived_at) VALUES ($1, $2, $3, NOW()), ($1, $4, $3, NOW())",
        [mainPid, 'Backup de enero', 'done', 'Avisar a los beta testers (v0.5)']
      );
      
      await pool.query(
        "INSERT INTO tasks (project_id, title, status, deleted_at) VALUES ($1, $2, $3, NOW())",
        [mainPid, 'Probar librería vieja de tablas', 'todo']
      );
    }

    console.log('Demo data cargada correctamente.');
    process.exit(0);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Error al cargar demo data:', message);
    process.exit(1);
  }
}

seedDemoData();
