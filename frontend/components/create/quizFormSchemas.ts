import { z } from 'zod';
import { QUESTION_TYPES } from '../../types/quiz';

const safeRandomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

export const optionSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

export const questionSchema = z
  .object({
    id: z.string(),
    text: z.string().trim().min(1, 'Question text is required'),
    type: z.enum(QUESTION_TYPES),
    order: z.number().int().nonnegative().optional(),
    booleanAnswer: z.boolean().optional(),
    inputAnswer: z.string().trim().min(1, 'Correct answer is required').optional(),
    options: z.array(optionSchema).default([]),
  })
  .superRefine((question, ctx) => {
    if (question.type === 'BOOLEAN' && typeof question.booleanAnswer !== 'boolean') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select the correct answer.',
        path: ['booleanAnswer'],
      });
    }

    if (
      question.type === 'INPUT' &&
      (!question.inputAnswer || question.inputAnswer.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide the expected answer.',
        path: ['inputAnswer'],
      });
    }

    if (question.type === 'CHECKBOX') {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least two answer options.',
          path: ['options'],
        });
      }

      const hasCorrect = question.options.some((option) => option.isCorrect);
      if (!hasCorrect) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mark at least one option as correct.',
          path: ['options'],
        });
      }
    }
  });

export const formSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required'),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

export type QuizFormValues = z.infer<typeof formSchema>;
export type QuestionFormValues = z.infer<typeof questionSchema>;

export const createEmptyOption = (): QuestionFormValues['options'][number] => ({
  id: safeRandomId(),
  text: '',
  isCorrect: false,
});

export const createEmptyQuestion = (id?: string): QuestionFormValues => ({
  id: id ?? safeRandomId(),
  text: '',
  type: 'BOOLEAN',
  booleanAnswer: true,
  options: [],
});
