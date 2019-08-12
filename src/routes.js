import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import BannersController from './app/controllers/BannersController';
import MeetuppController from './app/controllers/MeetuppController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

/**
 * Rotas que precisam passar pelo middleware de autenticação
 */
routes.use(authMiddleware);

routes.put('/users', UserController.update);
routes.get('/users', UserController.index);
routes.post('/meetupp', MeetuppController.store);
routes.get('/meetupp', MeetuppController.index);

routes.post('/files', upload.single('file'), FileController.store);
routes.post('/banner', upload.single('banner'), BannersController.store);

export default routes;
