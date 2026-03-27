import { Router } from 'express';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  archiveProject,
  unarchiveProject,
  restoreProject,
  permanentDeleteProject,
} from '../controllers/projectController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Todas las rutas de proyectos requieren un token válido
router.use(verifyToken);

// Gestión principal de proyectos
router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', createProject);
router.put('/:id', updateProject);

// Operaciones de ciclo de vida (v4/v5)
router.post('/:id/archive', archiveProject);
router.post('/:id/unarchive', unarchiveProject);
router.post('/:id/restore', restoreProject);
router.delete('/:id', deleteProject); // Envío a papelera
router.delete('/:id/permanent', permanentDeleteProject); // Eliminación física

export default router;
