import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().min(3, 'El correo electrónico no es válido').includes('@', { message: 'El correo electrónico no es válido' }),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const loginSchema = z.object({
  // Permitimos mayor flexibilidad en el correo para facilitar pruebas (ej: demo@demo)
  email: z.string().min(3, 'Correo no válido').includes('@', { message: 'Correo no válido' }),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const createProjectSchema = z.object({
  name: z.preprocess((val) => (val === undefined ? '' : val), 
    z.string().min(1, 'El nombre del proyecto es requerido').max(100)
  ),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(['active', 'paused', 'finished']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional().nullable(),
});

export const taskSchema = z.object({
  title: z.preprocess((val) => (val === undefined ? '' : val),
    z.string().min(1, 'El título de la tarea es requerido').max(255)
  ),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().optional().nullable(),
  tags: z.array(z.string().max(30)).max(5).optional(),
});
