import { Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import * as projectService from '../services/projectService';
import { AuthenticatedRequest } from '../types';
import { createProjectSchema } from '../validations/schemas';

export async function getProjects(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { archived, deleted } = req.query;
    
    const projects = await projectService.getAll(userId, {
      archived: archived === 'true',
      deleted: deleted === 'true'
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

export async function getProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de proyecto inválido', 400);

    const project = await projectService.getById(id, userId);
    if (!project) throw new AppError('Proyecto no encontrado', 404);

    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function createProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    
    const result = createProjectSchema.safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.issues[0]?.message || 'Datos de proyecto inválidos', 400);
    }

    const project = await projectService.create(result.data, userId);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

export async function updateProject(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) throw new AppError('ID de proyecto inválido', 400);

    const result = createProjectSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw new AppError(result.error.issues[0]?.message || 'Datos de actualización inválidos', 400);
    }

    const project = await projectService.update(id, userId, result.data);
    if (!project) throw new AppError('Proyecto no encontrado', 404);

    res.json(project);
  } catch (err) {
    next(err);
  }
}

export async function archiveProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.archive(parseInt(req.params.id), req.user!.id);
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    res.json(project);
  } catch (err) { next(err); }
}

export async function unarchiveProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.unarchive(parseInt(req.params.id), req.user!.id);
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    res.json(project);
  } catch (err) { next(err); }
}

export async function deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.softDelete(parseInt(req.params.id), req.user!.id);
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    res.json({ message: 'Proyecto movido a la papelera', project });
  } catch (err) { next(err); }
}

export async function restoreProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.restore(parseInt(req.params.id), req.user!.id);
    if (!project) throw new AppError('Proyecto no encontrado', 404);
    res.json(project);
  } catch (err) { next(err); }
}

export async function permanentDeleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const success = await projectService.permanentDelete(parseInt(req.params.id), req.user!.id);
    if (!success) throw new AppError('Proyecto no encontrado', 404);
    res.json({ message: 'Proyecto eliminado permanentemente' });
  } catch (err) { next(err); }
}
