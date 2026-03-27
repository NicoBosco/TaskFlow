import { Router } from 'express';
import {
  getTasksByProject,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  archiveTask,
  unarchiveTask,
  restoreTask,
  permanentDeleteTask,
  getProjectStats,
} from '../controllers/taskController';
import * as subtaskController from '../controllers/subtaskController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Protección global para tareas
router.use(verifyToken);

// Operaciones dentro del contexto de un proyecto
router.get('/projects/:projectId/tasks', getTasksByProject);
router.post('/projects/:projectId/tasks', createTask);
router.get('/projects/:projectId/stats', getProjectStats);

// Gestión individual de tareas
router.get('/tasks/:id', getTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask); // Borrado lógico

// Acciones de estado (Archivo y Restauración)
router.patch('/tasks/:id/archive', archiveTask);
router.patch('/tasks/:id/unarchive', unarchiveTask);
router.patch('/tasks/:id/restore', restoreTask);
router.delete('/tasks/:id/permanent', permanentDeleteTask);

// Gestión de subtareas (Checklists)
router.get('/tasks/:taskId/subtasks', subtaskController.getSubtasks);
router.post('/tasks/:taskId/subtasks', subtaskController.createSubtask);
router.put('/subtasks/:id', subtaskController.updateSubtask);
router.delete('/subtasks/:id', subtaskController.deleteSubtask);

export default router;

