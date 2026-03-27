import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import { AuthenticatedRequest } from '../types';

import { env } from '../config/env';

// Secreto para validar los tokens (sincronizado con la configuración central)
const JWT_SECRET = env.JWT_SECRET;

//Middleware para proteger rutas privadas.
//Extrae el Bearer token del header Authorization y valida la identidad del usuario.

export function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  // Verificamos que el header exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new AppError('Acceso denegado: Se requiere autenticación', 401));
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validamos la firma del token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    // Inyectamos el ID del usuario en el objeto request para uso posterior
    req.user = { id: decoded.userId };
    next();
  } catch {
    next(new AppError('Sesión inválida o expirada. Por favor, inicia sesión nuevamente.', 401));
  }
}

