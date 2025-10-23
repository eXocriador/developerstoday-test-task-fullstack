import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import QuizDetailView from '../../../components/quizzes/QuizDetail';
import { apiFetch, ApiClientError } from '../../../lib/api';
import type { QuizDetail } from '../../../types/quiz';

interface QuizDetailPageProps {
  params: Promise<{ id: string }>;
}

export const generateMetadata = async ({
  params,
}: QuizDetailPageProps): Promise<Metadata> => {
  const { id } = await params;

  try {
    const quiz = await apiFetch<QuizDetail>(`/quizzes/${id}`);
    return {
      title: `${quiz.title} • Quiz Builder`,
    };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return { title: 'Quiz not found • Quiz Builder' };
    }
    return { title: 'Quiz • Quiz Builder' };
  }
};

const QuizDetailPage = async ({ params }: QuizDetailPageProps) => {
  const { id } = await params;

  let quiz: QuizDetail;

  try {
    quiz = await apiFetch<QuizDetail>(`/quizzes/${id}`);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <QuizDetailView quiz={quiz} />;
};

export default QuizDetailPage;
