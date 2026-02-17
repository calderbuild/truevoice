"use client";

import Link from "next/link";
import { StarRating } from "./StarRating";

interface EntityCardProps {
  entity: {
    id: string;
    name: string;
    category: string;
    address?: string;
    review_count: number;
    avg_rating: number;
  };
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

export function EntityCard({ entity }: EntityCardProps) {
  return (
    <Link href={`/entity/${entity.id}`}>
      <div className="card p-4 animate-in cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-lg">
                {categoryEmoji[entity.category] || "\uD83D\uDCCD"}
              </span>
              <h3 className="font-semibold text-[15px] tracking-tight">{entity.name}</h3>
            </div>
            <p className="text-[12px] text-muted mb-2.5 font-medium">
              {categoryLabel[entity.category] || entity.category}
              {entity.address && ` \u00B7 ${entity.address}`}
            </p>
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(entity.avg_rating)} size="sm" />
              <span className="text-[12px] text-muted font-medium">
                {entity.avg_rating > 0 ? entity.avg_rating.toFixed(1) : "--"} ({entity.review_count}{" "}
                {entity.review_count === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-muted/40 mt-1 flex-shrink-0"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
