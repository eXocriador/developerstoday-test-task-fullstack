import type { Metadata } from 'next';
import QuizListView from '../../components/quizzes/QuizListView';

export const metadata: Metadata = {
  title: 'Quizzes • Quiz Builder',
};

const QuizzesPage = () => {
  return <QuizListView />;
};

export default QuizzesPage;
