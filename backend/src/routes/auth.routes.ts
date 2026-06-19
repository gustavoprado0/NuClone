import { Router } from 'express'
import { register, login, me, getUsers, sendPix } from '../controllers/auth.controller'
import { authMiddleware } from '../middlewares/auth.middleware'

const router = Router()

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.get('/users', getUsers);
router.post("/pix", authMiddleware, sendPix);



export default router