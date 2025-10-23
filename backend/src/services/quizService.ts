import { Prisma, QuestionType } from '@prisma/client';
import prisma from '../prisma';
import AppError from '../errors/AppError';
import type {
  CreateQuizInput,
  QuizWithCounts,
  QuizWithRelations,
} from '../validators/quizValidator';

export interface QuizOptionDto {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestionDto {
  id: number;
  text: string;
  type: QuestionType;
  order: number | null;
  booleanAnswer: boolean | null;
  inputAnswer: string | null;
  options: QuizOptionDto[];
}

export interface QuizDetailDto {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestionDto[];
}

export interface QuizSummaryDto {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
}

const mapQuizQuestion = (question: QuizWithRelations['questions'][number]): QuizQuestionDto => ({
  id: question.id,
  text: question.text,
  type: question.type,
  order: question.order ?? null,
  booleanAnswer: question.booleanAnswer,
  inputAnswer: question.inputAnswer,
  options: question.options.map((option) => ({
    id: option.id,
    text: option.text,
    isCorrect: option.isCorrect,
  })),
});

const mapQuizDetail = (quiz: QuizWithRelations): QuizDetailDto => ({
  id: quiz.id,
  title: quiz.title,
  createdAt: quiz.createdAt.toISOString(),
  updatedAt: quiz.updatedAt.toISOString(),
  questions: quiz.questions.map(mapQuizQuestion),
});

const mapQuizSummary = (quiz: QuizWithCounts): QuizSummaryDto => ({
  id: quiz.id,
  title: quiz.title,
  questionCount: quiz._count.questions,
  createdAt: quiz.createdAt.toISOString(),
});

export const createQuiz = async (payload: CreateQuizInput): Promise<QuizDetailDto> => {
  const quiz = await prisma.quiz.create({
    data: {
      title: payload.title,
      questions: {
        create: payload.questions.map((question, index) => {
          if (question.type === 'BOOLEAN') {
            return {
              text: question.text,
              type: question.type,
              order: question.order ?? index,
              booleanAnswer: question.booleanAnswer,
            };
          }

          if (question.type === 'INPUT') {
            return {
              text: question.text,
              type: question.type,
              order: question.order ?? index,
              inputAnswer: question.inputAnswer,
            };
          }

          return {
            text: question.text,
            type: question.type,
            order: question.order ?? index,
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
        include: { options: true },
        orderBy: { order: 'asc' },
      },
    },
  });

  return mapQuizDetail(quiz);
};

export const listQuizzes = async (): Promise<QuizSummaryDto[]> => {
  const quizzes = await prisma.quiz.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { questions: true } } },
  });

  return quizzes.map(mapQuizSummary);
};

export const getQuizById = async (id: number): Promise<QuizDetailDto | null> => {
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
    return null;
  }

  return mapQuizDetail(quiz);
};

export const deleteQuiz = async (id: number): Promise<void> => {
  try {
    await prisma.quiz.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError(404, 'Quiz not found');
    }
    throw error;
  }
};
