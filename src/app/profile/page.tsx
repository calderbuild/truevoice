"use client";

import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { ReviewCard } from "@/components/ReviewCard";
import { useRouter } from "next/navigation";

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

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      let addr = "demo-wallet";

      if (MiniKit.isInstalled()) {
        try {
          const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
            nonce: crypto.randomUUID(),
          });
          if (finalPayload.status === "success") {
            addr = finalPayload.address;
          }
        } catch {
          // Fallback to demo wallet
        }
      }

      setWalletAddress(addr);

      try {
        const res = await fetch(`/api/reviews?wallet_address=${addr}`);
        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const onChainCount = reviews.filter((r) => r.tx_hash).length;

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-muted p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">My Profile</h1>
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Profile card */}
        <div className="card p-6 mb-6 text-center animate-in">
          <div className="verified-badge w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-bold text-[15px] tracking-tight mb-0.5">Verified Human</p>
          <p className="text-[12px] text-muted font-medium mb-5">
            {walletAddress ? shortenAddress(walletAddress) : "..."}
          </p>

          <div className="flex justify-center gap-8">
            <div className="text-center">
              <p className="text-[22px] font-bold tracking-tight">{reviews.length}</p>
              <p className="text-[11px] text-muted font-medium">Reviews</p>
            </div>
            <div className="w-px h-10 bg-[var(--tv-border)]" />
            <div className="text-center">
              <p className="text-[22px] font-bold tracking-tight">{onChainCount}</p>
              <p className="text-[11px] text-muted font-medium">On-chain</p>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[15px] tracking-tight">My Reviews</h3>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-36" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted mb-5">
              You haven&apos;t written any reviews yet.
            </p>
            <button
              onClick={() => router.push("/write")}
              className="btn-primary"
            >
              Write Your First Review
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onClick={() => router.push(`/entity/${review.entity_id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
