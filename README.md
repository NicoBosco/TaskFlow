# TaskFlow — Gestión de Proyectos Full Stack

**TaskFlow** es una plataforma de gestión de proyectos y tareas desarrollada para demostrar una arquitectura sólida basada en la seguridad, la propiedad de los datos y el cumplimiento de las mejores prácticas de desarrollo full stack.

El repositorio está organizado en dos módulos independientes que conforman el ecosistema de la aplicación:

### [Backend (taskflow-api)](./taskflow-api/README.md)
*   **Core Técnico:** Node.js, Express, PostgreSQL, TypeScript y Jest.
*   **Responsabilidades:** Gestión de persistencia, lógica de negocio, seguridad mediante JWT y aislamiento estricto de recursos por usuario a nivel de base de datos.
*   **Inicio Rápido:**
    ```bash
    cd taskflow-api
    npm install
    npm run dev
    ```

### [Frontend (taskflow-web)](./taskflow-web/README.md)
*   **Core Técnico:** Next.js 16 (App Router), TypeScript, Context API y CSS nativo.
*   **Responsabilidades:** Interfaz de usuario reactiva, protección de rutas (`AuthGuard`), gestión de estados globales de sesión y temas.
*   **Inicio Rápido:**
    ```bash
    cd taskflow-web
    npm install
    npm run dev
    ```

## Arquitectura y Seguridad

1.  **Aislamiento de Recursos:** Implementación de propiedad de datos a nivel de consulta (SQL), garantizando que los usuarios solo operen sobre sus propios registros.
2.  **Seguridad de Sesión:** Sistema de interceptores en el cliente que detecta fallos de autorización (401) y gestiona el cierre de sesión proactivo.
3.  **Entorno de Pruebas Aislado:** Suite de integración que utiliza una base de datos de pruebas independiente, configurada automáticamente mediante un proceso de bootstrapping interno.
4.  **Higiene Documental:** Gestión rigurosa de variables de entorno, exclusiones de Git y protección de secretos.

## Certificación de Calidad

- **Calidad de Código**: 0 problemas de linting en todo el monorepo.
- **Tipado Estricto**: Cobertura total de tipos mediante TypeScript (tsc --noEmit).
- **Cobertura de Pruebas**: Suite de 47 tests integrados pasando exitosamente (30 API + 17 Web).
- **Validación de Datos**: Validación fail-fast de esquemas de entrada mediante Zod y control de flujo de errores.
- **Despliegue Documentado**: Guía completa para producción (Vercel + Render + PostgreSQL).

## Despliegue 🚀

Este monorepo está diseñado para un despliegue desacoplado:
1. **API (Backend)**: Recomendado en **Render** o **Railway** con **NPM_CONFIG_PRODUCTION=false**.
2. **Web (Frontend)**: Optimizado para **Vercel** con variables de entorno para la comunicación con la API.
3. **Database**: Compatible con cualquier instancia de **PostgreSQL** (Neon.tech recomendado).

---

---
## Demo
[https://taskflow-nine-sigma.vercel.app/](https://taskflow-nine-sigma.vercel.app/) 

## Screenshots
### Login
![Login](./docs/login.png)

### Dark mode, vista general de proyectos
![Dark](./docs/darkmode.png)

### Ver Proyecto en modo kanban
![ProyectoKanban](./docs/proyecto.png)

### Ver Proyecto en modo lista
![ProyectoLista](./docs/vista_lista.png)

### Creación de nuevo proyecto
![CNP](./docs/creacion_nuevo_proyecto.png)

### Creación de nueva tarea
![CNT](./docs/creacion_nueva_tarea.png)

### Acciones rápidas
![AR](./docs/acciones_rapidas.png)

### Información del perfil
![INFP](./docs/info_perfil.png)

>## Nota

>Proyecto personal de portfolio de Bosco Mateo Nicolás. Para detalles específicos sobre la configuración de la base de datos o el despliegue de cada módulo, consulta los archivos README dedicados en sus respectivas carpetas.
