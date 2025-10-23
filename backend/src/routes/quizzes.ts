import { Router } from 'express';
import {
  createQuizHandler,
  deleteQuizHandler,
  getQuizByIdHandler,
  listQuizzesHandler,
} from '../controllers/quizController';

const router = Router();

router.post('/', createQuizHandler);
router.get('/', listQuizzesHandler);
router.get('/:id', getQuizByIdHandler);
router.delete('/:id', deleteQuizHandler);

export default router;

