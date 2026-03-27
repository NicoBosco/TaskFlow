import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import * as subtaskService from '../services/subtaskService';

//Obtiene todas las subtareas de una tarea.
export async function getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const subtasks = await subtaskService.getSubtasksByTask(taskId);
    res.json(subtasks);
  } catch (error) {
    next(error);
  }
}

//Crea una nueva subtarea.
export async function createSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const taskId = parseInt(req.params.taskId, 10);
    const subtask = await subtaskService.createSubtask(taskId, req.body);
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
}

//Actualiza una subtarea.
export async function updateSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const subtask = await subtaskService.updateSubtask(id, req.body);
    if (!subtask) return res.status(404).json({ error: 'Subtarea no encontrada' });
    res.json(subtask);
  } catch (error) {
    next(error);
  }
}

//Elimina una subtarea.
export async function deleteSubtask(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const success = await subtaskService.deleteSubtask(id);
    if (!success) return res.status(404).json({ error: 'Subtarea no encontrada' });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
