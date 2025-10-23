'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  useFieldArray,
  useForm,
} from 'react-hook-form';
import { z } from 'zod';
import { apiFetch, ApiClientError } from '../../lib/api';

const QUESTION_TYPES = ['BOOLEAN', 'INPUT', 'CHECKBOX'] as const;

const optionSchema = z.object({
  id: z.string(),
  text: z.string().trim().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

const questionSchema = z
  .object({
    id: z.string(),
    text: z.string().trim().min(1, 'Question text is required'),
    type: z.enum(QUESTION_TYPES),
    order: z.number().int().nonnegative().optional(),
    booleanAnswer: z.boolean().optional(),
    inputAnswer: z.string().trim().min(1, 'Correct answer is required').optional(),
    options: z.array(optionSchema).default([]),
  })
  .superRefine((question, ctx) => {
    if (question.type === 'BOOLEAN' && typeof question.booleanAnswer !== 'boolean') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select the correct answer.',
        path: ['booleanAnswer'],
      });
    }

    if (
      question.type === 'INPUT' &&
      (!question.inputAnswer || question.inputAnswer.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide the expected answer.',
        path: ['inputAnswer'],
      });
    }

    if (question.type === 'CHECKBOX') {
      if (question.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least two answer options.',
          path: ['options'],
        });
      }

      const hasCorrect = question.options.some((option) => option.isCorrect);
      if (!hasCorrect) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mark at least one option as correct.',
          path: ['options'],
        });
      }
    }
  });

const formSchema = z.object({
  title: z.string().trim().min(1, 'Quiz title is required'),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

type QuizFormValues = z.infer<typeof formSchema>;
type QuestionFormValues = z.infer<typeof questionSchema>;

const safeRandomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const createEmptyOption = (): QuestionFormValues['options'][number] => ({
  id: safeRandomId(),
  text: '',
  isCorrect: false,
});

const createEmptyQuestion = (): QuestionFormValues => ({
  id: safeRandomId(),
  text: '',
  type: 'BOOLEAN',
  booleanAnswer: true,
  options: [],
});

interface QuestionEditorProps {
  index: number;
  removeQuestion: (index: number) => void;
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
}

const QuestionEditor = ({
  index,
  removeQuestion,
  control,
  register,
  errors,
  watch,
  setValue,
}: QuestionEditorProps) => {
  const questionType = watch(`questions.${index}.type`);

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
  } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  const optionError = errors.questions?.[index]?.options;
  const textError = errors.questions?.[index]?.text;
  const orderError = errors.questions?.[index]?.order;
  const booleanError = errors.questions?.[index]?.booleanAnswer;
  const inputError = errors.questions?.[index]?.inputAnswer;

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-lg shadow-cyan-500/10">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Question {index + 1}
          </p>
          <input
            {...register(`questions.${index}.text`)}
            placeholder="What is the question?"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          {textError && <p className="mt-2 text-sm text-rose-300">{textError.message}</p>}
        </div>
        <button
          type="button"
          onClick={() => removeQuestion(index)}
          className="rounded-full border border-rose-500/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-400">
            Question type
          </label>
          <select
            {...register(`questions.${index}.type`)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          >
            {QUESTION_TYPES.map((value) => (
              <option key={value} value={value}>
                {value.toLowerCase()}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-400">
            Order (optional)
          </label>
          <input
            type="number"
            min={0}
            {...register(`questions.${index}.order`, { valueAsNumber: true })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          {orderError && <p className="mt-1 text-sm text-rose-300">{orderError.message}</p>}
        </div>
      </div>

      {questionType === 'BOOLEAN' && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Correct answer
          </p>
          <div className="flex gap-3">
            {[true, false].map((value) => {
              const selected = watch(`questions.${index}.booleanAnswer`) === value;
              return (
                <label
                  key={value ? 'true' : 'false'}
                  className={clsx(
                    'flex w-full cursor-pointer items-center justify-center rounded-xl border px-4 py-2 text-sm font-medium transition',
                    selected
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-100'
                      : 'border-white/10 bg-slate-950/30 text-slate-200 hover:border-emerald-400/50'
                  )}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    checked={selected}
                    onChange={() =>
                      setValue(`questions.${index}.booleanAnswer`, value, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {value ? 'True' : 'False'}
                </label>
              );
            })}
          </div>
          {booleanError && <p className="text-sm text-rose-300">{booleanError.message}</p>}
        </div>
      )}

      {questionType === 'INPUT' && (
        <div>
          <label className="text-xs uppercase tracking-widest text-slate-400">
            Expected answer
          </label>
          <input
            {...register(`questions.${index}.inputAnswer`)}
            placeholder="Type the correct answer"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
          />
          {inputError && <p className="mt-1 text-sm text-rose-300">{inputError.message}</p>}
        </div>
      )}

      {questionType === 'CHECKBOX' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-widest text-slate-400">Answer options</p>
            <button
              type="button"
              onClick={() => appendOption(createEmptyOption())}
              className="rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-semibold text-slate-900 transition hover:bg-fuchsia-400"
            >
              Add option
            </button>
          </div>

          {optionFields.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/10 bg-slate-950/20 px-4 py-3 text-sm text-slate-400">
              Add answer options and mark the correct ones.
            </p>
          )}

          <div className="space-y-3">
            {optionFields.map((optionField, optionIndex) => (
              <div
                key={optionField.id}
                className="grid gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4 sm:grid-cols-[1fr_auto_auto]"
              >
                <input
                  {...register(`questions.${index}.options.${optionIndex}.text` as const)}
                  placeholder="Option text"
                  className="w-full rounded-lg border border-white/10 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
                />
                <label className="flex items-center justify-center gap-2 text-xs font-medium text-fuchsia-100">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-500 text-fuchsia-400 focus:ring-fuchsia-400"
                    {...register(
                      `questions.${index}.options.${optionIndex}.isCorrect` as const
                    )}
                  />
                  Correct
                </label>
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="rounded-full border border-rose-400/40 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {optionError && (
            <p className="text-sm text-rose-300">{(optionError as { message?: string })?.message}</p>
          )}
        </div>
      )}
    </div>
  );
};

const QuizBuilderForm = () => {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: useMemo(
      () => ({
        title: '',
        questions: [createEmptyQuestion()],
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

  const { fields: questionFields, append, remove } = useFieldArray({
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
          className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-300"
        >
          Quiz title
        </label>
        <input
          id="title"
          type="text"
          {...register('title')}
          placeholder="Enter quiz title"
          className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
        {errors.title && (
          <p className="mt-2 text-sm text-rose-300">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Questions</h2>
            <p className="text-xs text-slate-400">
              Add questions and configure their answer types below.
            </p>
          </div>
          <button
            type="button"
            onClick={() => append(createEmptyQuestion())}
            className="self-start rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400"
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
