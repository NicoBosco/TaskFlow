# Frontend Web — TaskFlow

Interfaz de gestión de proyectos construida con Next.js 16, enfocada en ofrecer una experiencia fluida, segura y reactiva sin sobrecargar el cliente.

## Stack Técnico

- **Framework**: Next.js 16 con App Router (Turbopack)
- **Estado Global**: React Context API para autenticación y temas
- **Estilos**: Tailwind CSS con sistema de diseño personalizado y animaciones optimizadas
- **Comunicación**: Axios con interceptores para gestión de tokens y errores
- **Drag & Drop**: `@dnd-kit` para el tablero Kanban (columnas arrastrables)
- **Componentes**: Arquitectura basada en componentes reutilizables propios

## Configuración

Crea tu archivo `.env.local` en la raíz siguiendo el ejemplo:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Flujo de Seguridad

1. **AuthContext y Persistencia**: Gestión de tokens en `sessionStorage`. La sesión se mantiene mientras la pestaña esté abierta y se limpia automáticamente al cerrarla.
2. **Protección de Rutas**: Implementación de un `AuthGuard` que intercepta accesos a `/projects` y `/profile`, redirigiendo al login si no hay sesión activa.
3. **Guardia de Invitado**: La página de login detecta sesiones activas y redirige automáticamente al dashboard de proyectos.
4. **Manejo de Sesión Expirada**: El cliente detecta respuestas `401 (Unauthorized)` del servidor y fuerza el cierre de sesión local para mantener la integridad.

## Estructura de Rutas

- `/login` / `/register`: Acceso público.
- `/projects`: Listado y filtrado de proyectos (Activos, Archivados, Papelera).
- `/projects/[id]`: Gestión de tareas, subtareas y estadísticas del proyecto.
- `/profile`: Ajustes de perfil, edición de rol y soporte técnico.

## Decisiones de Diseño

- **Fase de Captura (Keyboard Shortcuts)**: Uso de eventos en fase de captura para el atajo `Ctrl + K`, asegurando que el buscador interno tenga prioridad sobre el navegador.
- **Tailwind CSS**: Implementación de un sistema de diseño mediante utilidades CSS, optimizando el bundle final.
- **URL as State**: La navegación y los filtros de vista se manejan mediante parámetros de URL, permitiendo compartir vistas específicas fácilmente.

## Despliegue (Vercel) 🚀

1. Importa el repositorio y selecciona `taskflow-web` como **Root Directory**.
2. Configura `NEXT_PUBLIC_API_URL` con la URL de tu API desplegada.
3. Vercel detectará automáticamente Next.js y aplicará las optimizaciones de build.

## Limitaciones

- No cuenta con internacionalización (i18n), el idioma es únicamente español.
- No hay pre-renderizado (SSR) de datos protegidos, por seguridad del manejo de tokens en el cliente.
