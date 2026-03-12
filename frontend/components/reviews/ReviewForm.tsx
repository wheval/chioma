'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StarRatingInput } from './StarRatingInput';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review cannot exceed 500 characters'),
});

export type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function ReviewForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ReviewFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const ratingValue = useWatch({ control, name: 'rating' });
  const commentValue = useWatch({ control, name: 'comment' });

  const handleFormSubmit = async (data: ReviewFormData) => {
    try {
      await onSubmit(data);
      reset();
      toast.success('Review submitted successfully!');
    } catch (err) {
      toast.error('Failed to submit review');
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label className="mb-2 block text-sm font-semibold text-slate-900">
          Rate your experience
        </label>
        <StarRatingInput
          value={ratingValue}
          onChange={(val) => setValue('rating', val, { shouldValidate: true })}
          size="lg"
        />
        {errors.rating && (
          <p className="mt-2 text-sm font-medium text-red-500">
            {errors.rating.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="comment"
          className="mb-2 block text-sm font-semibold text-slate-900"
        >
          Write a detailed review
        </label>
        <textarea
          id="comment"
          rows={4}
          className={`
            w-full resize-none rounded-xl border px-4 py-3 transition focus:outline-hidden focus:ring-2 focus:ring-slate-200
            ${
              errors.comment
                ? 'border-red-300 focus:border-red-500'
                : 'border-slate-200 focus:border-slate-400 hover:border-slate-300'
            }
          `}
          placeholder="Share details of your own experience at this place..."
          {...register('comment')}
        />
        <div className="mt-2 flex items-center justify-between">
          {errors.comment ? (
            <p className="text-sm font-medium text-red-500">
              {errors.comment.message}
            </p>
          ) : (
            <span className="text-xs text-slate-500">
              Your feedback will be published publicly.
            </span>
          )}
          <span className="text-xs font-medium text-slate-400">
            {commentValue.length}/500
          </span>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || ratingValue === 0}
          className="flex min-w-[140px] items-center justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
}
