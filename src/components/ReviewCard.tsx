"use client";

import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: {
    id: number;
    entity_id: string;
    entity_name?: string;
    entity_category?: string;
    rating: number;
    text: string;
    wallet_address: string;
    review_hash: string;
    tx_hash: string | null;
    created_at: string;
  };
  showEntity?: boolean;
  onClick?: () => void;
}

function shortenAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

const categoryEmoji: Record<string, string> = {
  restaurant: "\uD83C\uDF7D\uFE0F",
  attraction: "\uD83C\uDFDB\uFE0F",
  event: "\uD83C\uDF89",
  service: "\uD83D\uDEE0\uFE0F",
};

export function ReviewCard({
  review,
  showEntity = true,
  onClick,
}: ReviewCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-4 animate-in ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {/* Verified badge */}
          <div className="verified-badge w-8 h-8 rounded-full flex items-center justify-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-[13px] font-semibold tracking-tight">
              {shortenAddress(review.wallet_address)}
            </p>
            <p className="text-[11px] text-verified font-medium">Verified Human</p>
          </div>
        </div>
        <span className="text-[11px] text-muted font-medium">{timeAgo(review.created_at)}</span>
      </div>

      {/* Entity name */}
      {showEntity && review.entity_name && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-xs">
            {categoryEmoji[review.entity_category || ""] || ""}
          </span>
          <span className="text-[12px] font-medium text-muted">
            {review.entity_name}
          </span>
        </div>
      )}

      {/* Rating */}
      <div className="mb-2">
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Review text */}
      <p className="text-[14px] leading-[1.6] tracking-tight">{review.text}</p>

      {/* On-chain badge */}
      <div className="mt-3">
        <span className={`chain-pill ${review.tx_hash ? "confirmed" : "pending"}`}>
          <span
            className={`inline-block w-[5px] h-[5px] rounded-full ${
              review.tx_hash ? "bg-success" : "bg-warning animate-pulse"
            }`}
          />
          {review.tx_hash ? "On-chain" : "Confirming..."}
        </span>
      </div>
    </div>
  );
}
