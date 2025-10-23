'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import dayjs from 'dayjs';
import { apiFetch, ApiClientError } from '../../lib/api';
import type { QuizSummary } from '../../types/quiz';

const QuizListView = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetch<QuizSummary[]>('/quizzes');
      setQuizzes(data);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.data?.message ?? err.message);
      } else {
        setError('Failed to load quizzes.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  const handleDelete = useCallback(
    async (id: number, event?: MouseEvent<HTMLButtonElement>) => {
      event?.stopPropagation();
      setDeletingId(id);
      try {
        await apiFetch<void>(`/quizzes/${id}`, { method: 'DELETE', parseJson: false });
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== id));
      } catch (err) {
        if (err instanceof ApiClientError) {
          setError(err.data?.message ?? err.message);
        } else {
          setError('Failed to delete quiz.');
        }
      } finally {
        setDeletingId(null);
      }
    },
    []
  );

  const hasQuizzes = useMemo(() => quizzes.length > 0, [quizzes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">Dashboard</p>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Quizzes</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-300">
              Browse your authored quizzes, review their structure, or remove drafts you no longer
              need.
            </p>
          </div>
        </div>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_18px_45px_-30px_rgba(56,189,248,0.85)] transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          New quiz
        </Link>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/65 p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 py-16 text-sm text-slate-300">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400/60 border-t-transparent" />
            Loading quizzes...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-4 text-sm text-red-200">
            {error}
          </div>
        ) : !hasQuizzes ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/40 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-slate-100">No quizzes yet</p>
            <p className="max-w-md text-sm text-slate-400">
              Start by crafting your first quiz. You can mix boolean, short-answer, and multi-select
              questions to match any scenario.
            </p>
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              Create a quiz
            </Link>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {quizzes.map((quiz) => (
              <li
                key={quiz.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/quizzes/${quiz.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    router.push(`/quizzes/${quiz.id}`);
                  }
                }}
                className="group relative flex cursor-pointer flex-col rounded-3xl border border-white/10 bg-slate-950/60 p-6 transition hover:-translate-y-1 hover:border-cyan-400/70 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-cyan-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <button
                  type="button"
                  disabled={deletingId === quiz.id}
                  onClick={(event) => handleDelete(quiz.id, event)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 text-lg font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/30 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Delete ${quiz.title}`}
                >
                  {deletingId === quiz.id ? '…' : '×'}
                </button>
                <div className="space-y-3 pr-4">
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/80">
                    Quiz #{quiz.id}
                  </p>
                  <p className="text-lg font-semibold text-white transition group-hover:text-cyan-300">
                    {quiz.title}
                  </p>
                  <p className="text-xs font-medium uppercase tracking-wide text-cyan-200/80">
                    {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
                  </p>
                  <p className="text-xs text-slate-400">
                    Updated {dayjs(quiz.createdAt).format('MMM D, YYYY • HH:mm')}
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between text-sm text-cyan-300">
                  <span className="font-medium transition group-hover:text-cyan-200">
                    View structure
                  </span>
                  <span aria-hidden className="text-lg transition group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default QuizListView;
