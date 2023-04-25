import { Router } from 'express';
import { usersController } from './controllers/users.controller.js';

export const router = Router();

router.use('/users', usersController);
