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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">All Quizzes</h1>
        <p className="text-sm text-slate-300">
          Manage existing quizzes, open details, or remove those you no longer need.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 shadow-2xl shadow-cyan-500/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-300">
            Loading quizzes...
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : !hasQuizzes ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-base font-medium text-slate-200">No quizzes yet.</p>
            <p className="max-w-md text-sm text-slate-400">
              Create your first quiz to start collecting questions and publish them from here.
            </p>
            <Link
              href="/create"
              className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
            >
              Create a quiz
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
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
                className="group flex cursor-pointer flex-col justify-between rounded-2xl border border-white/5 bg-slate-950/40 p-5 transition hover:-translate-y-0.5 hover:border-cyan-400/70 hover:bg-slate-900/70 hover:shadow-lg hover:shadow-cyan-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-white transition group-hover:text-cyan-300">
                        {quiz.title}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-cyan-300/80">
                        {quiz.questionCount} {quiz.questionCount === 1 ? 'question' : 'questions'}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={deletingId === quiz.id}
                      onClick={(event) => handleDelete(quiz.id, event)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400/40 bg-red-500/10 text-lg font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/30 hover:text-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Delete ${quiz.title}`}
                    >
                      {deletingId === quiz.id ? '…' : '×'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    Created {dayjs(quiz.createdAt).format('MMM D, YYYY • HH:mm')}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-cyan-300 transition group-hover:text-cyan-200">
                    View details
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
