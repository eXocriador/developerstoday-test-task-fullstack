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
    <div className="space-y-10">
      <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-8 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Quiz overview</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">{quiz.title}</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-300">
              Review the structure and correct answers below before sharing it with players or
              collaborators.
            </p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-3 text-sm text-slate-200">
            <span className="font-semibold text-cyan-300">
              {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
            </span>
            <span className="h-6 w-px bg-white/10" aria-hidden />
            <span>{dayjs(quiz.updatedAt).format('MMM D, YYYY • HH:mm')}</span>
          </div>
        </div>
      </div>

      {quiz.questions.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/65 px-6 py-10 text-center text-sm text-slate-200">
          This quiz has no questions yet. Head back to the builder to add new items.
        </div>
      ) : (
        <div className="grid gap-6">
          {quiz.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-lg shadow-cyan-500/10 transition hover:border-cyan-400/40"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                    Question {index + 1}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">{question.text}</p>
                </div>
                <span
                  className={clsx(
                    'self-start rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide',
                    badgeStyles[question.type] ?? badgeStyles.INPUT
                  )}
                >
                  {question.type.toLowerCase()}
                </span>
              </div>

              {question.type === 'BOOLEAN' && (
                <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Correct answer: {question.booleanAnswer ? 'True' : 'False'}
                </div>
              )}

              {question.type === 'INPUT' && (
                <div className="mt-4 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                  Expected answer:{' '}
                  <span className="font-semibold tracking-wide text-sky-50">
                    {question.inputAnswer}
                  </span>
                </div>
              )}

              {question.type === 'CHECKBOX' && (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium text-slate-200">Answer options</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={clsx(
                          'rounded-xl border px-3.5 py-2 text-sm transition',
                          option.isCorrect
                            ? 'border-fuchsia-400/60 bg-fuchsia-500/15 text-fuchsia-100 shadow shadow-fuchsia-500/10'
                            : 'border-white/10 bg-slate-950/40 text-slate-200'
                        )}
                      >
                        {option.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizDetailView;
