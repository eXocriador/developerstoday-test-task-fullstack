'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { apiFetch, ApiClientError } from '../../lib/api';
import QuestionEditor from './QuestionEditor';
import {
  createEmptyQuestion,
  formSchema,
  type QuizFormValues,
} from './quizFormSchemas';

const QuizBuilderForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        title: '',
        questions: [createEmptyQuestion('initial-question')],
      }),
      []
    ),
  });

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = form;

  const {
    fields: questionFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title.trim(),
        questions: values.questions.map((question, index) => {
          if (question.type === 'BOOLEAN') {
            return {
              text: question.text.trim(),
              type: question.type,
              order: question.order ?? index,
              booleanAnswer: question.booleanAnswer ?? false,
            };
          }

          if (question.type === 'INPUT') {
            return {
              text: question.text.trim(),
              type: question.type,
              order: question.order ?? index,
              inputAnswer: question.inputAnswer?.trim() ?? '',
            };
          }

          return {
            text: question.text.trim(),
            type: question.type,
            order: question.order ?? index,
            options: question.options.map((option) => ({
              text: option.text.trim(),
              isCorrect: option.isCorrect,
            })),
          };
        }),
      };

      const quiz = await apiFetch<{ id: number }>('/quizzes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      reset({
        title: '',
        questions: [createEmptyQuestion()],
      });

      router.push(`/quizzes/${quiz.id}`);
    } catch (error) {
      if (error instanceof ApiClientError) {
        setSubmitError(error.data?.message ?? error.message);
      } else {
        setSubmitError('Failed to create the quiz. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="title"
          className="block text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300/80"
        >
          Quiz title
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Enter quiz title"
          className="mt-3 w-full rounded-2xl border border-white/12 bg-slate-950/65 px-5 py-3.5 text-base text-white placeholder:text-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-rose-300">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Questions</h2>
            <p className="text-xs text-slate-400">
              Add questions and configure their answer types below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append(createEmptyQuestion())}
            className="self-start rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
          >
            Add question
          </button>
        </div>

        {errors.questions?.message && (
          <p className="text-sm text-rose-300">{errors.questions.message}</p>
        )}

        <div className="space-y-6">
          {questionFields.map((field, index) => (
            <QuestionEditor
              key={field.id}
              fieldId={field.id}
              index={index}
              removeQuestion={remove}
              control={control}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          ))}
        </div>
      </div>

      {submitError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {submitError}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating...' : 'Create quiz'}
        </button>
      </div>
    </form>
  );
};

export default QuizBuilderForm;
