import cors from 'cors';
import express, { type Express } from 'express';
import quizzesRouter from './routes/quizzes';
import errorHandler from './middlewares/errorHandler';
import AppError from './errors/AppError';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/quizzes', quizzesRouter);

app.use((_req, _res, next) => {
  next(new AppError(404, 'Route not found'));
});

app.use(errorHandler);

export default app;
