import { QuestionType, type Prisma } from '@prisma/client';
import { z } from 'zod';

const optionSchema = z.object({
  text: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const baseQuestionSchema = z.object({
  text: z.string().trim().min(1, 'Question text is required'),
  order: z.number().int().nonnegative().optional(),
});

const booleanQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.BOOLEAN),
  booleanAnswer: z.boolean(),
});

const inputQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.INPUT),
  inputAnswer: z.string().trim().min(1, 'Correct answer is required'),
});

const checkboxQuestionSchema = baseQuestionSchema.extend({
  type: z.literal(QuestionType.CHECKBOX),
  options: z.array(optionSchema).min(2, 'At least two answer options are required'),
});

const questionSchema = z.discriminatedUnion('type', [
  booleanQuestionSchema,
  inputQuestionSchema,
  checkboxQuestionSchema,
]).superRefine((question, ctx) => {
  if (question.type === QuestionType.CHECKBOX) {
    const hasCorrect = question.options.some((option) => option.isCorrect);
    if (!hasCorrect) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Checkbox questions must include at least one correct option',
        path: ['options'],
      });
    }
  }
});

export const createQuizInputSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required'),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

type QuizWithRelations = Prisma.QuizGetPayload<{
  include: { questions: { include: { options: true } } };
}>;

type QuizWithCounts = Prisma.QuizGetPayload<{
  include: { _count: { select: { questions: true } } };
}>;

export const mapQuizResponse = (quiz: QuizWithRelations) => ({
  id: quiz.id,
  title: quiz.title,
  createdAt: quiz.createdAt.toISOString(),
  updatedAt: quiz.updatedAt.toISOString(),
  questions: quiz.questions.map((question) => ({
    id: question.id,
    text: question.text,
    type: question.type,
    order: question.order,
    booleanAnswer: question.booleanAnswer,
    inputAnswer: question.inputAnswer,
    options: question.options.map((option) => ({
      id: option.id,
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  })),
});

export const mapQuizSummaryResponse = (quiz: QuizWithCounts) => ({
  id: quiz.id,
  title: quiz.title,
  questionCount: quiz._count.questions,
  createdAt: quiz.createdAt.toISOString(),
});
