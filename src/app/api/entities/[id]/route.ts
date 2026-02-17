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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDb();

  const { id } = await params;

  const entity = await db.execute({
    sql: `SELECT e.*,
          COALESCE(COUNT(r.id), 0) as review_count,
          COALESCE(ROUND(AVG(r.rating), 1), 0) as avg_rating
          FROM entities e
          LEFT JOIN reviews r ON e.id = r.entity_id
          WHERE e.id = ?
          GROUP BY e.id`,
    args: [id],
  });

  if (entity.rows.length === 0) {
    return NextResponse.json({ error: "Entity not found" }, { status: 404 });
  }

  const reviews = await db.execute({
    sql: `SELECT * FROM reviews WHERE entity_id = ? ORDER BY created_at DESC`,
    args: [id],
  });

  return NextResponse.json({
    entity: entity.rows[0],
    reviews: reviews.rows,
  });
}
