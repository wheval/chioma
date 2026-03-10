'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ClipboardCheck, Star } from 'lucide-react';
import { ReviewList } from '@/components/reviews/ReviewList';
import type { ReviewFormData } from '@/components/reviews/ReviewForm';
import { useAuth } from '@/store/authStore';
import {
  buildRatingStats,
  type DashboardReview,
  loadReviewWorkspace,
  submitReview,
  type ReviewTarget,
} from '@/lib/dashboard-data';

export default function LandlordReviewsPage() {
  const { user } = useAuth();
  const [targets, setTargets] = useState<ReviewTarget[]>([]);
  const [reviews, setReviews] = useState<DashboardReview[]>([]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      const workspace = await loadReviewWorkspace('landlord');
      if (active) {
        setTargets(workspace.targets);
        setReviews(workspace.reviews);
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const handleSubmitReview = async (data: ReviewFormData) => {
    const activeTarget = targets[0];
    if (!activeTarget) return;

    await submitReview(activeTarget, data);

    setReviews((current) => [
      {
        id: `review-${Date.now()}`,
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date().toISOString(),
        propertyName: activeTarget.propertyName,
        context: activeTarget.context,
        author: {
          id: user?.id ?? 'landlord-user',
          name: 'You',
          isVerified: true,
          role: 'LANDLORD',
        },
      },
      ...current,
    ]);

    setTargets((current) => current.slice(1));
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
          Review System
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Capture tenant ratings without leaving the landlord dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-300">
          The backend review module already existed, but the dashboard did not
          expose it. This page turns rating and feedback into a visible workflow
          for lease milestones and maintenance outcomes.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <HeaderCard
            icon={<ClipboardCheck className="h-5 w-5 text-emerald-300" />}
            label="Pending review prompts"
            value={`${targets.length}`}
          />
          <HeaderCard
            icon={<Star className="h-5 w-5 text-amber-300" />}
            label="Reviews submitted"
            value={`${reviews.length}`}
          />
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Upcoming review prompts
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          These prompts are ready for submission with the review form below.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {targets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
              No pending prompts right now.
            </div>
          ) : (
            targets.map((target) => (
              <div
                key={target.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {target.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {target.propertyName} • {target.context}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                    {target.role}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500">{target.dueLabel}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <ReviewList
        reviews={reviews}
        stats={buildRatingStats(reviews)}
        onSubmitReview={handleSubmitReview}
        title="Submitted landlord reviews"
        subtitle="Rate tenants and maintenance interactions directly from the dashboard."
      />
    </div>
  );
}

function HeaderCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
        {icon}
      </div>
      <p className="mt-4 text-sm font-medium text-slate-300">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}
