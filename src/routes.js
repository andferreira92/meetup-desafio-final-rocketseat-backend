import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import BannersController from './app/controllers/BannersController';
import MeetuppController from './app/controllers/MeetuppController';
import ScheduleController from './app/controllers/ScheduleController';
import SubscriptionController from './app/controllers/SubscriptionController';
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
routes.get('/creator', ScheduleController.index);
routes.get('/meetupp', MeetuppController.index);
routes.put('/meetupp/:id', MeetuppController.update);
routes.delete('/meetupp/:id', MeetuppController.delete);
routes.get('/meetupp/inscription', SubscriptionController.index);
routes.post('/meetupp/:meetupId/inscription', SubscriptionController.store);

routes.post('/files', upload.single('file'), FileController.store);
routes.post('/banner', upload.single('banner'), BannersController.store);

export default routes;
