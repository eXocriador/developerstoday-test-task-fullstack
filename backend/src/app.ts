import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import quizzesRouter from './routes/quizzes';

const app: Express = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/quizzes', quizzesRouter);

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Response => {
    console.error(error);
    return res.status(500).json({
      message: 'Internal server error. Please try again later.',
    });
  }
);

export default app;
