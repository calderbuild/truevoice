"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import Link from "next/link";

interface Entity {
  id: string;
  name: string;
  category: string;
  address: string;
  review_count: number;
  avg_rating: number;
}

interface Review {
  id: number;
  entity_id: string;
  entity_name: string;
  entity_category: string;
  rating: number;
  text: string;
  wallet_address: string;
  review_hash: string;
  tx_hash: string | null;
  created_at: string;
}

const categoryEmoji: Record<string, string> = {
  restaurant: "\uD83C\uDF7D\uFE0F",
  attraction: "\uD83C\uDFDB\uFE0F",
  event: "\uD83C\uDF89",
  service: "\uD83D\uDEE0\uFE0F",
};

const categoryLabel: Record<string, string> = {
  restaurant: "Restaurant",
  attraction: "Attraction",
  event: "Event",
  service: "Service",
};

export default function EntityPage() {
  const params = useParams();
  const router = useRouter();
  const entityId = params.id as string;

  const [entity, setEntity] = useState<Entity | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;

    fetch(`/api/entities/${entityId}`)
      .then((r) => r.json())
      .then((data) => {
        setEntity(data.entity || null);
        setReviews(data.reviews || []);
      })
      .catch((err) => console.error("Failed to load entity:", err))
      .finally(() => setLoading(false));
  }, [entityId]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-muted p-1 -ml-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div className="skeleton h-5 w-32" />
          </div>
        </header>
        <main className="px-4 pt-4">
          <div className="skeleton h-44 mb-4" />
          <div className="skeleton h-36 mb-3" />
          <div className="skeleton h-36" />
        </main>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <p className="text-lg font-bold tracking-tight mb-2">Place not found</p>
        <button
          onClick={() => router.push("/")}
          className="btn-primary mt-4"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating - 1]++;
  });
  const maxCount = Math.max(...ratingCounts, 1);

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold tracking-tight truncate">{entity.name}</h1>
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Entity info card */}
        <div className="card p-5 mb-4 animate-in">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">
              {categoryEmoji[entity.category] || "\uD83D\uDCCD"}
            </span>
            <div>
              <h2 className="text-[17px] font-bold tracking-tight">{entity.name}</h2>
              <p className="text-[12px] text-muted font-medium">
                {categoryLabel[entity.category] || entity.category}
                {entity.address && ` \u00B7 ${entity.address}`}
              </p>
            </div>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-5 mb-5">
            <div className="text-center">
              <p className="text-[32px] font-bold tracking-tight leading-none">
                {entity.avg_rating > 0 ? entity.avg_rating.toFixed(1) : "--"}
              </p>
              <div className="mt-1">
                <StarRating rating={Math.round(entity.avg_rating)} size="sm" />
              </div>
              <p className="text-[11px] text-muted mt-1 font-medium">
                {entity.review_count} {entity.review_count === 1 ? "review" : "reviews"}
              </p>
            </div>

            {/* Rating bars */}
            {entity.review_count > 0 && (
              <div className="flex-1 flex flex-col gap-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[11px] text-muted w-3 font-medium">{star}</span>
                    <div className="rating-bar flex-1">
                      <div
                        className="rating-bar-fill"
                        style={{
                          width: `${(ratingCounts[star - 1] / maxCount) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] text-muted w-5 text-right font-medium">
                      {ratingCounts[star - 1]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write review CTA */}
          <Link
            href="/write"
            className="btn-primary block w-full text-center"
          >
            Write a Review
          </Link>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[15px] tracking-tight">Reviews</h3>
          <span className="text-[12px] text-muted font-medium">{reviews.length} verified</span>
        </div>

        <div className="flex flex-col gap-3 stagger">
          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-muted">
                No reviews yet. Be the first to review this place!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showEntity={false} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
