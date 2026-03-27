import './config/env'; // Validación de entorno al arranque
import { env } from './config/env';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { errorHandler } from './middlewares/errorHandler';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = env.PORT;

// Rate limiting para producción
if (env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Middlewares
app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? env.FRONTEND_URL : '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', taskRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejador de errores global
app.use(errorHandler);

if (env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor listo en puerto ${PORT} (${env.NODE_ENV})`);
  });
}

export default app;
