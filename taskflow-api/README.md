# Backend API — TaskFlow

Esta es la API REST de TaskFlow, diseñada para gestionar proyectos y tareas con un fuerte enfoque en el aislamiento de datos por usuario y seguridad.

## Stack Técnico

- **Runtime**: Node.js 20+
- **Framework**: Express.js con TypeScript
- **Base de Datos**: PostgreSQL
- **Seguridad**: JWT (JSON Web Tokens) y Bcrypt para el cifrado de contraseñas
- **Validación**: Zod para esquemas de entrada de datos
- **Testing**: Jest con Supertest para pruebas de integración

## Configuración y Entorno

El proyecto usa archivos `.env` para la configuración. Necesitarás definir:

- `PORT`: Puerto de escucha (ej: 3001)
- `DATABASE_URL`: URI de conexión a PostgreSQL
- `JWT_SECRET`: Llave para firmar los tokens de sesión
- `FRONTEND_URL`: URL del cliente para habilitar CORS (en producción)

Consulta `.env.example` y `.env.test.example` para plantillas de configuración.

## Ejecución de Pruebas

La suite de pruebas utiliza **Jest** y **Supertest** para validar el flujo completo de la API.

### Configuración de Entorno de Pruebas (Bootstrap Automático)
1. Crea una base de datos exclusiva para pruebas (ej: `taskflow_test`).
2. La primera vez que ejecutes `npm test`, el sistema copiará automáticamente `.env.test.example` a `.env.test` y ejecutará las migraciones iniciales.
3. Si tus credenciales de Postgres no son las estándar (`postgres/password`), ajusta el archivo `.env.test` generado.

### Comandos de prueba:
```bash
# Ejecuta todos los tests una vez
npm test

# Ejecuta tests en modo 'watch' (ideal para desarrollo)
npm run test:watch
```

> [!CAUTION]
> Los tests ejecutan un proceso de limpieza que vacía las tablas antes de cada suite. **Nunca uses una base de datos de producción o desarrollo importante en `.env.test`.**

## Gestión de Base de Datos

He centralizado las utilidades de mantenimiento en scripts de `npm`:

```bash
# Sincroniza todas las migraciones SQL en la carpeta /migrations
npm run migrate

# Carga datos iniciales (Usuario demo y ejemplos) para desarrollo
npm run seed

# Limpia y reinicia el esquema de la base de datos (Uso con precaución)
npm run reset
```

## Decisiones Técnicas Relevantes

1.  **Aislamiento en Query**: Todas las consultas a nivel de servicio inyectan el `userId` obtenido del token. Esto garantiza que un usuario jamás pueda acceder a proyectos de terceros, incluso si conoce el ID.
2.  **Validación Fail-Fast**: El uso de Middlewares con Zod asegura que los datos erróneos sean rechazados antes de siquiera tocar la lógica de negocio o la base de datos.
3.  **Manejo de Errores Centralizado**: Un middleware global captura y formatea todos los errores, evitando fugas de información sensible del servidor.

## Despliegue en Producción (Render/Railway) 🌐

Para desplegar esta API con éxito:
1. Configura el **Root Directory** como `taskflow-api`.
2. Agrega la variable de entorno `NPM_CONFIG_PRODUCTION=false` para permitir que TypeScript compile durante el build.
3. El **Build Command** debe ser `npm install && npm run build`.
4. El **Pre-deploy Command** recomendado es `npm run migrate`.

## Limitaciones Conocidas

- No implementa recuperación de contraseña por email (se hace vía DB/Admin por ahora).
- La lógica de roles es estructural y visual, sin permisos granulares de momento.
- No cuenta con carga de archivos adjuntos en tareas.

---
> [!NOTE]
> Las credenciales del usuario de demostración están predefinidas en el script de seeding: `demo@taskflow.com` / `123456`.

