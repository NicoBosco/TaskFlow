import { Router } from 'express';
import { register, login, getMe, updateMe } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

// Rutas públicas de autenticación
router.post('/register', register);
router.post('/login', login);

// Perfil del usuario autenticado
router.get('/me', verifyToken, getMe);
router.patch('/me', verifyToken, updateMe);

export default router;
