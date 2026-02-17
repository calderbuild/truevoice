"use client";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "text-[13px] gap-[1px]",
  md: "text-lg gap-[2px]",
  lg: "text-[28px] gap-[3px]",
};

export function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className={`flex ${sizeClasses[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && onChange?.(star)}
          className={`${
            interactive
              ? "cursor-pointer active:scale-125 hover:scale-110"
              : "cursor-default"
          } transition-transform duration-150`}
        >
          <span className={star <= rating ? "text-star" : "text-muted/20"}>
            {star <= rating ? "\u2605" : "\u2606"}
          </span>
        </button>
      ))}
    </div>
  );
}
