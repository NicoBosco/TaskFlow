import { Request, Response, NextFunction } from 'express';

// Clase personalizada para capturar errores operativos con códigos de estado HTTP
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
    // Capturamos el stack trace para facilitar la depuración
    Error.captureStackTrace(this, this.constructor);
  }
}

//Middleware central de manejo de errore. Debe ser el último middleware registrado en app.ts.
 
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // 1. Errores conocidos de la aplicación (incluye AppError y fallos con código de estado)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // 2. Errores con estructura statusCode/message (compatibilidad manual)
  if (err && typeof err === 'object' && 'statusCode' in err && 'message' in err) {
    const error = err as { statusCode: number; message: string };
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  // 3. Manejo de errores de base de datos (PostgreSQL)
  if (err && typeof err === 'object' && 'code' in err) {
    const dbError = err as { code: string };
    
    // Violación de restricción CHECK (ej: status o priority inválidos)
    if (dbError.code === '23514') {
      res.status(400).json({ error: 'Valores de estado o prioridad no permitidos' });
      return;
    }

    // Violación de clave foránea (ej: proyecto inexistente)
    if (dbError.code === '23503') {
      res.status(404).json({ error: 'El recurso referenciado no existe' });
      return;
    }

    // Error de formato de datos (ej: ID no numérico cuando se espera uno)
    if (dbError.code === '22P02') {
      res.status(400).json({ error: 'Formato de datos inválido' });
      return;
    }
  }

  // 4. Error inesperado (500)
  console.error(`[ERROR NO CONTROLADO] ${req.method} ${req.url}:`, err);
  res.status(500).json({ error: 'Error interno del servidor. Por favor, reintenta más tarde.' });
}
