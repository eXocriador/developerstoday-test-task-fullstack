export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

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

