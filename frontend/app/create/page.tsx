import type { Metadata } from 'next';
import QuizBuilderForm from '../../components/create/QuizBuilderForm';

export const metadata: Metadata = {
  title: 'Create Quiz • Quiz Builder',
};

const CreateQuizPage = () => {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Builder</p>
        <h1 className="text-3xl font-semibold text-white">Create a new quiz</h1>
        <p className="max-w-xl text-sm text-slate-300">
          Craft questions with boolean, text input, or multi-answer checkbox types. Share your
          quiz to collect responses instantly.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10">
        <QuizBuilderForm />
      </div>
    </div>
  );
};

export default CreateQuizPage;

