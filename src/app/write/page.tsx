"use client";

import { useEffect, useState } from "react";
import { MiniKit, VerifyCommandInput, VerificationLevel } from "@worldcoin/minikit-js";
import { StarRating } from "@/components/StarRating";
import { useRouter } from "next/navigation";

interface Entity {
  id: string;
  name: string;
  category: string;
}

const categoryEmoji: Record<string, string> = {
  restaurant: "\uD83C\uDF7D\uFE0F",
  attraction: "\uD83C\uDFDB\uFE0F",
  event: "\uD83C\uDF89",
  service: "\uD83D\uDEE0\uFE0F",
};

type Step = "select" | "write" | "verify" | "submitting" | "done";

export default function WritePage() {
  const router = useRouter();
  const [entities, setEntities] = useState<Entity[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [step, setStep] = useState<Step>("select");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/entities")
      .then((r) => r.json())
      .then((data) => setEntities(data.entities || []))
      .catch(() => setError("Failed to load places"));
  }, []);

  const filteredEntities = entities.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function selectEntity(entity: Entity) {
    setSelectedEntity(entity);
    setStep("write");
    setError("");
  }

  function canSubmit() {
    return rating > 0 && text.trim().length >= 10 && text.trim().length <= 280;
  }

  async function handleSubmit() {
    if (!selectedEntity || !canSubmit()) return;

    setError("");
    setStep("verify");

    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    if (isDemoMode) {
      await submitReview(null);
      return;
    }

    if (!MiniKit.isInstalled()) {
      setError("Please open this app in World App");
      setStep("write");
      return;
    }

    try {
      const verifyPayload: VerifyCommandInput = {
        action: `review-${selectedEntity.id}`,
        verification_level: VerificationLevel.Orb,
      };

      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload);

      if (finalPayload.status === "error") {
        setError("Verification cancelled or failed. Please try again.");
        setStep("write");
        return;
      }

      await submitReview(finalPayload);
    } catch (err) {
      console.error("Verify error:", err);
      setError("Verification failed. Please try again.");
      setStep("write");
    }
  }

  async function submitReview(proof: unknown) {
    if (!selectedEntity) return;
    setStep("submitting");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_id: selectedEntity.id,
          rating,
          text: text.trim(),
          wallet_address: (MiniKit as unknown as { walletAddress?: string }).walletAddress || "demo-wallet",
          proof,
          action: `review-${selectedEntity.id}`,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Submission failed");
        setStep("write");
        return;
      }

      setStep("done");
    } catch (err) {
      console.error("Submit error:", err);
      setError("Network error. Please try again.");
      setStep("write");
    }
  }

  // Step: Select entity
  if (step === "select") {
    return (
      <div className="min-h-screen pb-20">
        <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-3 pb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-muted p-1 -ml-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h1 className="text-[17px] font-bold tracking-tight">Choose a Place</h1>
          </div>
        </header>

        <main className="px-4 pt-4">
          <input
            type="text"
            placeholder="Search places..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field mb-4"
          />

          <div className="flex flex-col gap-2 stagger">
            {filteredEntities.map((entity) => (
              <button
                key={entity.id}
                onClick={() => selectEntity(entity)}
                className="card flex items-center gap-3.5 p-4 text-left"
              >
                <span className="text-2xl">
                  {categoryEmoji[entity.category] || "\uD83D\uDCCD"}
                </span>
                <div>
                  <p className="font-semibold text-[14px] tracking-tight">{entity.name}</p>
                  <p className="text-[12px] text-muted capitalize font-medium">
                    {entity.category}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {filteredEntities.length === 0 && (
            <p className="text-center text-sm text-muted py-8">
              No places found
            </p>
          )}
        </main>
      </div>
    );
  }

  // Step: Done
  if (step === "done") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in">
        <div className="verified-badge w-16 h-16 rounded-full flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-verified">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-xl font-bold tracking-tight mb-2">Review Submitted</h1>
        <p className="text-sm text-muted mb-6 leading-relaxed max-w-[260px]">
          Your verified review for {selectedEntity?.name} is being recorded on-chain.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/")}
            className="bg-secondary text-foreground text-[13px] font-semibold px-5 py-2.5 rounded-full"
          >
            Back to Feed
          </button>
          <button
            onClick={() => router.push(`/entity/${selectedEntity?.id}`)}
            className="btn-primary"
          >
            View Place
          </button>
        </div>
      </div>
    );
  }

  // Step: Verify / Submitting
  if (step === "verify" || step === "submitting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in">
        <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-accent animate-pulse">
            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight mb-2">
          {step === "verify" ? "Verifying Identity..." : "Submitting Review..."}
        </h1>
        <p className="text-sm text-muted leading-relaxed">
          {step === "verify"
            ? "Please complete verification in World App"
            : "Recording your verified review..."}
        </p>
      </div>
    );
  }

  // Step: Write review
  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-10 header-blur border-b border-[var(--tv-border)] px-4 pt-3 pb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("select")} className="text-muted p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-[17px] font-bold tracking-tight">Write Review</h1>
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* Selected entity */}
        <div className="card p-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {categoryEmoji[selectedEntity?.category || ""] || "\uD83D\uDCCD"}
            </span>
            <div>
              <p className="font-semibold text-[14px] tracking-tight">{selectedEntity?.name}</p>
              <p className="text-[12px] text-muted capitalize font-medium">
                {selectedEntity?.category}
              </p>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-6">
          <label className="text-[13px] font-semibold mb-2.5 block tracking-tight">Your Rating</label>
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          {rating === 0 && (
            <p className="text-[12px] text-muted mt-1.5 font-medium">Tap a star to rate</p>
          )}
        </div>

        {/* Review text */}
        <div className="mb-6">
          <label className="text-[13px] font-semibold mb-2.5 block tracking-tight">Your Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your experience... (10-280 characters)"
            maxLength={280}
            rows={4}
            className="input-field resize-none"
          />
          <div className="flex justify-between mt-1.5">
            <p className={`text-[11px] font-medium ${text.length < 10 ? "text-warning" : "text-muted"}`}>
              {text.length < 10 ? `${10 - text.length} more chars needed` : ""}
            </p>
            <p className="text-[11px] text-muted font-medium">{text.length}/280</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/8 border border-error/20 text-error rounded-xl px-4 py-3 text-[13px] mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          className="btn-primary w-full !py-3.5"
        >
          Verify & Submit Review
        </button>

        <p className="text-center text-[11px] text-muted mt-3 font-medium leading-relaxed">
          Your identity will be verified with World ID.
          One review per person per place.
        </p>
      </main>
    </div>
  );
}
