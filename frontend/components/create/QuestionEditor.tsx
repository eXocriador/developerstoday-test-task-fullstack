import clsx from 'clsx';
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch,
  useFieldArray,
} from 'react-hook-form';
import { QUESTION_TYPES } from '../../types/quiz';
import {
  createEmptyOption,
  type QuizFormValues,
} from './quizFormSchemas';

interface QuestionEditorProps {
  fieldId: string;
  index: number;
  removeQuestion: (index: number) => void;
  control: Control<QuizFormValues>;
  register: UseFormRegister<QuizFormValues>;
  errors: FieldErrors<QuizFormValues>;
  watch: UseFormWatch<QuizFormValues>;
  setValue: UseFormSetValue<QuizFormValues>;
}

const QuestionEditor = ({
  fieldId,
  index,
  removeQuestion,
  control,
  register,
  errors,
  watch,
  setValue,
}: QuestionEditorProps) => {
  const questionType = watch(`questions.${index}.type`);
  const typeFieldId = `question-${fieldId}-type`;
  const orderFieldId = `question-${fieldId}-order`;
  const inputFieldId = `question-${fieldId}-input`;

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
    <div className="space-y-6 rounded-3xl border border-white/12 bg-slate-950/70 p-6 shadow-xl shadow-cyan-500/10 transition hover:border-cyan-400/30">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full">
          <div className="flex items-center gap-3">
            <p className="text-[0.65rem] uppercase tracking-[0.4em] text-cyan-300/70">
              Question #{index + 1}
            </p>
            <button
              type="button"
              onClick={() => removeQuestion(index)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 text-lg text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/25 hover:text-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              aria-label={`Remove question ${index + 1}`}
            >
              ×
            </button>
          </div>
          <input
            {...register(`questions.${index}.text`)}
            placeholder="What is the question?"
            className="mt-3 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-3 text-base text-white placeholder:text-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
          {textError && (
            <p className="text-sm text-rose-300">{textError.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={typeFieldId}
            className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400"
          >
            Question type
          </label>
          <div className="group relative mt-2">
            <select
              id={typeFieldId}
              {...register(`questions.${index}.type`)}
              className="w-full appearance-none rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-2.5 text-sm text-white transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
            >
              {QUESTION_TYPES.map((value) => (
                <option key={value} value={value}>
                  {value.toLowerCase()}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400 transition duration-150 group-focus-within:text-cyan-300">
              ▾
            </span>
          </div>
        </div>
        <div>
          <label
            htmlFor={orderFieldId}
            className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400"
          >
            Order (optional)
          </label>
          <input
            type="number"
            min={0}
            id={orderFieldId}
            {...register(`questions.${index}.order`, { valueAsNumber: true })}
            className="mt-2 w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-2.5 text-sm text-white transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
          {orderError && (
            <p className="mt-1 text-sm text-rose-300">{orderError.message}</p>
          )}
        </div>
      </div>

      {questionType === 'BOOLEAN' && (
        <div className="space-y-3">
          <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
            Correct answer
          </p>
          <div className="flex gap-4">
            {[true, false].map((value) => {
              const selected =
                watch(`questions.${index}.booleanAnswer`) === value;
              return (
                <label
                  key={value ? 'true' : 'false'}
                  className={clsx(
                    'flex w-full cursor-pointer items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition',
                    selected
                      ? 'border-emerald-400/70 bg-emerald-500/20 text-emerald-100 shadow shadow-emerald-500/25'
                      : 'border-white/12 bg-slate-950/45 text-slate-200 hover:border-emerald-400/40 hover:text-emerald-100'
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
          {booleanError && (
            <p className="text-sm text-rose-300">{booleanError.message}</p>
          )}
        </div>
      )}

      {questionType === 'INPUT' && (
        <div className="space-y-2">
          <label
            htmlFor={inputFieldId}
            className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400"
          >
            Expected answer
          </label>
          <input
            id={inputFieldId}
            {...register(`questions.${index}.inputAnswer`)}
            placeholder="Type the correct answer"
            className="w-full rounded-2xl border border-white/12 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
          />
          {inputError && (
            <p className="text-sm text-rose-300">{inputError.message}</p>
          )}
        </div>
      )}

      {questionType === 'CHECKBOX' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-400">
              Answer options
            </p>
            <button
              type="button"
              onClick={() => appendOption(createEmptyOption())}
              className="rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-fuchsia-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60"
            >
              Add option
            </button>
          </div>

          {optionFields.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/12 bg-slate-950/40 px-4 py-4 text-sm text-slate-400">
              Add answer options and mark the correct ones.
            </p>
          )}

          <div className="space-y-3">
            {optionFields.map((optionField, optionIndex) => (
              <div
                key={optionField.id}
                className="grid gap-3 rounded-2xl border border-white/12 bg-slate-950/50 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <input
                  {...register(
                    `questions.${index}.options.${optionIndex}.text` as const
                  )}
                  placeholder="Option text"
                  className="w-full rounded-xl border border-white/12 bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30"
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
                  className="rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/25 hover:text-rose-100"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {optionError && (
            <p className="text-sm text-rose-300">
              {(optionError as { message?: string })?.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionEditor;

