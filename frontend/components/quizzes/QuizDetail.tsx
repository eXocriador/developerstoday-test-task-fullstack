import clsx from 'clsx';
import dayjs from 'dayjs';
import type { QuizDetail } from '../../types/quiz';

interface QuizDetailProps {
  quiz: QuizDetail;
}

const badgeStyles: Record<string, string> = {
  BOOLEAN: 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/50',
  INPUT: 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/50',
  CHECKBOX: 'bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-400/50',
};

const QuizDetailView = ({ quiz }: QuizDetailProps) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/70">Quiz</p>
        <h1 className="text-3xl font-semibold text-white">{quiz.title}</h1>
        <p className="text-sm text-slate-300">
          Created {dayjs(quiz.createdAt).format('MMMM D, YYYY [at] HH:mm')}
        </p>
      </div>

      <div className="space-y-4">
        {quiz.questions.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-6 text-sm text-slate-200">
            This quiz has no questions yet.
          </div>
        ) : (
          quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-cyan-500/5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase text-slate-400">
                    Question {index + 1}
                  </p>
                  <p className="text-lg font-semibold text-white">{question.text}</p>
                </div>
                <span
                  className={clsx(
                    'self-start rounded-full px-3 py-1 text-xs font-semibold',
                    badgeStyles[question.type] ?? badgeStyles.INPUT
                  )}
                >
                  {question.type.toLowerCase()}
                </span>
              </div>

              {question.type === 'BOOLEAN' && (
                <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
                  Correct answer: {question.booleanAnswer ? 'True' : 'False'}
                </div>
              )}

              {question.type === 'INPUT' && (
                <div className="mt-4 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
                  Expected answer: <span className="font-medium">{question.inputAnswer}</span>
                </div>
              )}

              {question.type === 'CHECKBOX' && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-slate-200">Answer options</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={clsx(
                          'rounded-lg border px-3 py-2 text-sm transition',
                          option.isCorrect
                            ? 'border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-100'
                            : 'border-white/10 bg-slate-950/30 text-slate-200'
                        )}
                      >
                        {option.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuizDetailView;

