export const QUESTION_TYPES = ['BOOLEAN', 'INPUT', 'CHECKBOX'] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface QuizOption {
  id: number;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: number;
  text: string;
  type: QuestionType;
  order: number | null;
  booleanAnswer: boolean | null;
  inputAnswer: string | null;
  options: QuizOption[];
}

export interface QuizSummary {
  id: number;
  title: string;
  questionCount: number;
  createdAt: string;
}

export interface QuizDetail {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  questions: QuizQuestion[];
}

export interface ApiError {
  message: string;
  errors?: unknown;
}
