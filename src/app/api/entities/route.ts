import { NextRequest, NextResponse } from "next/server";
import { db, initDb, seedEntities } from "@/lib/db";

let dbInitialized = false;

async function ensureDb() {
  if (!dbInitialized) {
    await initDb();
    await seedEntities();
    dbInitialized = true;
  }
}

// GET /api/entities?q=search&category=restaurant
export async function GET(req: NextRequest) {
  await ensureDb();

  const q = req.nextUrl.searchParams.get("q");
  const category = req.nextUrl.searchParams.get("category");

  let result;
  if (q) {
    result = await db.execute({
      sql: `SELECT e.*,
            COALESCE(COUNT(r.id), 0) as review_count,
            COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
            FROM entities e
            LEFT JOIN reviews r ON e.id = r.entity_id
            WHERE e.name LIKE ?
            ${category ? "AND e.category = ?" : ""}
            GROUP BY e.id
            ORDER BY review_count DESC`,
      args: category ? [`%${q}%`, category] : [`%${q}%`],
    });
  } else {
    result = await db.execute({
      sql: `SELECT e.*,
            COALESCE(COUNT(r.id), 0) as review_count,
            COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
            FROM entities e
            LEFT JOIN reviews r ON e.id = r.entity_id
            ${category ? "WHERE e.category = ?" : ""}
            GROUP BY e.id
            ORDER BY review_count DESC`,
      args: category ? [category] : [],
    });
  }

  return NextResponse.json({ entities: result.rows });
}
