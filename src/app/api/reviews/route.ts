import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { computeReviewHash } from "@/lib/review-hash";
import {
  verifyCloudProof,
  ISuccessResult,
  IVerifyResponse,
} from "@worldcoin/minikit-js";

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    dbInitialized = true;
  }
}

// GET /api/reviews?entity_id=xxx or GET /api/reviews (all)
export async function GET(req: NextRequest) {
  await ensureDb();

  const entityId = req.nextUrl.searchParams.get("entity_id");
  const walletAddress = req.nextUrl.searchParams.get("wallet_address");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

  let result;
  if (entityId) {
    result = await db.execute({
      sql: `SELECT r.*, e.name as entity_name, e.category as entity_category
            FROM reviews r JOIN entities e ON r.entity_id = e.id
            WHERE r.entity_id = ? ORDER BY r.created_at DESC LIMIT ?`,
      args: [entityId, limit],
    });
  } else if (walletAddress) {
    result = await db.execute({
      sql: `SELECT r.*, e.name as entity_name, e.category as entity_category
            FROM reviews r JOIN entities e ON r.entity_id = e.id
            WHERE r.wallet_address = ? ORDER BY r.created_at DESC LIMIT ?`,
      args: [walletAddress, limit],
    });
  } else {
    result = await db.execute({
      sql: `SELECT r.*, e.name as entity_name, e.category as entity_category
            FROM reviews r JOIN entities e ON r.entity_id = e.id
            ORDER BY r.created_at DESC LIMIT ?`,
      args: [limit],
    });
  }

  return NextResponse.json({ reviews: result.rows });
}

// POST /api/reviews - submit a new review
export async function POST(req: NextRequest) {
  await ensureDb();

  try {
    const body = await req.json();
    const { entity_id, rating, text, wallet_address, proof, action } = body;

    // Validate input
    if (!entity_id || !rating || !text || !wallet_address) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (text.length < 10 || text.length > 280) {
      return NextResponse.json(
        { error: "Review text must be 10-280 characters" },
        { status: 400 }
      );
    }

    // Check entity exists
    const entityCheck = await db.execute({
      sql: "SELECT id FROM entities WHERE id = ?",
      args: [entity_id],
    });
    if (entityCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    let nullifier_hash: string;

    // Verify World ID proof (or use demo mode)
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
    if (isDemoMode) {
      // Demo mode: generate a deterministic nullifier from wallet + entity
      nullifier_hash = `demo_${wallet_address}_${entity_id}`;
    } else {
      if (!proof || !action) {
        return NextResponse.json(
          { error: "World ID proof required" },
          { status: 400 }
        );
      }

      // Verify with World ID Cloud API
      const app_id = process.env.NEXT_PUBLIC_APP_ID as `app_${string}`;
      const verifyRes = (await verifyCloudProof(
        proof as ISuccessResult,
        app_id,
        action
      )) as IVerifyResponse;

      if (!verifyRes.success) {
        return NextResponse.json(
          { error: "World ID verification failed" },
          { status: 403 }
        );
      }

      nullifier_hash = proof.nullifier_hash;
    }

    // Check for duplicate review
    const dupCheck = await db.execute({
      sql: "SELECT id FROM reviews WHERE entity_id = ? AND nullifier_hash = ?",
      args: [entity_id, nullifier_hash],
    });
    if (dupCheck.rows.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this entity" },
        { status: 409 }
      );
    }

    // Compute review hash
    const review_hash = computeReviewHash(entity_id, rating, text);

    // Insert review (tx_hash will be updated later when on-chain submission completes)
    await db.execute({
      sql: `INSERT INTO reviews (entity_id, wallet_address, nullifier_hash, rating, text, review_hash)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [entity_id, wallet_address, nullifier_hash, rating, text, review_hash],
    });

    return NextResponse.json({
      success: true,
      review_hash,
      nullifier_hash,
    });
  } catch (error: unknown) {
    console.error("Review submission error:", error);

    // Handle unique constraint violation (duplicate review)
    if (error instanceof Error && error.message.includes("UNIQUE")) {
      return NextResponse.json(
        { error: "You have already reviewed this entity" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
