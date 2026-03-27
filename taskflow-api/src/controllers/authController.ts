import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler';
import * as authService from '../services/authService';
import { AuthenticatedRequest } from '../types';
import { env } from '../config/env';
import { registerSchema, loginSchema } from '../validations/schemas';

const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = registerSchema.safeParse(req.body);
    
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'Datos de registro inválidos';
      throw new AppError(firstError, 400);
    }

    const { name, email, password } = result.data;

    const user = await authService.registerUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({ token, user });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    if (message === 'EMAIL_TAKEN') {
      next(new AppError('Este correo electrónico ya está registrado', 409));
    } else {
      next(err);
    }
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = loginSchema.safeParse(req.body);
    
    if (!result.success) {
      throw new AppError(result.error.issues[0]?.message || 'Credenciales inválidas', 400);
    }

    const { email, password } = result.data;

    const user = await authService.loginUser({ 
      email: email.trim().toLowerCase(), 
      password 
    });

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await authService.getUserById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado en el sistema', 404);
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { name, role } = req.body;

    const user = await authService.updateUserProfile(userId, { name, role });
    res.json(user);
  } catch (err) {
    next(err);
  }
}
