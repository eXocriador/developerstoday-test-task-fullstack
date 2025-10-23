import type { RequestHandler } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import AppError from '../errors/AppError';
import {
  createQuiz,
  deleteQuiz,
  getQuizById,
  listQuizzes,
  type QuizDetailDto,
  type QuizSummaryDto,
} from '../services/quizService';
import { createQuizSchema, type CreateQuizInput } from '../validators/quizValidator';

type QuizIdParams = ParamsDictionary & { id: string };

export const createQuizHandler: RequestHandler<
  ParamsDictionary,
  QuizDetailDto,
  CreateQuizInput
> = async (req, res, next) => {
  try {
    const payload = createQuizSchema.parse(req.body);
    const quiz = await createQuiz(payload);
    return res.status(201).json(quiz);
  } catch (error) {
    return next(error);
  }
};

export const listQuizzesHandler: RequestHandler<
  ParamsDictionary,
  QuizSummaryDto[]
> = async (_req, res, next) => {
  try {
    const quizzes = await listQuizzes();
    return res.json(quizzes);
  } catch (error) {
    return next(error);
  }
};

export const getQuizByIdHandler: RequestHandler<
  QuizIdParams,
  QuizDetailDto
> = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, 'Invalid quiz identifier');
    }

    const quiz = await getQuizById(id);

    if (!quiz) {
      throw new AppError(404, 'Quiz not found');
    }

    return res.json(quiz);
  } catch (error) {
    return next(error);
  }
};

export const deleteQuizHandler: RequestHandler<QuizIdParams> = async (
  req,
  res,
  next
) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new AppError(400, 'Invalid quiz identifier');
    }

    await deleteQuiz(id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};

