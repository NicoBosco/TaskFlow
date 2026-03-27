import { Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import * as taskService from '../services/taskService';
import * as projectService from '../services/projectService';
import {
  TaskFilters,
  TaskStatus,
  TaskPriority,
  AuthenticatedRequest,
} from '../types';
import { taskSchema } from '../validations/schemas';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export async function getTasksByProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) throw new AppError('ID de proyecto inválido', 400);

    const project = await projectService.getById(projectId, userId);
    if (!project) throw new AppError('Proyecto no encontrado', 404);

    const { status, priority, search, overdue, due_filter, archived, deleted } = req.query;
    const filters: TaskFilters = {};

    if (status) {
      if (!VALID_STATUSES.includes(status as TaskStatus)) {
        throw new AppError(`Estado inválido. Valores válidos: ${VALID_STATUSES.join(', ')}`, 400);
      }
      filters.status = status as TaskStatus;
    }
    if (priority) {
      if (!VALID_PRIORITIES.includes(priority as TaskPriority)) {
        throw new AppError(`Prioridad inválida. Valores válidos: ${VALID_PRIORITIES.join(', ')}`, 400);
      }
      filters.priority = priority as TaskPriority;
    }
    if (search && typeof search === 'string') {
      filters.search = search.trim();
    }
    if (due_filter && typeof due_filter === 'string') {
      filters.due_filter = due_filter as TaskFilters['due_filter'];
    }
    if (overdue === 'true') filters.overdue = true;
    if (archived === 'true') filters.archived = true;
    if (deleted === 'true') filters.deleted = true;

    const tasks = await taskService.getByProject(projectId, userId, filters);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const task = await taskService.getById(id, userId);
    if (!task) throw new AppError('Tarea no encontrada', 404);
    
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function createTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) throw new AppError('ID de proyecto inválido', 400);

    const result = taskSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.issues[0]?.message || 'Datos de tarea inválidos', 400);
    }

    const task = await taskService.create(projectId, userId, result.data);

    if (!task) throw new AppError('Proyecto no encontrado', 404);

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
}

export async function updateTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);

    const result = taskSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.issues[0]?.message || 'Datos de actualización inválidos', 400);
    }

    if (Object.keys(result.data).length === 0) {
      throw new AppError('Se requiere al menos un campo para actualizar', 400);
    }

    const task = await taskService.update(id, userId, result.data);

    if (!task) throw new AppError('Tarea no encontrada', 404);
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function archiveTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const task = await taskService.archive(id, userId);
    if (!task) throw new AppError('Tarea no encontrada o ya archivada', 404);
    
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function unarchiveTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const task = await taskService.unarchive(id, userId);
    if (!task) throw new AppError('Tarea no encontrada o no está archivada', 404);
    
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const task = await taskService.softDelete(id, userId);
    if (!task) throw new AppError('Tarea no encontrada o ya eliminada', 404);
    
    res.json({ message: 'Tarea eliminada correctamente', task });
  } catch (err) {
    next(err);
  }
}

export async function restoreTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const task = await taskService.restore(id, userId);
    if (!task) throw new AppError('Tarea no encontrada o no está en la papelera', 404);
    
    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function permanentDeleteTask(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de tarea inválido', 400);
    
    const deleted = await taskService.permanentDelete(id, userId);
    if (!deleted) throw new AppError('Tarea no encontrada en la papelera', 404);
    
    res.json({ message: 'Tarea eliminada permanentemente' });
  } catch (err) {
    next(err);
  }
}

export async function getProjectStats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const projectId = parseInt(req.params.projectId, 10);
    if (isNaN(projectId)) throw new AppError('ID de proyecto inválido', 400);

    const stats = await taskService.getStats(projectId, userId);
    if (!stats) throw new AppError('Proyecto no encontrado', 404);

    res.json(stats);
  } catch (err) {
    next(err);
  }
}

