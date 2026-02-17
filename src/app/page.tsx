"use client";

import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { ReviewCard } from "@/components/ReviewCard";
import { EntityCard } from "@/components/EntityCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tab = "feed" | "places";

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

interface Entity {
  id: string;
  name: string;
  category: string;
  address: string;
  review_count: number;
  avg_rating: number;
}

export default function Home() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("feed");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWorldApp, setIsWorldApp] = useState(true);

  useEffect(() => {
    const installed = MiniKit.isInstalled();
    setIsWorldApp(installed);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [reviewsRes, entitiesRes] = await Promise.all([
        fetch("/api/reviews?limit=20"),
        fetch("/api/entities"),
      ]);
      const reviewsData = await reviewsRes.json();
      const entitiesData = await entitiesRes.json();
      setReviews(reviewsData.reviews || []);
      setEntities(entitiesData.entities || []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }

  if (!isWorldApp && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-accent-light flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Open in World App</h1>
        <p className="text-muted text-sm leading-relaxed max-w-[260px]">
          TrueVoice runs inside World App. Open this link in your World App to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-[20px] font-bold tracking-tight">TrueVoice</h1>
            <p className="text-[12px] text-muted font-medium">Reviews by verified humans</p>
          </div>
          <Link
            href="/write"
            className="btn-primary !py-2 !px-5 !text-[13px]"
          >
            + Review
          </Link>
        </div>

        {/* Tabs */}
        <div className="tab-group">
          <button
            onClick={() => setTab("feed")}
            className={`tab-item ${tab === "feed" ? "active" : ""}`}
          >
            Latest Reviews
          </button>
          <button
            onClick={() => setTab("places")}
            className={`tab-item ${tab === "places" ? "active" : ""}`}
          >
            Places
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-36" />
            ))}
          </div>
        ) : tab === "feed" ? (
          <div className="flex flex-col gap-3 stagger">
            {reviews.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="font-semibold text-[15px] tracking-tight mb-1">No reviews yet</h2>
                <p className="text-sm text-muted mb-5">
                  Be the first to share a verified review
                </p>
                <Link href="/write" className="btn-primary inline-block">
                  Write a Review
                </Link>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onClick={() => router.push(`/entity/${review.entity_id}`)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {entities.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm text-muted">No places found</p>
              </div>
            ) : (
              entities.map((entity) => (
                <EntityCard key={entity.id} entity={entity} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
