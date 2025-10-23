import { Router } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../prisma';
import {
  createQuizInputSchema,
  mapQuizResponse,
  mapQuizSummaryResponse,
} from '../schema/quizSchema';
import { ZodError } from 'zod';

const router = Router();

router.post('/', async (req, res, next) => {
  try {
    const parsed = createQuizInputSchema.parse(req.body);

    const quiz = await prisma.quiz.create({
      data: {
        title: parsed.title,
        questions: {
          create: parsed.questions.map((question, index) => {
            if (question.type === 'BOOLEAN') {
              return {
                text: question.text,
                type: question.type,
                order: question.order ?? index,
                booleanAnswer: question.booleanAnswer,
                inputAnswer: null,
              };
            }

            if (question.type === 'INPUT') {
              return {
                text: question.text,
                type: question.type,
                order: question.order ?? index,
                inputAnswer: question.inputAnswer.trim(),
                booleanAnswer: null,
              };
            }

            return {
              text: question.text,
              type: question.type,
              order: question.order ?? index,
              booleanAnswer: null,
              inputAnswer: null,
              options: {
                create: question.options.map((option) => ({
                  text: option.text,
                  isCorrect: option.isCorrect,
                })),
              },
            };
          }),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    return res.status(201).json(mapQuizResponse(quiz));
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: 'Invalid data for quiz creation',
        errors: error.flatten(),
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return next(error);
    }

    next(error);
  }
});

router.get('/', async (_req, res, next) => {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { questions: true } } },
    });

    return res.json(quizzes.map(mapQuizSummaryResponse));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ message: 'Invalid quiz identifier' });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return res.json(mapQuizResponse(quiz));
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid quiz identifier' });
    }

    await prisma.quiz.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    return next(error);
  }
});

export default router;
